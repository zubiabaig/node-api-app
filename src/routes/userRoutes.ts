import { Router } from 'express'
import {
  changePassword,
  getProfile,
  updateProfile,
} from '../controllers/userController.ts'
import { authenticateToken } from '../middleware/auth.ts'
import { validateBody, validateParams } from '../middleware/validation.ts'
import {
  changePasswordSchema,
  updateProfileSchema,
  userIdParamSchema,
} from '../types/userTypes.ts'

const router = Router()

// Apply authentication to all routes
router.use(authenticateToken)

// router.param('userId', async (req, res, next, userId) => {
//   try {
//     const user = await User.findById(userId)
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' })
//     }
//     req.user = user // attach user to request
//     next()
//   } catch (error) {
//     next(error)
//   }
// })

//Apply validation middleware
// Routes are relative to where router is mounted

//Profile management requires authentication
router.get('/profile', getProfile)

router.put('/profile', validateBody(updateProfileSchema), updateProfile)

router.post(
  '/change-password',
  validateBody(changePasswordSchema),
  changePassword,
)

router.get('/', (req, res) => {
  res.json({ message: 'Get all users' })
})

router.get('/:userId', (req, res) => {
  res.json({
    message: `Get user ${req.params.userId}`,
    // , user: req.user
  })
})

router.put('/:id', validateParams(userIdParamSchema), (req, res) => {
  res.json({ message: `Update user ${req.params.id}` })
})

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete user${req.params.id}` })
})

export default router
