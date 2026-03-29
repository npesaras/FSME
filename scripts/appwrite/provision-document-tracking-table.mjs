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
  env.APPWRITE_DOCUMENT_TRACKING_TABLE_ID ||
  env.VITE_APPWRITE_DOCUMENT_TRACKING_TABLE_ID ||
  'document_tracking'

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
    name: 'Document Tracking',
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

  const methodName =
    definition.kind === 'varchar'
      ? 'createVarcharColumn'
      : definition.kind === 'datetime'
        ? 'createDatetimeColumn'
        : 'createEnumColumn'

  const column = await tablesDB[methodName]({
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
    kind: 'varchar',
    params: {
      key: 'applicant_id',
      size: 255,
      required: true,
      array: false,
    },
  },
  {
    key: 'application_id',
    kind: 'varchar',
    params: {
      key: 'application_id',
      size: 255,
      required: false,
      array: false,
    },
  },
  {
    key: 'file_name',
    kind: 'varchar',
    params: {
      key: 'file_name',
      size: 255,
      required: true,
      array: false,
    },
  },
  {
    key: 'status',
    kind: 'enum',
    params: {
      key: 'status',
      elements: ['Pending', 'Accepted', 'Rejected'],
      required: true,
      array: false,
    },
  },
  {
    key: 'remarks',
    kind: 'varchar',
    params: {
      key: 'remarks',
      size: 1024,
      required: false,
      array: false,
    },
  },
  {
    key: 'uploaded_at',
    kind: 'datetime',
    params: {
      key: 'uploaded_at',
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
    key: 'document_tracking_applicant_id',
    type: TablesDBIndexType.Key,
    columns: ['applicant_id'],
    orders: ['asc'],
  },
  {
    key: 'document_tracking_status',
    type: TablesDBIndexType.Key,
    columns: ['status'],
    orders: ['asc'],
  },
  {
    key: 'document_tracking_uploaded_at',
    type: TablesDBIndexType.Key,
    columns: ['uploaded_at'],
    orders: ['desc'],
  },
]

for (const definition of indexDefinitions) {
  await ensureIndex(definition)
}

console.log(`Provisioning complete for '${tableId}'.`)
