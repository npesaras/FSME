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

const defaultOrigins =
  'http://127.0.0.1:3000,http://localhost:3000,http://127.0.0.1:4173,http://localhost:4173'
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
    userProfilesTableId: readEnv(
      ['APPWRITE_USER_PROFILES_TABLE_ID', 'VITE_APPWRITE_USER_PROFILES_TABLE_ID'],
      'user_profiles'
    )!,
    cometUserProfilesTableId: readEnv(
      ['APPWRITE_COMET_USER_PROFILES_TABLE_ID', 'VITE_APPWRITE_COMET_USER_PROFILES_TABLE_ID'],
      'comet_user_profiles'
    )!,
    documentTrackingTableId: readEnv(
      ['APPWRITE_DOCUMENT_TRACKING_TABLE_ID', 'VITE_APPWRITE_DOCUMENT_TRACKING_TABLE_ID'],
      'document_tracking'
    )!,
    recentActivitiesTableId: readEnv(
      ['APPWRITE_RECENT_ACTIVITIES_TABLE_ID', 'VITE_APPWRITE_RECENT_ACTIVITIES_TABLE_ID'],
      'recent_activities'
    )!,
    recoveryOrigins: readOrigins(['APPWRITE_AUTH_RECOVERY_ORIGINS'], defaultOrigins),
    verificationOrigins: readOrigins(['APPWRITE_AUTH_VERIFICATION_ORIGINS'], defaultOrigins),
  },
  cometchat: {
    appId: readEnv(['COMETCHAT_APP_ID', 'VITE_COMETCHAT_APP_ID'], '')!,
    region: readEnv(['COMETCHAT_REGION', 'VITE_COMETCHAT_REGION'], '')!,
    apiKey: readEnv(['COMETCHAT_API_KEY'], '')!,
    syncToken: readEnv(['COMETCHAT_SYNC_TOKEN'], '')!,
  },
} as const
