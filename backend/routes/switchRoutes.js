import { Router } from 'express'
import { addSwitch, deleteSwitch, getSwitches, updateSwitch } from '../redis/store.js'

const router = Router()

router.get('/switches', async (_req, res) => {
  try {
    const switches = await getSwitches()
    return res.json({ items: switches })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch switches.' })
  }
})

router.post('/switches', async (req, res) => {
  try {
    const { model, physicalDevice, id, config, status } = req.body

    if (!model || !physicalDevice || !config) {
      return res.status(400).json({ message: 'Model, physical device, and config are required.' })
    }

    const created = await addSwitch({ model, physicalDevice, id, config, status })
    return res.status(201).json({ message: 'Switch created successfully.', item: created })
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to create switch.' })
  }
})

router.put('/switches/:id', async (req, res) => {
  try {
    const updated = await updateSwitch(req.params.id, req.body)

    if (!updated) {
      return res.status(404).json({ message: 'Switch not found.' })
    }

    return res.json({ message: 'Switch updated successfully.', item: updated })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update switch.' })
  }
})

router.delete('/switches/:id', async (req, res) => {
  try {
    const removed = await deleteSwitch(req.params.id)

    if (!removed) {
      return res.status(404).json({ message: 'Switch not found.' })
    }

    return res.json({ message: 'Switch deleted successfully.' })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete switch.' })
  }
})

export default router
