import { createClient } from 'redis'
import { randomUUID } from 'crypto'

const USERS_KEY = 'netpulse:users'
const SWITCHES_KEY = 'netpulse:switches'
const CHART_KEY = 'netpulse:chart-data'

const initialSwitches = [
  {
    id: 'SW-1001',
    model: 'Cisco Catalyst 2960',
    physicalDevice: 'Rack A / Unit 12',
    config: 'Layer 2 access profile',
    status: 'Active',
  },
  {
    id: 'SW-1002',
    model: 'Cisco Catalyst 9300',
    physicalDevice: 'Rack B / Unit 08',
    config: 'Core aggregation template',
    status: 'Maintenance',
  },
  {
    id: 'SW-1003',
    model: 'Juniper EX4300',
    physicalDevice: 'Rack C / Unit 04',
    config: 'Redundant uplink config',
    status: 'Active',
  },
  {
    id: 'SW-1004',
    model: 'Aruba 2930F',
    physicalDevice: 'Rack D / Unit 16',
    config: 'Edge security profile',
    status: 'Inactive',
  },
]

const initialChartData = Array.from({ length: 24 }, (_, index) => {
  const timestamp = new Date(Date.now() - (23 - index) * 60 * 60 * 1000)
  const min = 35 + index * 0.9
  const median = min + 7 + Math.sin(index / 3) * 2
  const max = median + 8 + Math.cos(index / 4)

  return {
    timestamp: timestamp.toISOString(),
    min: Number(min.toFixed(2)),
    median: Number(median.toFixed(2)),
    max: Number(max.toFixed(2)),
  }
})

const memoryStore = {
  users: new Map(),
  switches: [...initialSwitches],
  chartData: [...initialChartData],
}

let client = null
let connected = false
let useMemory = false

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function getRedisUrl() {
  return process.env.REDIS_URL ?? 'redis://127.0.0.1:6379'
}

async function readJsonKey(key, fallback = null) {
  if (!connected || !client) {
    return fallback
  }

  const raw = await client.get(key)
  return raw ? JSON.parse(raw) : fallback
}

async function writeJsonKey(key, value) {
  if (!connected || !client) {
    return value
  }

  await client.set(key, JSON.stringify(value))
  return value
}

async function readUsers() {
  if (!connected || !client) {
    return [...memoryStore.users.values()].map((user) => clone(user))
  }

  const records = await client.hGetAll(USERS_KEY)
  return Object.values(records).map((record) => JSON.parse(record))
}

async function writeUsers(users) {
  if (!connected || !client) {
    memoryStore.users = new Map(users.map((user) => [user.email, clone(user)]))
    return users
  }

  const pipeline = client.multi()
  pipeline.del(USERS_KEY)
  for (const user of users) {
    pipeline.hSet(USERS_KEY, user.email, JSON.stringify(user))
  }
  await pipeline.exec()
  return users
}

async function readSwitches() {
  return await readJsonKey(SWITCHES_KEY, clone(memoryStore.switches))
}

async function writeSwitches(switches) {
  memoryStore.switches = clone(switches)
  return await writeJsonKey(SWITCHES_KEY, switches)
}

async function readChartData() {
  return await readJsonKey(CHART_KEY, clone(memoryStore.chartData))
}

async function writeChartData(chartData) {
  memoryStore.chartData = clone(chartData)
  return await writeJsonKey(CHART_KEY, chartData)
}

async function seedIfNeeded() {
  const switches = await readSwitches()
  if (!switches || switches.length === 0) {
    await writeSwitches(initialSwitches)
  }

  const chartData = await readChartData()
  if (!chartData || chartData.length === 0) {
    await writeChartData(initialChartData)
  }
}

export async function initializeStore() {
  if (connected || useMemory) {
    return { connected, useMemory }
  }

  client = createClient({
    url: getRedisUrl(),
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 1) {
          return false
        }
        return 500
      },
    },
  })
  client.on('error', () => {
    useMemory = true
    connected = false
  })

  try {
    await client.connect()
    connected = true
    useMemory = false
    await seedIfNeeded()
  } catch (error) {
    connected = false
    useMemory = true
    await seedIfNeeded()
  }

  return { connected, useMemory }
}

export function getStoreMode() {
  return useMemory ? 'memory' : 'redis'
}

export async function getAllUsers() {
  await initializeStore()
  return await readUsers()
}

export async function findUserByEmail(email) {
  const users = await getAllUsers()
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null
}

export async function upsertUser(user) {
  await initializeStore()
  const users = await getAllUsers()
  const nextUsers = users.filter((record) => record.email.toLowerCase() !== user.email.toLowerCase())
  nextUsers.push(clone(user))
  await writeUsers(nextUsers)
  return clone(user)
}

export async function updateUserByEmail(email, updater) {
  await initializeStore()
  const users = await getAllUsers()
  const index = users.findIndex((record) => record.email.toLowerCase() === email.toLowerCase())

  if (index === -1) {
    return null
  }

  const nextUser = await updater(clone(users[index]))
  users[index] = clone(nextUser)
  await writeUsers(users)
  return clone(nextUser)
}

export async function getSwitches() {
  await initializeStore()
  return await readSwitches()
}

export async function addSwitch(switchRecord) {
  const switches = await getSwitches()
  const nextSwitch = {
    id: switchRecord.id?.trim() || `SW-${randomUUID().slice(0, 8).toUpperCase()}`,
    model: switchRecord.model.trim(),
    physicalDevice: switchRecord.physicalDevice.trim(),
    config: switchRecord.config.trim(),
    status: switchRecord.status || 'Inactive',
  }

  if (switches.some((entry) => entry.id.toLowerCase() === nextSwitch.id.toLowerCase())) {
    throw new Error('A switch with this ID already exists.')
  }

  switches.unshift(nextSwitch)
  await writeSwitches(switches)
  return nextSwitch
}

export async function updateSwitch(id, updates) {
  const switches = await getSwitches()
  const index = switches.findIndex((entry) => entry.id.toLowerCase() === id.toLowerCase())

  if (index === -1) {
    return null
  }

  switches[index] = {
    ...switches[index],
    ...updates,
    id: switches[index].id,
  }

  await writeSwitches(switches)
  return switches[index]
}

export async function deleteSwitch(id) {
  const switches = await getSwitches()
  const nextSwitches = switches.filter((entry) => entry.id.toLowerCase() !== id.toLowerCase())

  if (nextSwitches.length === switches.length) {
    return false
  }

  await writeSwitches(nextSwitches)
  return true
}

export async function getChartData() {
  await initializeStore()
  return await readChartData()
}

export async function setChartData(chartData) {
  await initializeStore()
  return await writeChartData(chartData)
}
