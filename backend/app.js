import cors from 'cors'
import express from 'express'
import authRoutes from './routes/authRoutes.js'
import switchRoutes from './routes/switchRoutes.js'
import chartRoutes from './routes/chartRoutes.js'
import alertRoutes from './routes/alertRoutes.js'
import { requireAuth } from './middleware/auth.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
      credentials: true,
    })
  )
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use(authRoutes)
  app.use(requireAuth)
  app.use(switchRoutes)
  app.use(chartRoutes)
  app.use(alertRoutes)

  app.use((error, _req, res, _next) => {
    console.error(error)
    res.status(500).json({ message: 'An unexpected server error occurred.' })
  })

  return app
}
