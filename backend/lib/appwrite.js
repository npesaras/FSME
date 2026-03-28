const { Client, Health, TablesDB } = require('node-appwrite')
const { config } = require('./config')

const client = new Client()
  .setEndpoint(config.appwrite.endpoint)
  .setProject(config.appwrite.projectId)
  .setKey(config.appwrite.apiKey)

const appwrite = {
  client,
  health: new Health(client),
  tablesDB: new TablesDB(client),
}

async function getAppwriteStatus() {
  const [serviceHealth, databaseHealth, tables] = await Promise.all([
    appwrite.health.get(),
    appwrite.health.getDB(),
    appwrite.tablesDB.listTables({
      databaseId: config.appwrite.databaseId,
    }),
  ])

  return {
    status: 'ok',
    endpoint: config.appwrite.endpoint,
    projectId: config.appwrite.projectId,
    databaseId: config.appwrite.databaseId,
    accountsTableId: config.appwrite.accountsTableId,
    tables: {
      total: tables.total,
      ids: tables.tables.map((table) => table.$id),
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
