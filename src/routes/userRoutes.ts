import { Router } from 'express'

const router = Router()

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

// Routes are relative to where router is mounted
router.get('/', (req, res) => {
  res.json({ message: 'Get all users' })
})

router.get('/:userId', (req, res) => {
  res.json({
    message: `Get user ${req.params.userId}`,
    // , user: req.user
  })
})

router.post('/', (req, res) => {
  res.status(201).json({ message: 'User created' })
})

router.put('/:id', (req, res) => {
  res.json({ message: `Update user ${req.params.id}` })
})

router.delete('/:id', (req, res) => {
  res.json({ meassage: `Delete user${req.params.id}` })
})

export default router
