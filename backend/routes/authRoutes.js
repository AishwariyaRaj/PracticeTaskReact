import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Router } from 'express'
import { findUserByEmail, getAllUsers, updateUserByEmail, upsertUser } from '../redis/store.js'
import { sendPasswordResetEmail, sendWelcomeEmail } from '../email/mailer.js'
import { authRateLimiter } from '../middleware/rateLimiter.js'

const router = Router()

const validateEmail = (email) => {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.toLowerCase().endsWith('.com')
}

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

router.post('/register', authRateLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'invalid email' })
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

    // Send welcome email asynchronously so it doesn't delay account creation response
    console.log('[Register] Scheduling welcome email dispatch.')
    sendWelcomeEmail({ to: user.email, name: user.name })
      .then(() => console.log('[Register] Welcome email sent successfully.'))
      .catch((emailError) => console.warn('[Register] Failed to send welcome email:', emailError?.message ?? emailError))

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: sanitizeUser(user),
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create account.' })
  }
})

router.post('/login', authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'invalid email' })
    }

    const user = await findUserByEmail(email.trim().toLowerCase())
    if (!user) {
      return res.status(401).json({ message: 'invalid email' })
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatches) {
      return res.status(401).json({ message: 'password is wrong' })
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

router.post('/forgot-password', authRateLimiter, async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'invalid email' })
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
    
    // Send password reset email asynchronously so it doesn't block response
    console.log('[Forgot Password] Scheduling reset email dispatch.')
    sendPasswordResetEmail({ to: user.email, resetUrl })
      .then(() => console.log('[Forgot Password] Reset email sent successfully.'))
      .catch((emailError) => {
        console.error('[Forgot Password] Error sending reset email:', emailError?.message ?? emailError)
        console.warn(`[Forgot Password] FALLBACK: Since the email failed to send, you can manually use this reset link for testing: ${resetUrl}`)
      })

    return res.json({ message: 'If the email exists, a reset link has been sent.' })
  } catch (error) {
    console.error(`[Forgot Password] Error sending reset email:`, error)
    return res.status(500).json({ message: 'Unable to process password reset request.' })
  }
})

router.post('/reset-password', authRateLimiter, async (req, res) => {
  try {
    const { email, token, password } = req.body

    if (!email || !token || !password) {
      return res.status(400).json({ message: 'Email, token, and password are required.' })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'invalid email' })
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

import { requireAuth } from '../middleware/auth.js'

router.put('/update-profile', requireAuth, async (req, res) => {
  try {
    const { name, email } = req.body
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' })
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'invalid email' })
    }

    const currentUserEmail = req.user.email
    const user = await findUserByEmail(currentUserEmail)
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    if (email.toLowerCase() !== currentUserEmail.toLowerCase()) {
      const taken = await findUserByEmail(email)
      if (taken) {
        return res.status(409).json({ message: 'This email is already in use.' })
      }
    }

    const updated = await updateUserByEmail(currentUserEmail, async (u) => {
      u.name = name.trim()
      u.email = email.trim().toLowerCase()
      return u
    })

    const token = buildToken(updated)
    return res.json({
      message: 'Profile updated successfully.',
      token,
      user: sanitizeUser(updated),
    })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update profile.' })
  }
})

router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' })
    }

    const user = await findUserByEmail(req.user.email)
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!matches) {
      return res.status(400).json({ message: 'password is wrong' })
    }

    await updateUserByEmail(req.user.email, async (u) => {
      u.passwordHash = await bcrypt.hash(newPassword, 10)
      return u
    })

    return res.json({ message: 'Password updated successfully.' })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update password.' })
  }
})

export default router
