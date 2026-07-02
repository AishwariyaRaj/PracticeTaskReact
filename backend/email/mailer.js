import nodemailer from 'nodemailer'
import { clusterAlertEmailTemplate, passwordResetEmailTemplate, welcomeEmailTemplate } from './templates.js'

function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    return nodemailer.createTransport({ jsonTransport: true })
  }

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
const fromAddress = process.env.EMAIL_FROM ?? 'Highre Dashboard <no-reply@highre.local>'

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
    subject: 'Welcome to the Highre dashboard',
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
