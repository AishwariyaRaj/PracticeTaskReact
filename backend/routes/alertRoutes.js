import { Router } from 'express'
import { sendClusterAlertEmail } from '../email/mailer.js'
import { requireAuth } from '../middleware/auth.js'
import { addNotification } from '../redis/store.js'

const router = Router()

router.post('/cluster-alert', requireAuth, async (req, res) => {
  try {
    const { severity = 'High', message = 'A simulated cluster issue was detected.', recipientEmail } = req.body
    const targetEmail = recipientEmail || req.user.email || process.env.ALERT_EMAIL_TO

    if (!targetEmail) {
      return res.status(400).json({ message: 'A recipient email address is required.' })
    }

    // Add persistent notification in backend store
    await addNotification(
      req.user.id,
      'Cluster Alert Simulated',
      `${severity} severity alert dispatched to ${targetEmail}`
    )

    // Send cluster alert email asynchronously so it doesn't block response
    console.log('[Alert] Scheduling cluster alert email dispatch.')
    sendClusterAlertEmail({
      to: targetEmail,
      severity,
      message,
    })
      .then(() => console.log('[Alert] Cluster alert email sent successfully.'))
      .catch((emailError) => console.error('[Alert] Error sending cluster alert email:', emailError?.message ?? emailError))

    return res.json({ message: 'Cluster alert email sent successfully.' })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to send cluster alert email.' })
  }
})

export default router
