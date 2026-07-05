import { Router } from 'express'
import {
  addTagsToHabit,
  completeHabit,
  createHabit,
  deleteHabit,
  getHabitById,
  getHabitsByTag,
  getUserHabits,
  logHabitCompletion,
  updateHabit,
} from '../controllers/habitController.ts'
import { authenticateToken } from '../middleware/auth.ts'
import { validateBody, validateParams } from '../middleware/validation.ts'
import {
  addTagsSchema,
  createHabitSchema,
  getHabitByTagSchema,
  habitCompleteSchema,
  habitIdSchema,
  habitTagSchema,
} from '../types/habitTypes.ts'

const router = Router()

// Apply authentication to All routes in this router
router.use(authenticateToken)

//All routes below are now protected

//Habit-specific CRUD routes

router.get('/', getUserHabits)

router.get('/:id', validateParams(habitIdSchema), getHabitById)

router.post('/', validateBody(createHabitSchema), createHabit)

router.put('/:id', validateParams(habitIdSchema), updateHabit)

router.delete('/:id', validateParams(habitIdSchema), deleteHabit)

//Habit completion routes
router.post(
  '/:id/complete',
  validateParams(habitIdSchema),
  validateBody(habitCompleteSchema),
  completeHabit,
)

// Tag relationship routes
router.get('/tag/:tagId', validateParams(getHabitByTagSchema), getHabitsByTag)

router.post(
  '/:id/log',
  validateParams(habitIdSchema),
  validateBody(habitCompleteSchema),
  logHabitCompletion,
)

router.get(
  '/:id/tags',
  validateParams(habitIdSchema),
  validateBody(addTagsSchema),
  addTagsToHabit,
)

router.delete(
  '/:id/tags/:tagId',
  validateParams(habitTagSchema),
  // removeTagFromHabit
)

export default router
