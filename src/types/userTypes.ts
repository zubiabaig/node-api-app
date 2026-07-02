import z from 'zod'
import { users } from '../db/schema.ts'

// Infer types from schema
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// Usage in functions
// const createUser = async (userData: NewUser): Promise<User> => {
//   const [user] = await db.insert(users).values(userData).returning()
//   return user
// }

// Auto-generated Zod schemas from Drizzle tables
// export const insertUserSchema = createInsertSchema(users)
// export const selectUserSchema = createSelectSchema(users)

// Customize validation
// export const createUserSchema = insertUserSchema.extend({
//    email: z.email(),
//   password: z.string().min(8),
// })

//Define validation schemas
export const updateProfileSchema = z.object({
  email: z.email('Invalid email format'),
  username: z.string().min(1, 'Username is required'),
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number',
    ),
})

export const userIdParamSchema = z.object({
  id: z.uuid('Invalid User ID format'),
})

// Use in API validation
// app.post('/users', validateBody(createUserSchema), ;async (req, res) => {
// req.body is fully typed and validated
//   const user = await createUser(req.body)
//   res.json(user)
// })

// Get user with all their habits and tags
// const userWithData = await db.query.users.findFirst({
//   where: eq(users.id, userId),
//   with: {
//     habits: {
//       with: {
//         entries: true,
//         habitTags: {
//           with: {
//             tag: true
//           }
//         }
//       }
//     }
//   }
// })

// Result has perfect TypeScript types:
// user.habits[0].entries[0].note           // ✅ string | null
// user.habits[0].habitTags[0].tag.color    // ✅ string
// Query only active users
// const activeUsers = await db.query.users.findMany({
//   where: isNull(users.deletedAt)
// })

// Soft delete
// const deleteUser = async (id: string) => {
//   await db.update(users)
//     .set({ deletedAt: new Date() })
//     .where(eq(users.id, id))
// }

// Update with audit info
// const updateHabit = async (id: string, changes: Partial<Habit>, userId: string) => {
//   await db.update(habits)
//     .set({ ...changes, updatedBy: userId, updatedAt: new Date() })
//     .where(eq(habits.id, id))
// }
