import { eq } from 'drizzle-orm'
import type { Response } from 'express'
import { db } from '../db/connection.ts'
import { tags } from '../db/schema.ts'
import type { AuthenticatedRequest } from '../middleware/auth.ts'

export const createTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, color } = req.body

    // Check if tag with same name already exists

    const existingTag = await db.query.tags.findFirst({
      where: eq(tags.name, name),
    })

    if (existingTag) {
      return res.status(409).json({ error: 'Tag with this name already exist' })
    }

    const [newTag] = await db
      .insert(tags)
      .values({
        name,
        color: color || '#6B7280',
      })
      .returning()

    res.status(201).json({
      message: 'Tag created successfully',
      tag: newTag,
    })
  } catch (error) {
    console.error('Create tag error:', error)
    res.status(500).json({ error: 'Failed to create tag' })
  }
}

export const getTags = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allTags = await db.select().from(tags).orderBy(tags.name)

    res.json({
      tags: allTags,
    })
  } catch (error) {
    console.error('Get tags error:', error)
    res.status(500).json({ error: 'Failed to fetch tags' })
  }
}

export const getTagById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params

    const tag = await db.query.tags.findFirst({
      where: eq(tags.id, id),
      with: {
        habitTags: {
          with: {
            habit: {
              columns: {
                id: true,
                name: true,
                description: true,
                isActive: true,
              },
            },
          },
        },
      },
    })

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' })
    }

    // Transform the data
    const tagWithHabits = {
      ...tag,
      habits: tag.habitTags.map((ht) => ht.habit),
      habitTags: undefined,
    }

    res.json({
      tag: tagWithHabits,
    })
  } catch (error) {
    console.error('Get tag error:', error)
    res.status(500).json({ error: 'Failed to fetch tag' })
  }
}

export const updateTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const { name, color } = req.body

    // if updating name, check if new name already exists
    if (name) {
      const existingTag = await db.query.tags.findFirst({
        where: eq(tags.name, name),
      })

      if (existingTag && existingTag.id !== id) {
        return res
          .status(409)
          .json({ error: 'Tag with this name already exists' })
      }
    }

    const [updatedTag] = await db
      .update(tags)
      .set({
        ...(name && { name }),
        ...(color && { color }),
        updatedAt: new Date(),
      })
      .where(eq(tags.id, id))
      .returning()

    if (!updatedTag) {
      return res.status(404).json({ error: 'Tag not found' })
    }

    res.json({
      message: 'Tag updated successfully',
      tag: updatedTag,
    })
  } catch (error) {
    console.error('Update tag error:', error)
    res.status(500).json({ error: 'Failed to update tag' })
  }
}
export const deleteTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params

    const [deletedTag] = await db
      .delete(tags)
      .where(eq(tags.id, id))
      .returning()

    if (!deletedTag) {
      return res.status(404).json({ error: 'Tag not found' })
    }

    res.json({
      message: 'Tag deleted successfully',
    })
  } catch (error) {
    console.error('Delete tag error:', error)
    res.status(500).json({ error: 'Failed to delete tag' })
  }
}

export const getPopularTags = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    //Get all tags with their usage count
    const tagsWithCount = await db.query.tags.findMany({
      with: {
        habitTags: true,
      },
    })

    //Transform and sort by usage count
    const popularTags = tagsWithCount
      .map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        usageCount: tag.habitTags.length,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10) // Top 10 most popular tags

    res.json({
      tags: popularTags,
    })
  } catch (error) {
    console.error('Get popular tags error:', error)
    res.status(500).json({ error: 'Failed to fetch popular tags' })
  }
}

export const getTagHabits = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const tagWithHabits = await db.query.tags.findFirst({
      where: eq(tags.id, id),
      with: {
        habitTags: {
          with: {
            habit: {
              with: {
                habitTags: {
                  with: {
                    tag: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!tagWithHabits) {
      return res.status(404).json({ error: 'Tag not found' })
    }

    //Filter habits by User and transform
    const userHabits = tagWithHabits.habitTags
      .filter((ht) => ht.habit.userId === userId)
      .map((ht) => ({
        ...ht.habit,
        tag: ht.habit.habitTags.map((ht) => ht.tag),
        habitTags: undefined,
      }))

    res.json({
      tag: {
        id: tagWithHabits.id,
        name: tagWithHabits.name,
        color: tagWithHabits.color,
      },
      habits: userHabits,
    })
  } catch (error) {
    console.error('Get tag habits error:', error)
    res.status(500).json({ error: 'Failed to fetch habits for tag' })
  }
}
