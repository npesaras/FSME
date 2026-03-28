const Fastify = require('fastify')
const cors = require('@fastify/cors')
const jwt = require('@fastify/jwt')
const { config, envPaths } = require('./config')
const { appwrite, getAppwriteStatus } = require('./appwrite')
const { createAccountsService } = require('./accounts-service')
const { AppError } = require('./errors')
const healthRoutes = require('./routes/health')
const authRoutes = require('./routes/auth')

function getStatusLabel(statusCode) {
  if (statusCode === 400) {
    return 'Bad Request'
  }

  if (statusCode === 401) {
    return 'Unauthorized'
  }

  if (statusCode === 404) {
    return 'Not Found'
  }

  if (statusCode === 409) {
    return 'Conflict'
  }

  return 'Error'
}

function normalizeValidationDetails(validation = []) {
  return validation.map((item) => ({
    path: item.instancePath || item.params?.missingProperty || '',
    message: item.message || 'Invalid value.',
  }))
}

function buildApp(options = {}) {
  const app = Fastify({
    logger: options.logger ?? true,
  })

  app.decorate('appConfig', {
    ...config,
    envPaths,
  })
  app.decorate('appwrite', appwrite)
  app.decorate('services', {
    accounts: createAccountsService({
      tablesDB: appwrite.tablesDB,
      databaseId: config.appwrite.databaseId,
      tableId: config.appwrite.accountsTableId,
    }),
  })

  app.register(cors, {
    origin: config.cors.origins,
  })

  app.register(jwt, {
    secret: config.auth.jwtSecret,
    sign: {
      expiresIn: config.auth.tokenExpiresIn,
      iss: 'fsme-fastify-backend',
    },
  })

  app.decorate('authenticate', async function authenticate(request) {
    try {
      await request.jwtVerify()
    } catch (error) {
      throw new AppError(401, 'Authentication required.', {
        code: 'UNAUTHORIZED',
      })
    }
  })

  app.get('/', async () => ({
    name: 'fsme-fastify-backend',
    status: 'ok',
    docs: {
      health: '/api/v1/health',
      appwrite: '/api/v1/appwrite/health',
      tables: '/api/v1/appwrite/tables',
      signUp: '/api/v1/auth/sign-up',
      signIn: '/api/v1/auth/sign-in',
      me: '/api/v1/auth/me',
    },
  }))

  app.register(healthRoutes, {
    prefix: '/api/v1',
  })
  app.register(authRoutes, {
    prefix: '/api/v1',
  })

  app.setNotFoundHandler(async (request, reply) => {
    reply.code(404)

    return {
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} does not exist.`,
    }
  })

  app.setErrorHandler((error, request, reply) => {
    const isValidationError = Array.isArray(error.validation)
    const isKnownAppError = error instanceof AppError
    const statusCode = error.statusCode || (isValidationError ? 400 : 500)
    const safeMessage =
      statusCode >= 500 && !isKnownAppError
        ? 'Something went wrong on the server.'
        : error.message

    if (statusCode >= 500) {
      request.log.error(error)
    }

    const payload = {
      error: getStatusLabel(statusCode),
      message: safeMessage,
    }

    if (error.code && (statusCode < 500 || isKnownAppError)) {
      payload.code = error.code
    }

    if (isValidationError) {
      payload.details = normalizeValidationDetails(error.validation)
    }

    reply.code(statusCode).send(payload)
  })

  app.addHook('onReady', async () => {
    if (config.auth.usingDefaultJwtSecret) {
      app.log.warn(
        'AUTH_JWT_SECRET is not set. Using the local development fallback secret.'
      )
    }

    try {
      await getAppwriteStatus()
    } catch (error) {
      app.log.warn(
        {
          err: error,
        },
        'Appwrite health check failed during startup. Auth routes may be unavailable until the database is ready.'
      )
    }
  })

  return app
}

module.exports = {
  buildApp,
}
