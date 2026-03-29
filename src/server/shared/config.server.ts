import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import {
  readBoolean,
  readEnv,
  readOrigins,
  readRequiredEnv,
  readSameSite,
} from '../utils/env.server'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(currentDir, '../../../')

const candidateEnvPaths = [
  path.resolve(repoRoot, '.env'),
  path.resolve(repoRoot, '.env.local'),
]

const envPaths = candidateEnvPaths.filter((envPath) => fs.existsSync(envPath))

for (const envPath of envPaths) {
  const parsed = dotenv.parse(fs.readFileSync(envPath))

  for (const [key, value] of Object.entries(parsed)) {
    if (typeof process.env[key] === 'undefined') {
      process.env[key] = value
    }
  }
}

const defaultOrigins = 'http://127.0.0.1:3000,http://localhost:3000'
const nodeEnv = readEnv(['NODE_ENV'], 'development')!

export const config = {
  envPaths,
  server: {
    nodeEnv,
    logRequests: readBoolean(['LOG_SERVER_REQUESTS'], nodeEnv !== 'production'),
  },
  auth: {
    cookieName: readEnv(['AUTH_COOKIE_NAME'], 'fsme_session')!,
    cookieSameSite: readSameSite(['AUTH_COOKIE_SAME_SITE'], 'lax'),
    cookieSecure: readBoolean(['AUTH_COOKIE_SECURE'], false),
  },
  appwrite: {
    endpoint: readRequiredEnv(['APPWRITE_ENDPOINT']),
    projectId: readRequiredEnv(['APPWRITE_PROJECT_ID']),
    apiKey: readRequiredEnv(['APPWRITE_API_KEY']),
    databaseId: readRequiredEnv(['APPWRITE_DATABASE_ID']),
    accountsTableId: readEnv(['APPWRITE_ACCOUNTS_TABLE_ID'], 'accounts')!,
    recoveryOrigins: readOrigins(['APPWRITE_AUTH_RECOVERY_ORIGINS'], defaultOrigins),
  },
} as const
