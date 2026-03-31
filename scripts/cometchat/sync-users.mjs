import fs from 'node:fs'
import path from 'node:path'
import { Client, ID, Query, TablesDB } from 'node-appwrite'
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

function createStableCometChatUid(userId) {
  const normalizedUserId = String(userId)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

  return `fsme-${normalizedUserId || 'user'}`
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

function isEquivalentLocalProfile(profile, row) {
  if (!row) {
    return false
  }

  return (
    row.user_id === profile.userId &&
    row.cometchat_uid === profile.uid &&
    normalizeName(row.full_name) === profile.fullName &&
    row.role === profile.role &&
    normalizeOptionalUrl(row.avatar_url) === profile.avatarUrl &&
    normalizeOptionalUrl(row.profile_link) === profile.profileLink &&
    readString(row.auth_token) === profile.authToken
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
  const userProfilesTableId = readEnv(
    ['APPWRITE_USER_PROFILES_TABLE_ID', 'VITE_APPWRITE_USER_PROFILES_TABLE_ID'],
    'user_profiles',
  )
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

  async function listRows(tableId) {
    const rows = []
    let offset = 0
    const limit = 100

    while (true) {
      const result = await tablesDB.listRows({
        databaseId: appwriteDatabaseId,
        tableId,
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

  async function createLocalProfile(profile) {
    return tablesDB.createRow({
      databaseId: appwriteDatabaseId,
      tableId: cometUserProfilesTableId,
      rowId: ID.unique(),
      data: {
        user_id: profile.userId,
        cometchat_uid: profile.uid,
        full_name: profile.fullName,
        role: profile.role,
        avatar_url: profile.avatarUrl ?? null,
        profile_link: profile.profileLink ?? null,
        auth_token: profile.authToken ?? null,
      },
    })
  }

  async function updateLocalProfile(rowId, profile) {
    return tablesDB.updateRow({
      databaseId: appwriteDatabaseId,
      tableId: cometUserProfilesTableId,
      rowId,
      data: {
        cometchat_uid: profile.uid,
        full_name: profile.fullName,
        role: profile.role,
        avatar_url: profile.avatarUrl ?? null,
        profile_link: profile.profileLink ?? null,
        auth_token: profile.authToken ?? null,
      },
    })
  }

  async function deleteLocalProfile(rowId) {
    await tablesDB.deleteRow({
      databaseId: appwriteDatabaseId,
      tableId: cometUserProfilesTableId,
      rowId,
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

  async function createAuthToken(uid) {
    try {
      const payload = await request({
        path: `/users/${encodeURIComponent(uid)}/auth_tokens`,
        method: 'POST',
      })

      return readString(unwrapDataRecord(payload)?.authToken)
    } catch (error) {
      return null
    }
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

  const authoritativeProfiles = await listRows(userProfilesTableId)
  const existingLocalProfiles = await listRows(cometUserProfilesTableId)
  const existingLocalProfilesByUserId = new Map(
    existingLocalProfiles.map((row) => [row.user_id, row]),
  )
  const authoritativeUserIds = new Set(authoritativeProfiles.map((row) => row.user_id))
  const backfill = {
    totalAuthoritativeProfiles: authoritativeProfiles.length,
    totalLocalProfiles: deleteStale
      ? authoritativeProfiles.length
      : new Set([
          ...authoritativeProfiles.map((row) => row.user_id),
          ...existingLocalProfiles.map((row) => row.user_id),
        ]).size,
    createdLocalProfiles: 0,
    updatedLocalProfiles: 0,
    deletedLocalProfiles: 0,
    createdLocalUserIds: [],
    updatedLocalUserIds: [],
    deletedLocalUserIds: [],
  }

  for (const row of authoritativeProfiles) {
    const existing = existingLocalProfilesByUserId.get(row.user_id) ?? null
    const profile = {
      userId: row.user_id,
      uid: existing?.cometchat_uid || createStableCometChatUid(row.user_id),
      fullName: normalizeName(row.full_name),
      role: row.role,
      avatarUrl: normalizeOptionalUrl(existing?.avatar_url),
      profileLink: normalizeOptionalUrl(existing?.profile_link),
      authToken: readString(existing?.auth_token),
    }

    if (isEquivalentLocalProfile(profile, existing)) {
      continue
    }

    if (!existing) {
      await createLocalProfile(profile)
      backfill.createdLocalProfiles += 1
      backfill.createdLocalUserIds.push(row.user_id)
      continue
    }

    await updateLocalProfile(existing.$id, profile)
    backfill.updatedLocalProfiles += 1
    backfill.updatedLocalUserIds.push(row.user_id)
  }

  if (deleteStale) {
    for (const row of existingLocalProfiles) {
      if (authoritativeUserIds.has(row.user_id)) {
        continue
      }

      await deleteLocalProfile(row.$id)
      backfill.deletedLocalProfiles += 1
      backfill.deletedLocalUserIds.push(row.user_id)
    }
  }

  const localProfiles = await listRows(cometUserProfilesTableId)
  const result = {
    ...backfill,
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

      if (!profile.authToken) {
        const authToken = await createAuthToken(profile.uid)

        if (authToken) {
          await updateLocalProfile(profile.rowId, {
            ...profile,
            authToken,
          })
        }
      }

      result.updated += 1
      result.updatedUids.push(profile.uid)
    } catch (error) {
      if (!isUidNotFoundError(error)) {
        throw error
      }

      const createdPayload = await createRemoteUser(profile)
      const authToken = readString(unwrapDataRecord(createdPayload)?.authToken)

      if (authToken && authToken !== profile.authToken) {
        await updateLocalProfile(profile.rowId, {
          ...profile,
          authToken,
        })
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
        sourceTableId: userProfilesTableId,
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
