const { Client, Health, Storage, TablesDB } = require('node-appwrite')
const { config } = require('./config')

const client = new Client()
  .setEndpoint(config.appwrite.endpoint)
  .setProject(config.appwrite.projectId)
  .setKey(config.appwrite.apiKey)

const appwrite = {
  client,
  health: new Health(client),
  storage: new Storage(client),
  tablesDB: new TablesDB(client),
}

async function getAppwriteStatus() {
  const [serviceHealth, databaseHealth, tables, buckets] = await Promise.all([
    appwrite.health.get(),
    appwrite.health.getDB(),
    appwrite.tablesDB.listTables({ databaseId: config.appwrite.databaseId }),
    appwrite.storage.listBuckets(),
  ])

  const configuredBucket = config.appwrite.bucketId
    ? buckets.buckets.find((bucket) => bucket.$id === config.appwrite.bucketId) || null
    : null

  return {
    status: 'ok',
    endpoint: config.appwrite.endpoint,
    projectId: config.appwrite.projectId,
    databaseId: config.appwrite.databaseId,
    tables: {
      total: tables.total,
      ids: tables.tables.map((table) => table.$id),
    },
    bucket: {
      configuredId: config.appwrite.bucketId || null,
      exists: Boolean(configuredBucket),
      availableIds: buckets.buckets.map((bucket) => bucket.$id),
    },
    services: {
      appwrite: {
        status: serviceHealth.status,
        ping: serviceHealth.ping,
      },
      database: databaseHealth.statuses.map((status) => ({
        name: status.name,
        status: status.status,
        ping: status.ping,
      })),
    },
  }
}

module.exports = {
  appwrite,
  getAppwriteStatus,
}
