import type { Models } from 'node-appwrite'
import type { AuthAccount, AuthRole } from '#/features/auth/types'
import { AppError } from '../../shared/errors.server'
import type { ServerLogger } from '../../types/logger'
import {
  createCometUserProfilesRepository,
  type CometUserProfileRow,
} from './comet-user-profiles.server'

type TablesDbLike = {
  listRows: <Row extends Models.Row = Models.DefaultRow>(options: {
    databaseId: string
    tableId: string
    queries?: string[]
    total?: boolean
  }) => Promise<{ rows: Row[]; total: number }>
  createRow: <Row extends Models.Row = Models.DefaultRow>(options: {
    databaseId: string
    tableId: string
    rowId: string
    data: Record<string, unknown>
    permissions?: string[]
  }) => Promise<Row>
  updateRow: <Row extends Models.Row = Models.DefaultRow>(options: {
    databaseId: string
    tableId: string
    rowId: string
    data: Record<string, unknown>
    permissions?: string[]
  }) => Promise<Row>
  deleteRow: (options: {
    databaseId: string
    tableId: string
    rowId: string
  }) => Promise<unknown>
}

export type ResolvedCometChatProfile = {
  userId: string
  uid: string
  fullName: string
  role: AuthRole
  avatarUrl: string | null
  profileLink: string | null
  authToken: string | null
}

export type SyncStoredCometChatProfilesResult = {
  totalLocalProfiles: number
  totalManagedRemoteUsers: number
  created: number
  updated: number
  deleted: number
  createdUids: string[]
  updatedUids: string[]
  deletedUids: string[]
}

type EnsureCometChatProfileInput = {
  userId: string
  fullName: string
  role: AuthRole
  avatarUrl?: string | null
  profileLink?: string | null
}

type CreateCometChatProvisioningServiceOptions = {
  appId: string
  region: string
  apiKey: string
  tablesDB: TablesDbLike
  databaseId: string
  cometUserProfilesTableId: string
  logger?: ServerLogger
}

type CometChatApiResponse = {
  data?: Record<string, unknown> | Array<Record<string, unknown>> | null
  meta?: Record<string, unknown> | null
  message?: string
  error?: Record<string, unknown> | null
  [key: string]: unknown
}

type CometChatRemoteUser = Record<string, unknown> & {
  uid: string
}

type RemoteSyncOutcome = 'created' | 'updated'

class CometChatApiError extends Error {
  statusCode: number
  code?: string
  payload?: unknown

  constructor(
    statusCode: number,
    message: string,
    options: {
      code?: string
      payload?: unknown
    } = {},
  ) {
    super(message)
    this.name = 'CometChatApiError'
    this.statusCode = statusCode
    this.code = options.code
    this.payload = options.payload
  }
}

function normalizeName(name: string) {
  return String(name).trim().replace(/\s+/g, ' ')
}

function normalizeOptionalUrl(value: string | null | undefined) {
  const normalizedValue = value?.trim()

  return normalizedValue ? normalizedValue : null
}

function createStableCometChatUid(userId: string) {
  const normalizedUserId = String(userId)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

  return `fsme-${normalizedUserId || 'user'}`
}

function isCometUserProfilesTableMissingError(error: unknown) {
  return error instanceof AppError && error.code === 'COMET_USER_PROFILES_TABLE_MISSING'
}

function isUidAlreadyRegisteredError(error: unknown) {
  return (
    error instanceof CometChatApiError &&
    (error.statusCode === 409 || error.code === 'ERR_UID_ALREADY_EXISTS')
  )
}

function isUidNotFoundError(error: unknown) {
  return (
    error instanceof CometChatApiError &&
    (error.statusCode === 404 || error.code === 'ERR_UID_NOT_FOUND')
  )
}

function readString(candidate: unknown) {
  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null
}

function readNumber(candidate: unknown) {
  return typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : null
}

function unwrapDataRecord(payload: unknown) {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    payload.data &&
    typeof payload.data === 'object' &&
    !Array.isArray(payload.data)
  ) {
    return payload.data as Record<string, unknown>
  }

  return payload && typeof payload === 'object' && !Array.isArray(payload)
    ? (payload as Record<string, unknown>)
    : null
}

function unwrapDataArray(payload: unknown) {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray(payload.data)
  ) {
    return payload.data.filter(
      (entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === 'object'),
    )
  }

  return Array.isArray(payload)
    ? payload.filter(
        (entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === 'object'),
      )
    : []
}

function extractAuthToken(payload: unknown) {
  const data = unwrapDataRecord(payload)

  return readString(data?.authToken)
}

function extractMessage(payload: unknown, fallback: string) {
  const data = unwrapDataRecord(payload)
  const message =
    readString(data?.message) ||
    readString((payload as CometChatApiResponse | null)?.message) ||
    readString((payload as CometChatApiResponse | null)?.error?.message) ||
    readString((payload as CometChatApiResponse | null)?.error?.details)

  return message || fallback
}

function extractPaginationTotalPages(payload: unknown) {
  const meta =
    payload &&
    typeof payload === 'object' &&
    'meta' in payload &&
    payload.meta &&
    typeof payload.meta === 'object'
      ? (payload.meta as Record<string, unknown>)
      : null
  const pagination =
    meta?.pagination && typeof meta.pagination === 'object'
      ? (meta.pagination as Record<string, unknown>)
      : null

  return (
    readNumber(pagination?.totalPages) ||
    readNumber(pagination?.total_pages) ||
    readNumber(meta?.totalPages) ||
    readNumber(meta?.total_pages)
  )
}

function buildManagedMetadata(profile: ResolvedCometChatProfile) {
  return {
    appwriteUserId: profile.userId,
    appRole: profile.role,
    syncSource: 'appwrite',
  }
}

function buildResolvedProfileFromRow(profile: CometUserProfileRow): ResolvedCometChatProfile {
  return {
    userId: profile.user_id,
    uid: profile.cometchat_uid,
    fullName: normalizeName(profile.full_name),
    role: profile.role,
    avatarUrl: normalizeOptionalUrl(profile.avatar_url),
    profileLink: normalizeOptionalUrl(profile.profile_link),
    authToken: readString(profile.auth_token),
  }
}

function toProvisioningError(error: unknown, fallbackCode: string, fallbackMessage: string) {
  if (error instanceof AppError) {
    return error
  }

  return new AppError(
    502,
    extractMessage(
      error instanceof CometChatApiError ? error.payload : null,
      error instanceof Error ? error.message : fallbackMessage,
    ),
    {
      code: error instanceof CometChatApiError && error.code ? error.code : fallbackCode,
    },
  )
}

function isManagedRemoteUser(user: CometChatRemoteUser) {
  if (user.uid.startsWith('fsme-')) {
    return true
  }

  const metadata =
    user.metadata && typeof user.metadata === 'object'
      ? (user.metadata as Record<string, unknown>)
      : null

  return (
    readString(metadata?.syncSource) === 'appwrite' ||
    Boolean(readString(metadata?.appwriteUserId))
  )
}

function isCometChatRemoteUser(candidate: Record<string, unknown>): candidate is CometChatRemoteUser {
  return Boolean(readString(candidate.uid))
}

async function parseResponseBody(response: Response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as CometChatApiResponse
  } catch {
    return { message: text }
  }
}

export function createCometChatProvisioningService({
  appId,
  region,
  apiKey,
  tablesDB,
  databaseId,
  cometUserProfilesTableId,
  logger,
}: CreateCometChatProvisioningServiceOptions) {
  const profilesRepository = createCometUserProfilesRepository({
    tablesDB,
    databaseId,
    tableId: cometUserProfilesTableId,
    logger,
  })
  const isConfigured = Boolean(appId && region && apiKey)
  const apiBaseUrl = isConfigured ? `https://${appId}.api-${region}.cometchat.io/v3.0` : ''

  function assertConfigured() {
    if (!isConfigured) {
      throw new AppError(
        500,
        'CometChat server provisioning is not configured. Add COMETCHAT_API_KEY to your .env so the backend can create and manage CometChat users.',
        {
          code: 'COMETCHAT_SERVER_CONFIG_MISSING',
        },
      )
    }
  }

  async function findStoredProfile(userId: string) {
    try {
      return await profilesRepository.findByUserId(userId)
    } catch (error) {
      if (isCometUserProfilesTableMissingError(error)) {
        return null
      }

      throw error
    }
  }

  async function persistProfile(profile: ResolvedCometChatProfile) {
    try {
      return await profilesRepository.upsertProfile({
        userId: profile.userId,
        cometchatUid: profile.uid,
        fullName: profile.fullName,
        role: profile.role,
        avatarUrl: profile.avatarUrl,
        profileLink: profile.profileLink,
        authToken: profile.authToken,
      })
    } catch (error) {
      if (isCometUserProfilesTableMissingError(error)) {
        logger?.warn?.(
          { tableId: cometUserProfilesTableId, uid: profile.uid, userId: profile.userId },
          'Skipping CometChat profile mirror persistence because the Appwrite table is not provisioned yet.',
        )
        return null
      }

      throw error
    }
  }

  async function deleteStoredProfile(userId: string) {
    try {
      return await profilesRepository.deleteByUserId(userId)
    } catch (error) {
      if (isCometUserProfilesTableMissingError(error)) {
        return false
      }

      throw error
    }
  }

  async function request<T extends object | null>({
    path,
    method,
    body,
    query,
  }: {
    path: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: Record<string, unknown>
    query?: Record<string, string | number | boolean | null | undefined>
  }) {
    const url = new URL(`${apiBaseUrl}${path}`)

    for (const [key, value] of Object.entries(query ?? {})) {
      if (typeof value === 'undefined' || value === null) {
        continue
      }

      url.searchParams.set(key, String(value))
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        accept: 'application/json',
        apikey: apiKey,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const payload = await parseResponseBody(response)

    if (!response.ok) {
      throw new CometChatApiError(
        response.status,
        extractMessage(payload, `CometChat request failed with status ${response.status}.`),
        {
          code:
            readString(unwrapDataRecord(payload)?.code) ||
            readString((payload as CometChatApiResponse | null)?.error?.code) ||
            undefined,
          payload,
        },
      )
    }

    return payload as T
  }

  async function createUser(profile: ResolvedCometChatProfile) {
    return request<CometChatApiResponse>({
      path: '/users',
      method: 'POST',
      body: {
        uid: profile.uid,
        name: profile.fullName,
        avatar: profile.avatarUrl ?? undefined,
        link: profile.profileLink ?? undefined,
        metadata: buildManagedMetadata(profile),
        withAuthToken: true,
      },
    })
  }

  async function updateUser(profile: ResolvedCometChatProfile) {
    const unset = [
      ...(profile.avatarUrl ? [] : ['avatar']),
      ...(profile.profileLink ? [] : ['link']),
    ]

    return request<CometChatApiResponse>({
      path: `/users/${encodeURIComponent(profile.uid)}`,
      method: 'PUT',
      body: {
        name: profile.fullName,
        avatar: profile.avatarUrl ?? undefined,
        link: profile.profileLink ?? undefined,
        metadata: buildManagedMetadata(profile),
        ...(unset.length > 0 ? { unset } : {}),
      },
    })
  }

  async function createAuthToken(uid: string) {
    try {
      const payload = await request<CometChatApiResponse>({
        path: `/users/${encodeURIComponent(uid)}/auth_tokens`,
        method: 'POST',
      })

      return extractAuthToken(payload)
    } catch (error) {
      logger?.warn?.(
        { uid, error },
        'CometChat auth token generation failed. Falling back to UID + auth key login for this session.',
      )
      return null
    }
  }

  async function listManagedRemoteUsers() {
    assertConfigured()

    const perPage = 100
    const remoteUsers: CometChatRemoteUser[] = []
    let page = 1

    while (true) {
      const payload = await request<CometChatApiResponse>({
        path: '/users',
        method: 'GET',
        query: {
          page,
          perPage,
          withDeactivated: true,
        },
      })
      const pageUsers = unwrapDataArray(payload)
        .filter(isCometChatRemoteUser)
        .filter(isManagedRemoteUser)

      remoteUsers.push(...pageUsers)

      const totalPages = extractPaginationTotalPages(payload)

      if (totalPages !== null) {
        if (page >= totalPages) {
          return remoteUsers
        }
      } else if (pageUsers.length < perPage) {
        return remoteUsers
      }

      page += 1
    }
  }

  async function deleteRemoteUser(uid: string, { permanent = false }: { permanent?: boolean } = {}) {
    assertConfigured()

    try {
      await request({
        path: `/users/${encodeURIComponent(uid)}`,
        method: 'DELETE',
        body: { permanent },
      })
      return true
    } catch (error) {
      if (isUidNotFoundError(error)) {
        return false
      }

      throw toProvisioningError(
        error,
        'COMETCHAT_USER_DELETION_FAILED',
        `CometChat could not delete the user "${uid}".`,
      )
    }
  }

  async function syncRemoteProfile(
    profile: ResolvedCometChatProfile,
    { ensureAuthToken = true }: { ensureAuthToken?: boolean } = {},
  ): Promise<RemoteSyncOutcome> {
    assertConfigured()

    let outcome: RemoteSyncOutcome = 'updated'

    try {
      await updateUser(profile)
    } catch (error) {
      if (!isUidNotFoundError(error)) {
        throw toProvisioningError(
          error,
          'COMETCHAT_USER_PROVISIONING_FAILED',
          'CometChat user provisioning failed.',
        )
      }

      const createdUserPayload = await createUser(profile).catch((createError) => {
        if (isUidAlreadyRegisteredError(createError)) {
          return null
        }

        throw toProvisioningError(
          createError,
          'COMETCHAT_USER_PROVISIONING_FAILED',
          'CometChat user provisioning failed.',
        )
      })

      if (createdUserPayload) {
        profile.authToken = extractAuthToken(createdUserPayload) || profile.authToken
      } else {
        await updateUser(profile).catch((updateError) => {
          throw toProvisioningError(
            updateError,
            'COMETCHAT_USER_PROVISIONING_FAILED',
            'CometChat user provisioning failed.',
          )
        })
      }

      outcome = 'created'
    }

    if (ensureAuthToken && !profile.authToken) {
      profile.authToken = await createAuthToken(profile.uid)
    }

    await persistProfile(profile)

    return outcome
  }

  async function ensureProfile({
    userId,
    fullName,
    role,
    avatarUrl,
    profileLink,
  }: EnsureCometChatProfileInput): Promise<ResolvedCometChatProfile> {
    const storedProfile = await findStoredProfile(userId)
    const resolvedProfile: ResolvedCometChatProfile = {
      userId,
      uid: storedProfile?.cometchat_uid || createStableCometChatUid(userId),
      fullName: normalizeName(fullName),
      role,
      avatarUrl: normalizeOptionalUrl(avatarUrl ?? storedProfile?.avatar_url),
      profileLink: normalizeOptionalUrl(profileLink ?? storedProfile?.profile_link),
      authToken: readString(storedProfile?.auth_token),
    }

    await syncRemoteProfile(resolvedProfile, { ensureAuthToken: true })

    return resolvedProfile
  }

  return {
    isConfigured() {
      return isConfigured
    },

    async ensureProfileForAccount(account: Pick<AuthAccount, 'id' | 'name' | 'role'>) {
      return ensureProfile({
        userId: account.id,
        fullName: account.name,
        role: account.role,
      })
    },

    async deleteProfileForUser(userId: string) {
      const storedProfile = await findStoredProfile(userId)
      const uid = storedProfile?.cometchat_uid || createStableCometChatUid(userId)
      const storedDeleted = await deleteStoredProfile(userId)

      if (!isConfigured) {
        return storedDeleted
      }

      const remoteDeleted = await deleteRemoteUser(uid, { permanent: false })

      return storedDeleted || remoteDeleted
    },

    async getStoredProfileForUser(userId: string) {
      return findStoredProfile(userId)
    },

    async syncStoredProfiles({
      deleteRemoteUsers = false,
    }: {
      deleteRemoteUsers?: boolean
    } = {}): Promise<SyncStoredCometChatProfilesResult> {
      assertConfigured()

      const storedProfiles = await profilesRepository.listProfiles()
      const desiredProfiles = storedProfiles.map(buildResolvedProfileFromRow)
      const desiredUids = new Set(desiredProfiles.map((profile) => profile.uid))
      const result: SyncStoredCometChatProfilesResult = {
        totalLocalProfiles: desiredProfiles.length,
        totalManagedRemoteUsers: 0,
        created: 0,
        updated: 0,
        deleted: 0,
        createdUids: [],
        updatedUids: [],
        deletedUids: [],
      }

      for (const profile of desiredProfiles) {
        const outcome = await syncRemoteProfile(profile, { ensureAuthToken: false })

        if (outcome === 'created') {
          result.created += 1
          result.createdUids.push(profile.uid)
          continue
        }

        result.updated += 1
        result.updatedUids.push(profile.uid)
      }

      if (!deleteRemoteUsers) {
        return result
      }

      const managedRemoteUsers = await listManagedRemoteUsers()
      result.totalManagedRemoteUsers = managedRemoteUsers.length

      for (const remoteUser of managedRemoteUsers) {
        if (desiredUids.has(remoteUser.uid)) {
          continue
        }

        const deleted = await deleteRemoteUser(remoteUser.uid, { permanent: false })

        if (!deleted) {
          continue
        }

        result.deleted += 1
        result.deletedUids.push(remoteUser.uid)
      }

      return result
    },
  }
}

export type CometChatProvisioningService = ReturnType<typeof createCometChatProvisioningService>
export type { CometUserProfileRow }
