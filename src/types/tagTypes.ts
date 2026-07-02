import z from 'zod'

export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Name too long'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be valid hex color')
    .optional(),
})

export const updateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be valid hex color')
    .optional(),
})

export const tagIdSchema = z.object({
  id: z.uuid('Invalid tag ID format'),
})
