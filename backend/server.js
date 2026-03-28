const { buildApp } = require('./lib/build-app')
const { config } = require('./lib/config')

async function start() {
  const app = buildApp()

  try {
    await app.listen({
      host: config.server.host,
      port: config.server.port,
    })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

start()
