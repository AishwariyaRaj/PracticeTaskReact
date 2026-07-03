import cors from 'cors'
import express from 'express'
import authRoutes from './routes/authRoutes.js'
import switchRoutes from './routes/switchRoutes.js'
import chartRoutes from './routes/chartRoutes.js'
import alertRoutes from './routes/alertRoutes.js'
import { requireAuth } from './middleware/auth.js'

export function createApp() {
  const app = express()

  const allowedOrigins = [
    process.env.CLIENT_ORIGIN,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
  ].filter(Boolean)

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      credentials: true,
    })
  )
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.get('/debug-mailer', async (_req, res) => {
    const { transporter } = await import('./email/mailer.js')
    try {
      await new Promise((resolve, reject) => {
        transporter.verify((error, success) => {
          if (error) reject(error)
          else resolve(success)
        })
      })
      res.json({
        smtp_configured: !!process.env.SMTP_HOST,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        status: 'SUCCESS',
        message: 'SMTP is connected and verified.'
      })
    } catch (err) {
      res.json({
        smtp_configured: !!process.env.SMTP_HOST,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        status: 'FAILED',
        error: err.message || err,
        code: err.code,
        syscall: err.syscall
      })
    }
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
