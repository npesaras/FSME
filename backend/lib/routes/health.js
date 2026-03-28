const { getAppwriteStatus } = require('../appwrite')

async function healthRoutes(fastify) {
  fastify.get('/health', async () => ({
    status: 'ok',
    uptimeSeconds: Number(process.uptime().toFixed(2)),
    envPaths: fastify.appConfig.envPaths,
    appwrite: {
      databaseId: fastify.appConfig.appwrite.databaseId,
      accountsTableId: fastify.appConfig.appwrite.accountsTableId,
    },
  }))

  fastify.get('/appwrite/health', async () => ({
    ...(await getAppwriteStatus()),
    checkedAt: new Date().toISOString(),
  }))

  fastify.get('/appwrite/tables', async () => {
    const result = await fastify.appwrite.tablesDB.listTables({
      databaseId: fastify.appConfig.appwrite.databaseId,
    })

    return {
      total: result.total,
      tables: result.tables.map((table) => ({
        id: table.$id,
        name: table.name,
      })),
    }
  })
}

module.exports = healthRoutes
