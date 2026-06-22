import cors from 'cors'
import express, { type Request, type Response } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { env, isTest } from '../env.ts'
import authRoutes from './routes/authRoutes.ts'
import habitRoutes from './routes/habitRoutes.ts'
import tagRoutes from './routes/tagRoutes.ts'
import userRoutes from './routes/userRoutes.ts'
//Create Express application
const app = express()

app.use(helmet())
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  morgan('dev', {
    skip: () => isTest(),
  }),
)

//Health check endpoint - always good to have!
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Habit Tracker API',
  })
})

//Detailed health check
// app.get('/health/detailed', async (req, res) => {
//   try {
//     //check database connection
//     await db.raw('SELECT 1')

//     //Check external services
//     const redisStatus = await redis.ping()

//     res.status(200).json({
//       status: 'OK',
//       timestamp: new Date().toISOString(),
//       servies: {
//         database: 'connected',
//         redis: redisStatus === 'POND' ? 'connected' : 'disconnected'
//       },
//       version: process.env.APP_VERSION,
//       uptime: process.uptime()
//     })
//   } catch (error) {
//     res.status(503).json({
//       status: 'ERROR',
//       message: 'Service unhealthy',
//       error: error.message,
//     })
//   }
// })

// Mount routers with base paths
app.use('/api/auth', authRoutes) // All auth routes prefixed with /api/auth
app.use('/api/users', userRoutes) // All user routes prefixed with /api/users
app.use('/api/habits', habitRoutes) // All habit routes prefixed with /api/habits
app.use('/api/tags', tagRoutes) // All tag routes prefixed with /api/tags

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  })
})

// Catch-all for non-API routes (SPA support)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
})

// Export the app for use in other modules (like tests)
export { app }

// Default export for convenience
export default app
