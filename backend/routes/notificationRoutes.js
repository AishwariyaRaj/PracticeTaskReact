import { Router } from 'express'
import { getNotifications, addNotification, markAllNotificationsRead, clearNotifications } from '../redis/store.js'

const router = Router()

router.get('/notifications', async (req, res) => {
  try {
    const list = await getNotifications(req.user.id)
    return res.json({ items: list })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch notifications.' })
  }
})

router.post('/notifications', async (req, res) => {
  try {
    const { title, message } = req.body
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' })
    }
    const created = await addNotification(req.user.id, title, message)
    return res.status(201).json({ item: created })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create notification.' })
  }
})

router.post('/notifications/read-all', async (req, res) => {
  try {
    const list = await markAllNotificationsRead(req.user.id)
    return res.json({ items: list })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to mark notifications as read.' })
  }
})

router.delete('/notifications', async (req, res) => {
  try {
    const list = await clearNotifications(req.user.id)
    return res.json({ items: list })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to clear notifications.' })
  }
})

export default router
