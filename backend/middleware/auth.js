import jwt from 'jsonwebtoken'
import { findUserByEmail } from '../redis/store.js'

function getTokenFromHeader(headerValue) {
  if (!headerValue || !headerValue.startsWith('Bearer ')) {
    return null
  }

  return headerValue.slice(7)
}

export async function requireAuth(req, res, next) {
  const token = getTokenFromHeader(req.headers.authorization)

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required.' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'dev-secret')
    const user = await findUserByEmail(payload.email)

    if (!user) {
      return res.status(401).json({ message: 'User session is no longer valid.' })
    }

    req.user = {
      email: user.email,
      name: user.name,
      id: user.id,
    }

    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Authentication token is invalid or expired.' })
  }
}
