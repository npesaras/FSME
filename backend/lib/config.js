const path = require('node:path')
const dotenv = require('dotenv')

const envPath = path.resolve(__dirname, '../../.env')

dotenv.config({
  path: envPath,
  quiet: true,
})

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

const config = {
  server: {
    host: readEnv(['BACKEND_HOST'], '127.0.0.1'),
    port: readPort(readEnv(['BACKEND_PORT'], '4000')),
  },
  appwrite: {
    endpoint: readRequiredEnv(['APPWRITE_ENDPOINT', 'VITE_APPWRITE_ENDPOINT']),
    projectId: readRequiredEnv(['APPWRITE_PROJECT_ID', 'VITE_APPWRITE_PROJECT_ID']),
    apiKey: readRequiredEnv(['APPWRITE_API_KEY']),
    databaseId: readRequiredEnv(['APPWRITE_DATABASE_ID', 'VITE_APPWRITE_DATABASE_ID']),
    bucketId: readEnv(['APPWRITE_BUCKET_ID', 'VITE_APPWRITE_BUCKET_ID'], ''),
    tableIds: {
      userProfiles: readEnv(
        ['APPWRITE_USER_PROFILES_TABLE_ID', 'VITE_APPWRITE_USER_PROFILES_TABLE_ID'],
        'user_profiles'
      ),
      applications: readEnv(
        ['APPWRITE_APPLICATIONS_TABLE_ID', 'VITE_APPWRITE_APPLICATIONS_TABLE_ID'],
        'applications'
      ),
      applicationDocuments: readEnv(
        [
          'APPWRITE_APPLICATION_DOCUMENTS_TABLE_ID',
          'VITE_APPWRITE_APPLICATION_DOCUMENTS_TABLE_ID',
        ],
        'application_documents'
      ),
      activityLogs: readEnv(
        ['APPWRITE_ACTIVITY_LOGS_TABLE_ID', 'VITE_APPWRITE_ACTIVITY_LOGS_TABLE_ID'],
        'activity_logs'
      ),
    },
  },
}

module.exports = {
  config,
  envPath,
}
