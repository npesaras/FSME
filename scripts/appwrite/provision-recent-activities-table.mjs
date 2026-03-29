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
  env.APPWRITE_RECENT_ACTIVITIES_TABLE_ID ||
  env.VITE_APPWRITE_RECENT_ACTIVITIES_TABLE_ID ||
  'recent_activities'

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
    name: 'Recent Activities',
    rowSecurity: false,
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
    key: 'applicant_id',
    methodName: 'createVarcharColumn',
    params: {
      key: 'applicant_id',
      size: 255,
      required: true,
      array: false,
    },
  },
  {
    key: 'application_id',
    methodName: 'createVarcharColumn',
    params: {
      key: 'application_id',
      size: 255,
      required: false,
      array: false,
    },
  },
  {
    key: 'activity_type',
    methodName: 'createVarcharColumn',
    params: {
      key: 'activity_type',
      size: 128,
      required: true,
      array: false,
    },
  },
  {
    key: 'title',
    methodName: 'createVarcharColumn',
    params: {
      key: 'title',
      size: 255,
      required: true,
      array: false,
    },
  },
  {
    key: 'description',
    methodName: 'createTextColumn',
    params: {
      key: 'description',
      required: true,
      array: false,
    },
  },
  {
    key: 'occurred_at',
    methodName: 'createDatetimeColumn',
    params: {
      key: 'occurred_at',
      required: true,
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
    key: 'recent_activities_applicant_id',
    type: TablesDBIndexType.Key,
    columns: ['applicant_id'],
    orders: ['asc'],
  },
  {
    key: 'recent_activities_activity_type',
    type: TablesDBIndexType.Key,
    columns: ['activity_type'],
    orders: ['asc'],
  },
  {
    key: 'recent_activities_occurred_at',
    type: TablesDBIndexType.Key,
    columns: ['occurred_at'],
    orders: ['desc'],
  },
]

for (const definition of indexDefinitions) {
  await ensureIndex(definition)
}

console.log(`Provisioning complete for '${tableId}'.`)
