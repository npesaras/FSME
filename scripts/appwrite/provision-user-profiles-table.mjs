import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { Client, TablesDB, TablesDBIndexType } from 'node-appwrite'

const repoRoot = path.resolve(import.meta.dirname, '../..')
const envPath = path.resolve(repoRoot, '.env')

if (!fs.existsSync(envPath)) {
  throw new Error(`Missing environment file at ${envPath}`)
}

const env = dotenv.parse(fs.readFileSync(envPath))

const databaseId = env.APPWRITE_DATABASE_ID
const tableId =
  env.APPWRITE_USER_PROFILES_TABLE_ID ||
  env.VITE_APPWRITE_USER_PROFILES_TABLE_ID ||
  'user_profiles'

if (!env.APPWRITE_ENDPOINT || !env.APPWRITE_PROJECT_ID || !env.APPWRITE_API_KEY || !databaseId) {
  throw new Error('Missing required Appwrite environment variables.')
}

const client = new Client()
  .setEndpoint(env.APPWRITE_ENDPOINT)
  .setProject(env.APPWRITE_PROJECT_ID)
  .setKey(env.APPWRITE_API_KEY)

const tablesDB = new TablesDB(client)

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function ensureTable() {
  try {
    const table = await tablesDB.getTable({ databaseId, tableId })
    console.log(`Table '${tableId}' already exists.`)
    return table
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('could not be found')) {
      throw error
    }
  }

  const table = await tablesDB.createTable({
    databaseId,
    tableId,
    name: 'User Profiles',
    rowSecurity: true,
    enabled: true,
  })

  console.log(`Created table '${tableId}'.`)
  return table
}

async function ensureColumn(definition) {
  try {
    const column = await tablesDB.getColumn({
      databaseId,
      tableId,
      key: definition.key,
    })
    console.log(`Column '${definition.key}' already exists (${column.status}).`)
    return column
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('could not be found')) {
      throw error
    }
  }

  const column = await tablesDB[definition.methodName]({
    databaseId,
    tableId,
    ...definition.params,
  })

  console.log(`Created column '${definition.key}' (${column.status}).`)
  return column
}

async function waitForColumns(keys) {
  const deadline = Date.now() + 60_000

  while (Date.now() < deadline) {
    const columns = await tablesDB.listColumns({ databaseId, tableId })
    const pending = columns.columns.filter(
      (column) => keys.includes(column.key) && column.status !== 'available',
    )

    if (!pending.length) {
      return
    }

    await sleep(1_500)
  }

  throw new Error(`Timed out waiting for columns on '${tableId}' to become available.`)
}

async function ensureIndex(definition) {
  try {
    const index = await tablesDB.getIndex({
      databaseId,
      tableId,
      key: definition.key,
    })
    console.log(`Index '${definition.key}' already exists (${index.status}).`)
    return index
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('could not be found')) {
      throw error
    }
  }

  const index = await tablesDB.createIndex({
    databaseId,
    tableId,
    key: definition.key,
    type: definition.type,
    columns: definition.columns,
    orders: definition.orders,
  })

  console.log(`Created index '${definition.key}' (${index.status}).`)
  return index
}

await ensureTable()

const columnDefinitions = [
  {
    key: 'user_id',
    methodName: 'createVarcharColumn',
    params: {
      key: 'user_id',
      size: 255,
      required: true,
      array: false,
    },
  },
  {
    key: 'full_name',
    methodName: 'createVarcharColumn',
    params: {
      key: 'full_name',
      size: 255,
      required: true,
      array: false,
    },
  },
  {
    key: 'role',
    methodName: 'createEnumColumn',
    params: {
      key: 'role',
      elements: ['faculty', 'panelist'],
      required: true,
      array: false,
    },
  },
  {
    key: 'department',
    methodName: 'createVarcharColumn',
    params: {
      key: 'department',
      size: 255,
      required: false,
      array: false,
    },
  },
  {
    key: 'college_or_office',
    methodName: 'createVarcharColumn',
    params: {
      key: 'college_or_office',
      size: 255,
      required: false,
      array: false,
    },
  },
  {
    key: 'employee_no',
    methodName: 'createVarcharColumn',
    params: {
      key: 'employee_no',
      size: 255,
      required: false,
      array: false,
    },
  },
  {
    key: 'phone',
    methodName: 'createVarcharColumn',
    params: {
      key: 'phone',
      size: 64,
      required: false,
      array: false,
    },
  },
]

for (const definition of columnDefinitions) {
  await ensureColumn(definition)
}

await waitForColumns(columnDefinitions.map((definition) => definition.key))

const indexDefinitions = [
  {
    key: 'user_profiles_user_id',
    type: TablesDBIndexType.Unique,
    columns: ['user_id'],
  },
  {
    key: 'user_profiles_role',
    type: TablesDBIndexType.Key,
    columns: ['role'],
    orders: ['asc'],
  },
]

for (const definition of indexDefinitions) {
  await ensureIndex(definition)
}

console.log(`Provisioning complete for '${tableId}'.`)
