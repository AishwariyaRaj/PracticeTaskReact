import 'dotenv/config'
import { createApp } from './app.js'
import { initializeStore, getStoreMode } from './redis/store.js'

const port = Number(process.env.PORT ?? 5000)

async function startServer() {
  await initializeStore()
  const app = createApp()

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
    console.log(`Data store mode: ${getStoreMode()}`)
  })
}

startServer().catch((error) => {
  console.error('Unable to start server', error)
  process.exit(1)
})
