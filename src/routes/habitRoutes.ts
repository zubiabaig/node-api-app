import { Router } from 'express'

const router = Router()

//Habit-specific routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all habits' })
})

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Habit created' })
})

//Habit completion routes
router.post('/:id/complete', (req, res) => {
  res.json({ message: `Mark habit ${req.params.id} complete` })
})

router.get('/:id/stats', (req, res) => {
  res.json({ message: `Get stats for habit ${req.params.id}` })
})

export default router
