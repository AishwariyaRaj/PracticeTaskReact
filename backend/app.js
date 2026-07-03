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
    
    let smtpReport = null
    if (process.env.SMTP_HOST) {
      smtpReport = await new Promise((resolve) => {
        transporter.verify((error, success) => {
          if (error) {
            resolve({ status: 'FAILED', error: error.message || error, code: error.code })
          } else {
            resolve({ status: 'SUCCESS' })
          }
        })
      })
    } else {
      smtpReport = { status: 'NOT_CONFIGURED' }
    }

    res.json({
      smtp: {
        configured: !!process.env.SMTP_HOST,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        verification: smtpReport
      },
      resend: {
        configured: !!process.env.RESEND_API_KEY,
        from_address: process.env.EMAIL_FROM_HTTP || 'onboarding@resend.dev'
      },
      notice: "If SMTP is showing ETIMEDOUT, it means Render's firewall is blocking outbound SMTP ports. You can bypass this block entirely by signing up for a free Resend API key (https://resend.com) and adding the RESEND_API_KEY environment variable in your Render dashboard."
    })
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
