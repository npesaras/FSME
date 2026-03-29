import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(currentDir, '../../../../')

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

function readEnv(keys: string[], fallback?: string) {
  for (const key of keys) {
    const value = process.env[key]

    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim()
    }
  }

  return fallback
}

function readRequiredEnv(keys: string[]) {
  const value = readEnv(keys)

  if (!value) {
    throw new Error(`Missing required environment variable. Tried: ${keys.join(', ')}`)
  }

  return value
}

function readBoolean(keys: string[], fallback: boolean) {
  const value = readEnv(keys, fallback ? 'true' : 'false')?.toLowerCase()

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  throw new Error(`Invalid boolean value for ${keys.join(', ')}: ${value}`)
}

function readOrigins(keys: string[], fallback: string) {
  return String(readEnv(keys, fallback))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function readSameSite(keys: string[], fallback: 'lax' | 'strict' | 'none') {
  const value = readEnv(keys, fallback)?.toLowerCase()

  if (value === 'lax' || value === 'strict' || value === 'none') {
    return value
  }

  throw new Error(`Invalid sameSite value for ${keys.join(', ')}: ${value}`)
}

const defaultOrigins = 'http://127.0.0.1:3000,http://localhost:3000'

export const config = {
  envPaths,
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
