import 'dotenv/config'
import nodemailer from 'nodemailer'
import { clusterAlertEmailTemplate, passwordResetEmailTemplate, welcomeEmailTemplate } from './templates.js'

function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    console.warn('[Mailer] WARNING: Missing SMTP env credentials. Falling back to jsonTransport (mock mode). Emails will only log to console and won\'t be delivered to real inboxes.')
    return nodemailer.createTransport({ jsonTransport: true })
  }

  console.log(`[Mailer] Success: Initializing real SMTP Transport on ${host}:${port} for account ${user}`)
  return nodemailer.createTransport({
    host,
    port,
    secure: String(port) === '465',
    auth: {
      user,
      pass,
    },
  })
}

const transporter = createTransporter()
const fromAddress = process.env.EMAIL_FROM ?? 'NetPulse Dashboard <no-reply@netpulse.local>'

// Verify connection configuration on startup
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('[Mailer] SMTP Verification FAILED. Check credentials or port blocking:', error.message || error)
      if (error.code === 'ETIMEDOUT' || error.command === 'CONN') {
        console.error('[Mailer] Suggestion: Render often blocks outbound port 587. Try setting SMTP_PORT to 465 in your environment variables.')
      }
    } else {
      console.log('[Mailer] SMTP Verification SUCCESS. Transporter is ready to deliver messages.')
    }
  })
}

async function sendEmail({ to, subject, html }) {
  return await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  })
}

export async function sendWelcomeEmail({ to, name }) {
  return await sendEmail({
    to,
    subject: 'Welcome to the NetPulse dashboard',
    html: welcomeEmailTemplate(name),
  })
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  return await sendEmail({
    to,
    subject: 'Password reset instructions',
    html: passwordResetEmailTemplate(resetUrl),
  })
}

export async function sendClusterAlertEmail({ to, severity, message }) {
  return await sendEmail({
    to,
    subject: `Cluster alert: ${severity}`,
    html: clusterAlertEmailTemplate({
      severity,
      message,
      timestamp: new Date().toISOString(),
    }),
  })
}
