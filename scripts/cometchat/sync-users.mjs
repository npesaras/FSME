import fs from 'node:fs'
import path from 'node:path'
import { Client, Query, TablesDB } from 'node-appwrite'
import dotenv from 'dotenv'

function loadEnv() {
  for (const envPath of ['.env', '.env.local']) {
    const absolutePath = path.resolve(process.cwd(), envPath)

    if (!fs.existsSync(absolutePath)) {
      continue
    }

    const parsed = dotenv.parse(fs.readFileSync(absolutePath))

    for (const [key, value] of Object.entries(parsed)) {
      if (typeof process.env[key] === 'undefined') {
        process.env[key] = value
      }
    }
  }
}

function readEnv(keys, fallback = '') {
  for (const key of keys) {
    const value = process.env[key]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return fallback
}

function requireEnv(keys) {
  const value = readEnv(keys)

  if (!value) {
    throw new Error(`Missing required environment variable. Tried: ${keys.join(', ')}`)
  }

  return value
}

function normalizeName(name) {
  return String(name).trim().replace(/\s+/g, ' ')
}

function normalizeOptionalUrl(value) {
  const normalizedValue = typeof value === 'string' ? value.trim() : ''

  return normalizedValue || null
}

function readString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function unwrapDataRecord(payload) {
  if (payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data
  }

  return payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : null
}

function unwrapDataArray(payload) {
  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return payload.data.filter((entry) => Boolean(entry && typeof entry === 'object'))
  }

  return Array.isArray(payload)
    ? payload.filter((entry) => Boolean(entry && typeof entry === 'object'))
    : []
}

function extractMessage(payload, fallback) {
  const data = unwrapDataRecord(payload)

  return (
    readString(data?.message) ||
    readString(payload?.message) ||
    readString(payload?.error?.message) ||
    readString(payload?.error?.details) ||
    fallback
  )
}

function extractPaginationTotalPages(payload) {
  const meta = payload && typeof payload === 'object' && payload.meta && typeof payload.meta === 'object'
    ? payload.meta
    : null
  const pagination = meta?.pagination && typeof meta.pagination === 'object' ? meta.pagination : null

  return (
    (typeof pagination?.totalPages === 'number' ? pagination.totalPages : null) ||
    (typeof pagination?.total_pages === 'number' ? pagination.total_pages : null) ||
    (typeof meta?.totalPages === 'number' ? meta.totalPages : null) ||
    (typeof meta?.total_pages === 'number' ? meta.total_pages : null)
  )
}

function isUidNotFoundError(error) {
  return error?.statusCode === 404 || error?.code === 'ERR_UID_NOT_FOUND'
}

function isManagedRemoteUser(user) {
  if (typeof user?.uid !== 'string') {
    return false
  }

  if (user.uid.startsWith('fsme-')) {
    return true
  }

  const metadata = user.metadata && typeof user.metadata === 'object' ? user.metadata : null

  return (
    readString(metadata?.syncSource) === 'appwrite' ||
    Boolean(readString(metadata?.appwriteUserId))
  )
}

async function parseResponseBody(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

async function main() {
  loadEnv()

  const appwriteEndpoint = requireEnv(['APPWRITE_ENDPOINT'])
  const appwriteProjectId = requireEnv(['APPWRITE_PROJECT_ID'])
  const appwriteApiKey = requireEnv(['APPWRITE_API_KEY'])
  const appwriteDatabaseId = requireEnv(['APPWRITE_DATABASE_ID'])
  const cometUserProfilesTableId = readEnv(
    ['APPWRITE_COMET_USER_PROFILES_TABLE_ID', 'VITE_APPWRITE_COMET_USER_PROFILES_TABLE_ID'],
    'comet_user_profiles',
  )
  const cometChatAppId = requireEnv(['COMETCHAT_APP_ID', 'VITE_COMETCHAT_APP_ID'])
  const cometChatRegion = requireEnv(['COMETCHAT_REGION', 'VITE_COMETCHAT_REGION'])
  const cometChatApiKey = requireEnv(['COMETCHAT_API_KEY'])
  const deleteStale = process.argv.includes('--delete-stale')
  const apiBaseUrl = `https://${cometChatAppId}.api-${cometChatRegion}.cometchat.io/v3.0`

  const client = new Client()
    .setEndpoint(appwriteEndpoint)
    .setProject(appwriteProjectId)
    .setKey(appwriteApiKey)
  const tablesDB = new TablesDB(client)

  async function listLocalProfiles() {
    const rows = []
    let offset = 0
    const limit = 100

    while (true) {
      const result = await tablesDB.listRows({
        databaseId: appwriteDatabaseId,
        tableId: cometUserProfilesTableId,
        queries: [Query.orderAsc('user_id'), Query.limit(limit), Query.offset(offset)],
        total: false,
      })

      rows.push(...result.rows)

      if (result.rows.length < limit) {
        return rows
      }

      offset += result.rows.length
    }
  }

  async function updateLocalProfileAuthToken(rowId, authToken) {
    await tablesDB.updateRow({
      databaseId: appwriteDatabaseId,
      tableId: cometUserProfilesTableId,
      rowId,
      data: {
        auth_token: authToken ?? null,
      },
    })
  }

  async function request({ path: requestPath, method, body, query }) {
    const url = new URL(`${apiBaseUrl}${requestPath}`)

    for (const [key, value] of Object.entries(query ?? {})) {
      if (typeof value === 'undefined' || value === null) {
        continue
      }

      url.searchParams.set(key, String(value))
    }

    const response = await fetch(url, {
      method,
      headers: {
        accept: 'application/json',
        apikey: cometChatApiKey,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const payload = await parseResponseBody(response)

    if (!response.ok) {
      const error = new Error(
        extractMessage(payload, `CometChat request failed with status ${response.status}.`),
      )
      error.statusCode = response.status
      error.code =
        readString(unwrapDataRecord(payload)?.code) ||
        readString(payload?.error?.code) ||
        null
      error.payload = payload
      throw error
    }

    return payload
  }

  async function createRemoteUser(profile) {
    return request({
      path: '/users',
      method: 'POST',
      body: {
        uid: profile.uid,
        name: profile.fullName,
        avatar: profile.avatarUrl ?? undefined,
        link: profile.profileLink ?? undefined,
        metadata: {
          appwriteUserId: profile.userId,
          appRole: profile.role,
          syncSource: 'appwrite',
        },
        withAuthToken: true,
      },
    })
  }

  async function updateRemoteUser(profile) {
    const unset = [
      ...(profile.avatarUrl ? [] : ['avatar']),
      ...(profile.profileLink ? [] : ['link']),
    ]

    return request({
      path: `/users/${encodeURIComponent(profile.uid)}`,
      method: 'PUT',
      body: {
        name: profile.fullName,
        avatar: profile.avatarUrl ?? undefined,
        link: profile.profileLink ?? undefined,
        metadata: {
          appwriteUserId: profile.userId,
          appRole: profile.role,
          syncSource: 'appwrite',
        },
        ...(unset.length > 0 ? { unset } : {}),
      },
    })
  }

  async function deleteRemoteUser(uid) {
    if (!uid) {
      return false
    }

    try {
      await request({
        path: `/users/${encodeURIComponent(uid)}`,
        method: 'DELETE',
        body: { permanent: false },
      })
      return true
    } catch (error) {
      if (isUidNotFoundError(error)) {
        return false
      }

      throw error
    }
  }

  async function listManagedRemoteUsers() {
    const users = []
    const perPage = 100
    let page = 1

    while (true) {
      const payload = await request({
        path: '/users',
        method: 'GET',
        query: {
          page,
          perPage,
          withDeactivated: true,
        },
      })
      const pageUsers = unwrapDataArray(payload).filter(isManagedRemoteUser)

      users.push(...pageUsers)

      const totalPages = extractPaginationTotalPages(payload)

      if (totalPages !== null) {
        if (page >= totalPages) {
          return users
        }
      } else if (pageUsers.length < perPage) {
        return users
      }

      page += 1
    }
  }

  const localProfiles = await listLocalProfiles()
  const result = {
    totalLocalProfiles: localProfiles.length,
    totalManagedRemoteUsers: 0,
    created: 0,
    updated: 0,
    deleted: 0,
    createdUids: [],
    updatedUids: [],
    deletedUids: [],
    deleteStale,
  }
  const desiredUids = new Set()

  for (const row of localProfiles) {
    const profile = {
      rowId: row.$id,
      userId: row.user_id,
      uid: row.cometchat_uid,
      fullName: normalizeName(row.full_name),
      role: row.role,
      avatarUrl: normalizeOptionalUrl(row.avatar_url),
      profileLink: normalizeOptionalUrl(row.profile_link),
      authToken: readString(row.auth_token),
    }

    desiredUids.add(profile.uid)

    try {
      await updateRemoteUser(profile)
      result.updated += 1
      result.updatedUids.push(profile.uid)
    } catch (error) {
      if (!isUidNotFoundError(error)) {
        throw error
      }

      const createdPayload = await createRemoteUser(profile)
      const authToken = readString(unwrapDataRecord(createdPayload)?.authToken)

      if (authToken && authToken !== profile.authToken) {
        await updateLocalProfileAuthToken(profile.rowId, authToken)
      }

      result.created += 1
      result.createdUids.push(profile.uid)
    }
  }

  if (deleteStale) {
    const remoteUsers = await listManagedRemoteUsers()
    result.totalManagedRemoteUsers = remoteUsers.length

    for (const remoteUser of remoteUsers) {
      if (desiredUids.has(remoteUser.uid)) {
        continue
      }

      const deleted = await deleteRemoteUser(remoteUser.uid)

      if (!deleted) {
        continue
      }

      result.deleted += 1
      result.deletedUids.push(remoteUser.uid)
    }
  }

  console.log(
    JSON.stringify(
      {
        ...result,
        tableId: cometUserProfilesTableId,
        appId: cometChatAppId,
        region: cometChatRegion,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
