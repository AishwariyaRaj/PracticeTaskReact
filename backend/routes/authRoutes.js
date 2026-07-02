import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Router } from 'express'
import { findUserByEmail, getAllUsers, updateUserByEmail, upsertUser } from '../redis/store.js'
import { sendPasswordResetEmail, sendWelcomeEmail } from '../email/mailer.js'

const router = Router()

function buildToken(user) {
  return jwt.sign(
    {
      email: user.email,
      name: user.name,
      id: user.id,
    },
    process.env.JWT_SECRET ?? 'dev-secret',
    { expiresIn: '12h' }
  )
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' })
    }

    console.log('[Register] Creating account request received.')
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({ message: 'An account already exists for this email address.' })
    }

    const user = {
      id: randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date().toISOString(),
    }

    await upsertUser(user)
    console.log('[Register] User registered successfully.')

    const token = buildToken(user)

    // Send welcome email but do not fail registration if email sending fails
    try {
      console.log('[Register] Sending welcome email.')
      await sendWelcomeEmail({ to: user.email, name: user.name })
      console.log('[Register] Welcome email sent successfully.')
    } catch (emailError) {
      console.warn('[Register] Failed to send welcome email:', emailError?.message ?? emailError)
    }

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: sanitizeUser(user),
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create account.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    return res.json({
      message: 'Login successful.',
      token: buildToken(user),
      user: sanitizeUser(user),
    })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to log in right now.' })
  }
})

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    console.log('[Forgot Password] Request received.')
    const user = await findUserByEmail(email)
    if (!user) {
      console.log('[Forgot Password] User not found.')
      return res.json({ message: 'If the email exists, a reset link has been sent.' })
    }

    console.log('[Forgot Password] User found. Generating reset token and sending email...')
    const resetToken = randomUUID()
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    const updatedUser = {
      ...user,
      resetToken,
      resetTokenExpiresAt,
    }

    await upsertUser(updatedUser)

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'
    const resetUrl = `${frontendUrl}/reset-password?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(resetToken)}`
    
    await sendPasswordResetEmail({ to: user.email, resetUrl })
    console.log('[Forgot Password] Reset email sent successfully.')

    return res.json({ message: 'If the email exists, a reset link has been sent.' })
  } catch (error) {
    console.error(`[Forgot Password] Error sending reset email:`, error)
    return res.status(500).json({ message: 'Unable to process password reset request.' })
  }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, password } = req.body

    if (!email || !token || !password) {
      return res.status(400).json({ message: 'Email, token, and password are required.' })
    }

    const user = await findUserByEmail(email)
    if (!user || user.resetToken !== token) {
      return res.status(400).json({ message: 'The reset link is invalid or expired.' })
    }

    if (user.resetTokenExpiresAt && new Date(user.resetTokenExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ message: 'The reset link has expired.' })
    }

    await upsertUser({
      ...user,
      passwordHash: await bcrypt.hash(password, 10),
      resetToken: null,
      resetTokenExpiresAt: null,
    })

    return res.json({ message: 'Password updated successfully.' })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to reset password right now.' })
  }
})

router.get('/me', async (req, res) => {
  try {
    const users = await getAllUsers()
    return res.json({ totalUsers: users.length })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch user profile information.' })
  }
})

export default router
