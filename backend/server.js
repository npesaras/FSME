const Fastify = require('fastify')
const { appwrite, getAppwriteStatus } = require('./lib/appwrite')
const { config, envPath } = require('./lib/config')

const fastify = Fastify({
  logger: true,
})

fastify.decorate('appwrite', appwrite)
fastify.decorate('appConfig', config)

fastify.get('/', async () => ({
  name: 'fsme-fastify-backend',
  status: 'ok',
  docs: {
    health: '/health',
    appwrite: '/appwrite/health',
  },
}))

fastify.get('/health', async () => ({
  status: 'ok',
  uptimeSeconds: Number(process.uptime().toFixed(2)),
  envPath,
  appwriteConfigured: true,
}))

fastify.get('/appwrite/health', async (request, reply) => {
  try {
    const appwriteStatus = await getAppwriteStatus()

    return {
      ...appwriteStatus,
      checkedAt: new Date().toISOString(),
    }
  } catch (error) {
    request.log.error(error)
    reply.code(500)

    return {
      status: 'error',
      message: error.message,
      checkedAt: new Date().toISOString(),
    }
  }
})

fastify.get('/appwrite/tables', async (request, reply) => {
  try {
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
  } catch (error) {
    request.log.error(error)
    reply.code(500)

    return {
      status: 'error',
      message: error.message,
    }
  }
})

async function start() {
  try {
    await fastify.listen({
      host: config.server.host,
      port: config.server.port,
    })
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

start()
