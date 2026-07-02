import { Router } from 'express'
import {
  createTag,
  deleteTag,
  getPopularTags,
  getTagById,
  getTagHabits,
  getTags,
  updateTag,
} from '../controllers/tagController.ts'
import { validateBody, validateParams } from '../middleware/validation.ts'
import {
  createTagSchema,
  tagIdSchema,
  updateTagSchema,
} from '../types/tagTypes.ts'

const router = Router()

router.get('/', getTags)

router.get('/popular', getPopularTags)

router.get('/:id', validateParams(tagIdSchema), getTagById)

router.post('/', validateBody(createTagSchema), createTag)

router.put(
  '/:id',
  validateParams(tagIdSchema),
  validateBody(updateTagSchema),
  updateTag,
)

router.delete('/:id', validateParams(tagIdSchema), deleteTag)

//Relationship routes
router.get('/:id/habits', validateParams(tagIdSchema), getTagHabits)

export default router
