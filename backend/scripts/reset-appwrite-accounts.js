const {
  TablesDBIndexType,
} = require('node-appwrite')
const { appwrite } = require('../lib/appwrite')
const { config } = require('../lib/config')

const COLUMN_POLL_TIMEOUT_MS = 90_000
const POLL_INTERVAL_MS = 1_500

async function sleep(durationMs) {
  await new Promise((resolve) => {
    setTimeout(resolve, durationMs)
  })
}

async function waitForColumns(tableId, expectedKeys) {
  const deadline = Date.now() + COLUMN_POLL_TIMEOUT_MS

  while (Date.now() < deadline) {
    const result = await appwrite.tablesDB.listColumns({
      databaseId: config.appwrite.databaseId,
      tableId,
    })

    const matchingColumns = result.columns.filter((column) => expectedKeys.includes(column.key))
    const allReady =
      matchingColumns.length === expectedKeys.length &&
      matchingColumns.every((column) => column.status === 'available')

    if (allReady) {
      return
    }

    await sleep(POLL_INTERVAL_MS)
  }

  throw new Error('Timed out waiting for Appwrite columns to become available.')
}

async function waitForIndexes(tableId, expectedKeys) {
  const deadline = Date.now() + COLUMN_POLL_TIMEOUT_MS

  while (Date.now() < deadline) {
    const result = await appwrite.tablesDB.listIndexes({
      databaseId: config.appwrite.databaseId,
      tableId,
    })

    const matchingIndexes = result.indexes.filter((index) => expectedKeys.includes(index.key))
    const allReady =
      matchingIndexes.length === expectedKeys.length &&
      matchingIndexes.every((index) => index.status === 'available')

    if (allReady) {
      return
    }

    await sleep(POLL_INTERVAL_MS)
  }

  throw new Error('Timed out waiting for Appwrite indexes to become available.')
}

async function resetAccountsTable() {
  const databaseId = config.appwrite.databaseId
  const tableId = config.appwrite.accountsTableId
  const existingTables = await appwrite.tablesDB.listTables({
    databaseId,
  })

  if (existingTables.tables.length > 0) {
    console.log('Deleting existing Appwrite tables...')
  }

  for (const table of existingTables.tables) {
    console.log(`- deleting ${table.$id}`)
    await appwrite.tablesDB.deleteTable({
      databaseId,
      tableId: table.$id,
    })
  }

  console.log(`Creating "${tableId}" table...`)
  await appwrite.tablesDB.createTable({
    databaseId,
    tableId,
    name: 'Accounts',
    permissions: [],
    rowSecurity: false,
    enabled: true,
  })

  console.log('Creating columns...')
  await appwrite.tablesDB.createStringColumn({
    databaseId,
    tableId,
    key: 'name',
    size: 120,
    required: true,
  })
  await appwrite.tablesDB.createEmailColumn({
    databaseId,
    tableId,
    key: 'email',
    required: true,
  })
  await appwrite.tablesDB.createStringColumn({
    databaseId,
    tableId,
    key: 'passwordHash',
    size: 255,
    required: true,
  })
  await appwrite.tablesDB.createStringColumn({
    databaseId,
    tableId,
    key: 'status',
    size: 24,
    required: true,
  })
  await appwrite.tablesDB.createDatetimeColumn({
    databaseId,
    tableId,
    key: 'lastSignInAt',
    required: false,
  })

  await waitForColumns(tableId, ['name', 'email', 'passwordHash', 'status', 'lastSignInAt'])

  console.log('Creating indexes...')
  await appwrite.tablesDB.createIndex({
    databaseId,
    tableId,
    key: 'email_unique',
    type: TablesDBIndexType.Unique,
    columns: ['email'],
  })

  await waitForIndexes(tableId, ['email_unique'])

  console.log(`Appwrite "${tableId}" table is ready.`)
}

resetAccountsTable().catch((error) => {
  console.error(error)
  process.exit(1)
})
