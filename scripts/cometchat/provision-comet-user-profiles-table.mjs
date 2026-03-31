import fs from 'node:fs'
import path from 'node:path'
import { Client, TablesDB, TablesDBIndexType } from 'node-appwrite'
import dotenv from 'dotenv'

function loadEnv() {
  for (const envPath of ['.env', '.env.local']) {
    const absolutePath = path.resolve(process.cwd(), envPath)

    if (!fs.existsSync(absolutePath)) {
      continue
    }

    const parsed = dotenv.parse(fs.readFileSync(absolutePath))

    for (const [key, value] of Object.entries(parsed)) {
      if (typeof process.env[key] === 'undefined') {
        process.env[key] = value
      }
    }
  }
}

function readEnv(keys, fallback = '') {
  for (const key of keys) {
    const value = process.env[key]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return fallback
}

function requireEnv(keys) {
  const value = readEnv(keys)

  if (!value) {
    throw new Error(`Missing required environment variable. Tried: ${keys.join(', ')}`)
  }

  return value
}

function isNotFoundError(error) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 404
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function main() {
  loadEnv()

  const endpoint = requireEnv(['APPWRITE_ENDPOINT'])
  const projectId = requireEnv(['APPWRITE_PROJECT_ID'])
  const apiKey = requireEnv(['APPWRITE_API_KEY'])
  const databaseId = requireEnv(['APPWRITE_DATABASE_ID'])
  const tableId = readEnv(
    ['APPWRITE_COMET_USER_PROFILES_TABLE_ID', 'VITE_APPWRITE_COMET_USER_PROFILES_TABLE_ID'],
    'comet_user_profiles',
  )

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey)
  const tablesDB = new TablesDB(client)

  async function ensureTable() {
    try {
      return await tablesDB.getTable({ databaseId, tableId })
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error
      }
    }

    await tablesDB.createTable({
      databaseId,
      tableId,
      name: 'Comet User Profiles',
      rowSecurity: false,
      enabled: true,
    })

    return waitForTable()
  }

  async function waitForTable(attempts = 30) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return await tablesDB.getTable({ databaseId, tableId })
      } catch (error) {
        if (attempt === attempts - 1 || !isNotFoundError(error)) {
          throw error
        }
      }

      await delay(500)
    }

    throw new Error(`Timed out while waiting for Appwrite table "${tableId}" to become available.`)
  }

  async function ensureVarcharColumn({ key, size, required }) {
    try {
      return await tablesDB.getColumn({ databaseId, tableId, key })
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error
      }
    }

    await tablesDB.createVarcharColumn({
      databaseId,
      tableId,
      key,
      size,
      required,
    })

    return waitForColumn(key)
  }

  async function ensureEnumColumn({ key, elements, required }) {
    try {
      return await tablesDB.getColumn({ databaseId, tableId, key })
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error
      }
    }

    await tablesDB.createEnumColumn({
      databaseId,
      tableId,
      key,
      elements,
      required,
    })

    return waitForColumn(key)
  }

  async function waitForColumn(key, attempts = 40) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const column = await tablesDB.getColumn({ databaseId, tableId, key })
      const status = typeof column?.status === 'string' ? column.status.toLowerCase() : ''

      if (!status || status === 'available') {
        return column
      }

      await delay(500)
    }

    throw new Error(`Timed out while waiting for Appwrite column "${tableId}.${key}" to become available.`)
  }

  async function ensureIndex({ key, type, columns, orders }) {
    try {
      return await tablesDB.getIndex({ databaseId, tableId, key })
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error
      }
    }

    await tablesDB.createIndex({
      databaseId,
      tableId,
      key,
      type,
      columns,
      ...(orders ? { orders } : {}),
    })

    return waitForIndex(key)
  }

  async function waitForIndex(key, attempts = 40) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const index = await tablesDB.getIndex({ databaseId, tableId, key })
      const status = typeof index?.status === 'string' ? index.status.toLowerCase() : ''

      if (!status || status === 'available') {
        return index
      }

      await delay(500)
    }

    throw new Error(`Timed out while waiting for Appwrite index "${tableId}.${key}" to become available.`)
  }

  await ensureTable()

  await ensureVarcharColumn({ key: 'user_id', size: 255, required: true })
  await ensureVarcharColumn({ key: 'cometchat_uid', size: 255, required: true })
  await ensureVarcharColumn({ key: 'full_name', size: 255, required: true })
  await ensureEnumColumn({ key: 'role', elements: ['faculty', 'panelist'], required: true })
  await ensureVarcharColumn({ key: 'avatar_url', size: 2048, required: false })
  await ensureVarcharColumn({ key: 'profile_link', size: 2048, required: false })
  await ensureVarcharColumn({ key: 'auth_token', size: 2048, required: false })

  await ensureIndex({
    key: 'comet_user_profiles_user_id',
    type: TablesDBIndexType.Unique,
    columns: ['user_id'],
  })
  await ensureIndex({
    key: 'comet_user_profiles_uid',
    type: TablesDBIndexType.Unique,
    columns: ['cometchat_uid'],
  })
  await ensureIndex({
    key: 'comet_user_profiles_role',
    type: TablesDBIndexType.Key,
    columns: ['role'],
    orders: ['asc'],
  })

  console.log(
    JSON.stringify(
      {
        databaseId,
        tableId,
        status: 'ready',
        columns: [
          'user_id',
          'cometchat_uid',
          'full_name',
          'role',
          'avatar_url',
          'profile_link',
          'auth_token',
        ],
        indexes: [
          'comet_user_profiles_user_id',
          'comet_user_profiles_uid',
          'comet_user_profiles_role',
        ],
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
