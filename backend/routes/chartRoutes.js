import { Router } from 'express'
import { getChartData } from '../redis/store.js'

const router = Router()

router.get('/chart-data', async (_req, res) => {
  try {
    const items = await getChartData()
    return res.json({ items })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch chart data.' })
  }
})

export default router
