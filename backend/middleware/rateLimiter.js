import { isRedisConnected, getRedisClient } from '../redis/store.js'

// In-memory fallback tracking for rate limits
const memoryLimits = new Map()

// Clean up memory store every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [ip, limit] of memoryLimits.entries()) {
    if (limit.resetTime < now) {
      memoryLimits.delete(ip)
    }
  }
}, 5 * 60 * 1000)

export async function authRateLimiter(req, res, next) {
  // Retrieve clean client IP address
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
  const windowMs = 60 * 1000 // 1 minute window
  const limitCount = 10 // Max 10 attempts per minute

  if (isRedisConnected()) {
    const client = getRedisClient()
    if (client) {
      const redisKey = `netpulse:rate-limit:${ip}`
      try {
        const currentCount = await client.incr(redisKey)
        if (currentCount === 1) {
          await client.expire(redisKey, 60) // Expire in 60 seconds
        }
        
        if (currentCount > limitCount) {
          return res.status(429).json({
            message: 'Too many attempts from this IP. Please try again after 60 seconds.'
          })
        }
        return next()
      } catch (error) {
        console.error('Redis Rate Limiting Error (falling back to memory):', error)
      }
    }
  }

  // Local Memory Fallback
  const now = Date.now()
  const limitInfo = memoryLimits.get(ip)

  if (!limitInfo || limitInfo.resetTime < now) {
    // Start a new window
    memoryLimits.set(ip, {
      count: 1,
      resetTime: now + windowMs
    })
    return next()
  }

  // Increment inside the current window
  limitInfo.count += 1
  if (limitInfo.count > limitCount) {
    return res.status(429).json({
      message: 'Too many attempts from this IP. Please try again after 60 seconds.'
    })
  }

  return next()
}
