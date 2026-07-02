import { Router } from 'express'
import { login, register } from '../controllers/authController.ts'
import { validateBody } from '../middleware/validation.ts'
import { loginSchema, registerSchema } from '../types/authTypes.ts'

const router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'auth' })
})

// Authentication routes
router.post('/register', validateBody(registerSchema), register)

router.post('/login', validateBody(loginSchema), login)

router.post('/logout', (req, res) => {
  res.json({ message: 'User logged out' })
})

router.post('/refresh', (req, res) => {
  res.json({ message: 'Token refreshed' })
})

export default router
