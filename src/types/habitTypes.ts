import z from 'zod'
import { habits } from '../db/schema.ts'

// Infer types from schema
export type Habit = typeof habits.$inferSelect
export type NewHabit = typeof habits.$inferInsert

// Usage in functions
// const createHabit = async (habitData: NewHabit): Promise<Habit> => {
//   const [habit] = await db.insert(habits).values(habitData).returning()
//   return habit
// }

// Auto-generated Zod schemas from Drizzle tables
// export const insertHabitSchema = createInsertSchema(habits)
// export const selectHabitSchema = createSelectSchema(habits)

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly'], {
    error: () => ({
      message: 'Frequency must be daily, weekly, or monthly',
    }),
  }),
  targetCount: z.number().int().positive().optional().default(1),
  tagIds: z.array(z.uuid()).optional(),
})

export const UpdateHabitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  targetCount: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  tagIds: z.array(z.uuid()).optional(),
})

export const habitIdSchema = z.object({
  id: z.uuid('Invalid Habit ID format'),
})

export const habitCompleteSchema = z.object({ note: z.string().optional() })

export const addTagsSchema = z.object({ tagIds: z.array(z.uuid()).min(1) })

export const getHabitByTagSchema = z.object({ tagId: z.uuid().nonempty() })

export const habitTagSchema = z.object({
  id: z.uuid('Invalid habit ID format'),
  tagId: z.uuid('Invalid tag ID format'),
})
