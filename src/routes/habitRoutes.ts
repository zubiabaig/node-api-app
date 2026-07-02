import { Router } from 'express'
import {
  addTagsToHabit,
  createHabit,
  deleteHabit,
  getHabitById,
  getHabitsByTag,
  getUserHabits,
  updateHabit,
} from '../controllers/habitController.ts'
import { authenticateToken } from '../middleware/auth.ts'
import { validateBody, validateParams } from '../middleware/validation.ts'
import {
  createHabitSchema,
  getHabitByTagSchema,
  habitCompleteSchema,
  habitTagIdsSchema,
  uuidSchema,
} from '../types/habitTypes.ts'

const router = Router()

// Apply authentication to All routes in this router
router.use(authenticateToken)

//All routes below are now protected

//Habit-specific CRUD routes

router.get('/', getUserHabits)

router.get('/:id', validateParams(uuidSchema), getHabitById)

router.post('/', validateBody(createHabitSchema), createHabit)

router.put('/:id', validateParams(uuidSchema), updateHabit)

router.delete('/:id', validateParams(uuidSchema), deleteHabit)

//Habit completion routes
router.post(
  '/:id/complete',
  validateParams(uuidSchema),
  validateBody(habitCompleteSchema),
  // completeHabit,
)

// Tag relationship routes
router.get('/tag/:tagId', validateParams(getHabitByTagSchema), getHabitsByTag)

router.get(
  '/:id/tags',
  validateParams(uuidSchema),
  validateBody(habitTagIdsSchema),
  addTagsToHabit,
)

export default router
