const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')

const envPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
].filter((envPath, index, allPaths) => allPaths.indexOf(envPath) === index)

for (const envPath of envPaths) {
  if (!fs.existsSync(envPath)) {
    continue
  }

  const parsed = dotenv.parse(fs.readFileSync(envPath))

  for (const [key, value] of Object.entries(parsed)) {
    if (typeof process.env[key] === 'undefined') {
      process.env[key] = value
    }
  }
}

function readEnv(keys, fallback) {
  for (const key of keys) {
    const value = process.env[key]

    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim()
    }
  }

  return fallback
}

function readRequiredEnv(keys) {
  const value = readEnv(keys)

  if (!value) {
    throw new Error(`Missing required environment variable. Tried: ${keys.join(', ')}`)
  }

  return value
}

function readPort(value) {
  const parsedPort = Number.parseInt(value, 10)

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new Error(`Invalid BACKEND_PORT value: ${value}`)
  }

  return parsedPort
}

function readOrigins(keys, fallback) {
  const value = readEnv(keys, fallback)

  return String(value)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

const jwtSecret = readEnv(['AUTH_JWT_SECRET', 'BACKEND_JWT_SECRET'], 'local-dev-auth-secret')

const config = {
  server: {
    host: readEnv(['BACKEND_HOST'], '127.0.0.1'),
    port: readPort(readEnv(['BACKEND_PORT'], '4000')),
  },
  cors: {
    origins: readOrigins(
      ['BACKEND_CORS_ORIGINS', 'FRONTEND_ORIGIN'],
      'http://127.0.0.1:3000,http://localhost:3000'
    ),
  },
  auth: {
    jwtSecret,
    tokenExpiresIn: readEnv(['AUTH_TOKEN_EXPIRES_IN'], '7d'),
    usingDefaultJwtSecret: jwtSecret === 'local-dev-auth-secret',
  },
  appwrite: {
    endpoint: readRequiredEnv(['APPWRITE_ENDPOINT', 'VITE_APPWRITE_ENDPOINT']),
    projectId: readRequiredEnv(['APPWRITE_PROJECT_ID', 'VITE_APPWRITE_PROJECT_ID']),
    apiKey: readRequiredEnv(['APPWRITE_API_KEY']),
    databaseId: readRequiredEnv(['APPWRITE_DATABASE_ID', 'VITE_APPWRITE_DATABASE_ID']),
    accountsTableId: readEnv(['APPWRITE_ACCOUNTS_TABLE_ID'], 'accounts'),
  },
}

module.exports = {
  config,
  envPaths: envPaths.filter((envPath) => fs.existsSync(envPath)),
}
