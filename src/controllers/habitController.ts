import { and, desc, eq } from 'drizzle-orm'
import type { Response } from 'express'
import { db } from '../db/connection.ts'
import { entries, habits, habitTags } from '../db/schema.ts'
import type { AuthenticatedRequest } from '../middleware/auth.ts'

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, frequency, targetCount, tagIds } = req.body

    const userId = req.user!.id

    // Start a transaction for data consistency
    const result = await db.transaction(async (tx) => {
      //create the habit
      const [newHabit] = await tx
        .insert(habits)
        .values({
          userId,
          name,
          description,
          frequency,
          targetCount,
        })
        .returning()

      // If tags are provided , create the associations
      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId: string) => ({
          habitId: newHabit.id,
          tagId,
        }))
        await tx.insert(habitTags).values(habitTagValues)
      }
      return newHabit
    })

    res.status(201).json({
      message: 'Habit created successfully',
      habit: result,
    })
  } catch (error) {
    console.error('Create Habit error:', error)
    res.status(500).json({ error: 'Failed to create habit' })
  }
}

export const getUserHabits = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    // User is guaranteed to exist after auth middleware
    const userId = req.user!.id

    // Query habits with their tags using relations
    const userHabitsWithTags = await db.query.habits.findMany({
      where: eq(habits.userId, userId),
      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(habits.createdAt)],
    })

    // Transform the data to include tags directly
    const habitsWithTags = userHabitsWithTags.map((habit) => ({
      ...habit,
      tags: habit.habitTags.map((ht) => ht.tag),
      habitTags: undefined,
    }))

    res.json({
      habits: habitsWithTags,
    })
  } catch (error) {
    console.error('Get habits error:', error)
    res.status(500).json({ error: 'Failed to fetch habits' })
  }
}

export const getHabitById = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, id), eq(habits.userId, userId)),
      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
        entries: {
          orderBy: [desc(entries.completionData)],
          limit: 10,
        },
      },
    })

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    // Transform the data
    const habitWithTags = {
      ...habit,
      tags: habit.habitTags.map((ht) => ht.tag),
      habitTags: undefined,
    }

    res.json({
      habit: habitWithTags,
    })
  } catch (error) {
    console.error('Get habit error:', error)
    res.status(500).json({ error: 'Failed to fetch habit' })
  }
}

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const { tagIds, ...updates } = req.body

    const result = await db.transaction(async (tx) => {
      //Update the habit
      const [updatedHabit] = await tx
        .update(habits)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(eq(habits.id, id), eq(habits.userId, userId)))
        .returning()

      if (!updatedHabit) {
        throw new Error('Habit not found')
      }

      //If tagIds are provided, update the associations
      if (tagIds !== undefined) {
        //Remove existing tags
        await tx.delete(habitTags).where(eq(habitTags.habitId, id))

        // Add new tags
        if (tagIds.length > 0) {
          const habitTagValues = tagIds.map((tagId: string) => ({
            habitId: id,
            tagId,
          }))
          await tx.insert(habitTags).values(habitTagValues)
        }
      }
      return updatedHabit
    })

    res.json({
      message: 'Habit updated successfully',
      habit: result,
    })
  } catch (error: any) {
    if (error.message === 'Habit not found') {
      return res.status(404).json({ error: 'Habit not found' })
    }
    console.error('Updated habit error:', error)
    res.status(500).json({ error: 'Failed to update habit' })
  }
}

export const deleteHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const [deletedHabit] = await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning()

    if (!deletedHabit) {
      return res.status(404).json({ error: 'Habit not found' })
    }
    res.json({
      message: 'Habit deleted successfully',
    })
  } catch (error) {
    console.error('Delete habit error:', error)
    res.status(500).json({ error: 'Failed to delete habit' })
  }
}

export const addTagsToHabit = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params
    const { tagIds } = req.body
    const userId = req.user!.id

    //Verify habit belongs to user
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    // Get existing tags for this habit
    const existingTags = await db
      .select()
      .from(habitTags)
      .where(eq(habitTags.habitId, id))

    const existingTagIds = existingTags.map((t) => t.tagId)

    const newTagIds = tagIds.filter(
      (tagId: string) => !existingTagIds.includes(tagId),
    )

    if (newTagIds.length > 0) {
      const habitTagsValues = newTagIds.map((tagId: string) => ({
        habitId: id,
        tagId,
      }))
      await db.insert(habitTags).values(habitTagsValues)
    }

    res.json({
      message: 'Tags added to habit successfully',
    })
  } catch (error) {
    console.error('Add tags to habit error:', error)
    res.status(500).json({ error: 'Failed to add tags to habit' })
  }
}

export const getHabitsByTag = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { tagId } = req.params
    const userId = req.user!.id

    const habitsByTag = await db.query.habitTags.findMany({
      where: eq(habitTags.tagId, tagId),
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
    })

    const userHabits = habitsByTag
      .filter((ht) => ht.habit.userId === userId)
      .map((ht) => ({
        ...ht.habit,
        tags: ht.habit.habitTags.map((ht) => ht.tag),
        habitTags: undefined,
      }))

    res.json({
      habits: userHabits,
    })
  } catch (error) {
    console.error('Get habits by tagId error:', error)
    res.status(500).json({ error: 'Failed to fetch habits by tagId' })
  }
}

export const logHabitCompletion = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params
    const { note } = req.body
    const userId = req.user!.id

    //Verify habit belongs to user
    const [habit] = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, userId))

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    const [newLog] = await db
      .insert(entries)
      .values({
        habitId: id,
        completionData: new Date(),
        note,
      })
      .returning()

    res.status(201).json({
      message: 'Habit completion logged',
      log: newLog,
    })
  } catch (error) {
    console.error('Log habit completion error:', error)
    res.status(500).json({ error: 'Failed to log habit completion' })
  }
}

export const completeHabit = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params
    const { note } = req.body
    const userId = req.user!.id

    //Verify habit belongs to user
    const [habit] = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, userId))

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    if (!habit.isActive) {
      return res
        .status(400)
        .json({ error: 'Cannot complete an inactive habit' })
    }

    //Create new completion entry
    const [newEntry] = await db
      .insert(entries)
      .values({
        habitId: id,
        completionData: new Date(),
        note,
      })
      .returning()

    res.status(201).json({
      message: 'Habit complete successfully',
      entry: newEntry,
    })
  } catch (error) {
    console.error('Complete habit error:', error)
    res.status(500).json({ error: 'Failed to complete habit' })
  }
}
