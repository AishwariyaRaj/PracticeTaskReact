import { createClient } from 'redis'
import { randomUUID } from 'crypto'

const USERS_KEY = 'netpulse:users'
const SWITCHES_KEY = 'netpulse:switches'
const CHART_KEY = 'netpulse:chart-data'
const NOTIFICATIONS_KEY = 'netpulse:notifications'

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
  {
    id: 'SW-1005',
    model: 'Cisco Catalyst 3850',
    physicalDevice: 'Rack E / Unit 02',
    config: 'Gigabit Ethernet stack uplink template',
    status: 'Active',
  },
  {
    id: 'SW-1006',
    model: 'Juniper EX3400',
    physicalDevice: 'Rack F / Unit 14',
    config: 'VLAN tagging & voice routing profile',
    status: 'Active',
  },
  {
    id: 'SW-1007',
    model: 'Aruba CX 6300M',
    physicalDevice: 'Rack G / Unit 22',
    config: 'Core spine-leaf distribution template',
    status: 'Maintenance',
  },
  {
    id: 'SW-1008',
    model: 'Ubiquiti UniFi Pro 48',
    physicalDevice: 'Rack H / Unit 10',
    config: 'PoE camera and VoIP power allocation config',
    status: 'Active',
  },
  {
    id: 'SW-1009',
    model: 'Cisco Nexus 9300',
    physicalDevice: 'Rack I / Unit 01',
    config: '100G Data Center core routing policy',
    status: 'Inactive',
  },
  {
    id: 'SW-1010',
    model: 'Dell PowerConnect 5548',
    physicalDevice: 'Rack J / Unit 18',
    config: 'Legacy backup virtualization cluster link',
    status: 'Maintenance',
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

const initialNotifications = [
  {
    id: '1',
    title: 'Welcome Onboard',
    message: 'Your NetPulse Operator account has been initialized.',
    time: new Date().toISOString(),
    read: false,
  },
  {
    id: '2',
    title: 'Database Connected',
    message: 'Successfully connected to Redis database cluster.',
    time: new Date(Date.now() - 60 * 1000 * 2).toISOString(),
    read: true,
  },
]

const memoryStore = {
  users: new Map(),
  switches: [...initialSwitches],
  chartData: [...initialChartData],
  notifications: [...initialNotifications],
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

async function readSwitches(userId) {
  const key = userId ? `${SWITCHES_KEY}:${userId}` : SWITCHES_KEY
  if (!connected || !client) {
    if (userId) {
      if (!memoryStore.userSwitches) {
        memoryStore.userSwitches = new Map()
      }
      if (!memoryStore.userSwitches.has(userId)) {
        memoryStore.userSwitches.set(userId, clone(initialSwitches))
      }
      return clone(memoryStore.userSwitches.get(userId))
    }
    return clone(memoryStore.switches)
  }

  const raw = await client.get(key)
  if (!raw) {
    await writeJsonKey(key, initialSwitches)
    return clone(initialSwitches)
  }
  return JSON.parse(raw)
}

async function writeSwitches(switches, userId) {
  const key = userId ? `${SWITCHES_KEY}:${userId}` : SWITCHES_KEY
  if (!connected || !client) {
    if (userId) {
      if (!memoryStore.userSwitches) {
        memoryStore.userSwitches = new Map()
      }
      memoryStore.userSwitches.set(userId, clone(switches))
    } else {
      memoryStore.switches = clone(switches)
    }
    return switches
  }
  return await writeJsonKey(key, switches)
}

async function readChartData() {
  return await readJsonKey(CHART_KEY, clone(memoryStore.chartData))
}

async function writeChartData(chartData) {
  memoryStore.chartData = clone(chartData)
  return await writeJsonKey(CHART_KEY, chartData)
}

async function readNotifications(userId) {
  const key = userId ? `${NOTIFICATIONS_KEY}:${userId}` : NOTIFICATIONS_KEY
  if (!connected || !client) {
    if (userId) {
      if (!memoryStore.userNotifications) {
        memoryStore.userNotifications = new Map()
      }
      if (!memoryStore.userNotifications.has(userId)) {
        memoryStore.userNotifications.set(userId, clone(initialNotifications))
      }
      return clone(memoryStore.userNotifications.get(userId))
    }
    return clone(memoryStore.notifications)
  }

  const raw = await client.get(key)
  if (!raw) {
    await writeJsonKey(key, initialNotifications)
    return clone(initialNotifications)
  }
  return JSON.parse(raw)
}

async function writeNotifications(notifications, userId) {
  const key = userId ? `${NOTIFICATIONS_KEY}:${userId}` : NOTIFICATIONS_KEY
  if (!connected || !client) {
    if (userId) {
      if (!memoryStore.userNotifications) {
        memoryStore.userNotifications = new Map()
      }
      memoryStore.userNotifications.set(userId, clone(notifications))
    } else {
      memoryStore.notifications = clone(notifications)
    }
    return notifications
  }
  return await writeJsonKey(key, notifications)
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

  const notifications = await readNotifications()
  if (!notifications || notifications.length === 0) {
    await writeNotifications(initialNotifications)
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

export async function getSwitches(userId) {
  await initializeStore()
  return await readSwitches(userId)
}

export async function addSwitch(switchRecord, userId) {
  const switches = await getSwitches(userId)
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
  await writeSwitches(switches, userId)
  return nextSwitch
}

export async function updateSwitch(id, updates, userId) {
  const switches = await getSwitches(userId)
  const index = switches.findIndex((entry) => entry.id.toLowerCase() === id.toLowerCase())

  if (index === -1) {
    return null
  }

  switches[index] = {
    ...switches[index],
    ...updates,
    id: switches[index].id,
  }

  await writeSwitches(switches, userId)
  return switches[index]
}

export async function deleteSwitch(id, userId) {
  const switches = await getSwitches(userId)
  const nextSwitches = switches.filter((entry) => entry.id.toLowerCase() !== id.toLowerCase())

  if (nextSwitches.length === switches.length) {
    return false
  }

  await writeSwitches(nextSwitches, userId)
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

export async function getNotifications(userId) {
  await initializeStore()
  return await readNotifications(userId)
}

export async function addNotification(userId, title, message) {
  await initializeStore()
  const list = await readNotifications(userId)
  const newNotif = {
    id: String(Date.now() + Math.random()),
    title,
    message,
    time: new Date().toISOString(),
    read: false,
  }
  list.unshift(newNotif)
  await writeNotifications(list, userId)
  return newNotif
}

export async function markAllNotificationsRead(userId) {
  await initializeStore()
  const list = await readNotifications(userId)
  const updated = list.map((item) => ({ ...item, read: true }))
  await writeNotifications(updated, userId)
  return updated
}

export async function clearNotifications(userId) {
  await initializeStore()
  await writeNotifications([], userId)
  return []
}
