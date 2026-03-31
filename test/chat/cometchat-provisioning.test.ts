import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCometChatProvisioningService } from '../../src/server/features/chat/cometchat-provisioning.server'

function createTablesDb() {
  return {
    listRows: vi.fn(),
    createRow: vi.fn(),
    updateRow: vi.fn(),
    deleteRow: vi.fn(),
  }
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

describe('CometChat provisioning service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('requires a server-side CometChat API key before provisioning', async () => {
    const tablesDB = createTablesDb()
    const fetchMock = vi.fn()

    tablesDB.listRows.mockResolvedValue({ rows: [], total: 0 })
    vi.stubGlobal('fetch', fetchMock)

    const service = createCometChatProvisioningService({
      appId: 'app-id',
      region: 'us',
      apiKey: '',
      tablesDB,
      databaseId: 'main',
      cometUserProfilesTableId: 'comet_user_profiles',
      logger: console,
    })

    await expect(
      service.ensureProfileForAccount({
        id: 'user-1',
        name: 'Faculty User',
        role: 'faculty',
      }),
    ).rejects.toMatchObject({
      code: 'COMETCHAT_SERVER_CONFIG_MISSING',
      statusCode: 500,
    })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('creates a remote CometChat user when the UID does not exist yet', async () => {
    const tablesDB = createTablesDb()
    const fetchMock = vi.fn()

    tablesDB.listRows
      .mockResolvedValueOnce({ rows: [], total: 0 })
      .mockResolvedValueOnce({ rows: [], total: 0 })
    tablesDB.createRow.mockResolvedValue({
      $id: 'row-1',
      user_id: 'user-1',
      cometchat_uid: 'fsme-user-1',
      full_name: 'Faculty User',
      role: 'faculty',
      avatar_url: null,
      profile_link: null,
      auth_token: 'token-123',
    })
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(
          {
            error: {
              code: 'ERR_UID_NOT_FOUND',
              message: 'User not found.',
            },
          },
          404,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            uid: 'fsme-user-1',
            authToken: 'token-123',
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const service = createCometChatProvisioningService({
      appId: 'app-id',
      region: 'us',
      apiKey: 'server-api-key',
      tablesDB,
      databaseId: 'main',
      cometUserProfilesTableId: 'comet_user_profiles',
      logger: console,
    })

    const profile = await service.ensureProfileForAccount({
      id: 'user-1',
      name: 'Faculty User',
      role: 'faculty',
    })

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://app-id.api-us.cometchat.io/v3.0/users/fsme-user-1',
      expect.objectContaining({
        method: 'PUT',
      }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://app-id.api-us.cometchat.io/v3.0/users',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          apikey: 'server-api-key',
        }),
      }),
    )
    expect(tablesDB.createRow).toHaveBeenCalledWith({
      databaseId: 'main',
      tableId: 'comet_user_profiles',
      rowId: expect.any(String),
      data: {
        user_id: 'user-1',
        cometchat_uid: 'fsme-user-1',
        full_name: 'Faculty User',
        role: 'faculty',
        avatar_url: null,
        profile_link: null,
        auth_token: 'token-123',
      },
    })
    expect(profile).toMatchObject({
      userId: 'user-1',
      uid: 'fsme-user-1',
      fullName: 'Faculty User',
      role: 'faculty',
      authToken: 'token-123',
    })
  })

  it('updates an existing CometChat user and backfills the auth token when needed', async () => {
    const tablesDB = createTablesDb()
    const fetchMock = vi.fn()

    tablesDB.listRows.mockResolvedValue({
      rows: [
        {
          $id: 'row-1',
          user_id: 'user-1',
          cometchat_uid: 'fsme-user-1',
          full_name: 'Faculty User',
          role: 'faculty',
          avatar_url: null,
          profile_link: null,
          auth_token: null,
        },
      ],
      total: 1,
    })
    tablesDB.updateRow.mockResolvedValue({
      $id: 'row-1',
      user_id: 'user-1',
      cometchat_uid: 'fsme-user-1',
      full_name: 'Faculty User',
      role: 'faculty',
      avatar_url: null,
      profile_link: null,
      auth_token: 'token-456',
    })
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            uid: 'fsme-user-1',
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            authToken: 'token-456',
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const service = createCometChatProvisioningService({
      appId: 'app-id',
      region: 'us',
      apiKey: 'server-api-key',
      tablesDB,
      databaseId: 'main',
      cometUserProfilesTableId: 'comet_user_profiles',
      logger: console,
    })

    const profile = await service.ensureProfileForAccount({
      id: 'user-1',
      name: 'Faculty User',
      role: 'faculty',
    })

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://app-id.api-us.cometchat.io/v3.0/users/fsme-user-1/auth_tokens',
      expect.objectContaining({
        method: 'POST',
      }),
    )
    expect(tablesDB.updateRow).toHaveBeenCalledWith({
      databaseId: 'main',
      tableId: 'comet_user_profiles',
      rowId: 'row-1',
      data: {
        cometchat_uid: 'fsme-user-1',
        full_name: 'Faculty User',
        role: 'faculty',
        avatar_url: null,
        profile_link: null,
        auth_token: 'token-456',
      },
    })
    expect(profile).toMatchObject({
      uid: 'fsme-user-1',
      authToken: 'token-456',
    })
  })

  it('deletes the remote CometChat user when a mirrored profile is removed', async () => {
    const tablesDB = createTablesDb()
    const fetchMock = vi.fn()

    tablesDB.listRows
      .mockResolvedValueOnce({
        rows: [
          {
            $id: 'row-1',
            user_id: 'user-1',
            cometchat_uid: 'fsme-user-1',
            full_name: 'Faculty User',
            role: 'faculty',
            avatar_url: null,
            profile_link: null,
            auth_token: 'token-123',
          },
        ],
        total: 1,
      })
      .mockResolvedValueOnce({
        rows: [
          {
            $id: 'row-1',
            user_id: 'user-1',
            cometchat_uid: 'fsme-user-1',
            full_name: 'Faculty User',
            role: 'faculty',
            avatar_url: null,
            profile_link: null,
            auth_token: 'token-123',
          },
        ],
        total: 1,
      })
    tablesDB.deleteRow.mockResolvedValue({})
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { success: true } }))
    vi.stubGlobal('fetch', fetchMock)

    const service = createCometChatProvisioningService({
      appId: 'app-id',
      region: 'us',
      apiKey: 'server-api-key',
      tablesDB,
      databaseId: 'main',
      cometUserProfilesTableId: 'comet_user_profiles',
      logger: console,
    })

    await expect(service.deleteProfileForUser('user-1')).resolves.toBe(true)

    expect(tablesDB.deleteRow).toHaveBeenCalledWith({
      databaseId: 'main',
      tableId: 'comet_user_profiles',
      rowId: 'row-1',
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://app-id.api-us.cometchat.io/v3.0/users/fsme-user-1',
      expect.objectContaining({
        method: 'DELETE',
      }),
    )
  })

  it('reconciles stored Appwrite profiles and deletes stale managed CometChat users on demand', async () => {
    const tablesDB = createTablesDb()
    const fetchMock = vi.fn()

    tablesDB.listRows
      .mockResolvedValueOnce({
        rows: [
          {
            $id: 'row-1',
            user_id: 'user-1',
            cometchat_uid: 'fsme-user-1',
            full_name: 'Faculty User',
            role: 'faculty',
            avatar_url: null,
            profile_link: null,
            auth_token: 'token-123',
          },
          {
            $id: 'row-2',
            user_id: 'user-2',
            cometchat_uid: 'fsme-user-2',
            full_name: 'Panelist User',
            role: 'panelist',
            avatar_url: null,
            profile_link: null,
            auth_token: 'token-789',
          },
        ],
        total: 2,
      })
      .mockResolvedValueOnce({
        rows: [
          {
            $id: 'row-1',
            user_id: 'user-1',
            cometchat_uid: 'fsme-user-1',
            full_name: 'Faculty User',
            role: 'faculty',
            avatar_url: null,
            profile_link: null,
            auth_token: 'token-123',
          },
        ],
        total: 1,
      })
      .mockResolvedValueOnce({
        rows: [
          {
            $id: 'row-2',
            user_id: 'user-2',
            cometchat_uid: 'fsme-user-2',
            full_name: 'Panelist User',
            role: 'panelist',
            avatar_url: null,
            profile_link: null,
            auth_token: 'token-789',
          },
        ],
        total: 1,
      })
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { uid: 'fsme-user-1' } }))
      .mockResolvedValueOnce(jsonResponse({ data: { uid: 'fsme-user-2' } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              uid: 'fsme-user-1',
              metadata: { syncSource: 'appwrite' },
            },
            {
              uid: 'fsme-user-2',
              metadata: { syncSource: 'appwrite' },
            },
            {
              uid: 'fsme-user-3',
              metadata: { syncSource: 'appwrite' },
            },
          ],
          meta: {
            pagination: {
              totalPages: 1,
            },
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: { success: true } }))
    vi.stubGlobal('fetch', fetchMock)

    const service = createCometChatProvisioningService({
      appId: 'app-id',
      region: 'us',
      apiKey: 'server-api-key',
      tablesDB,
      databaseId: 'main',
      cometUserProfilesTableId: 'comet_user_profiles',
      logger: console,
    })

    const result = await service.syncStoredProfiles({ deleteRemoteUsers: true })

    expect(result).toEqual({
      totalLocalProfiles: 2,
      totalManagedRemoteUsers: 3,
      created: 0,
      updated: 2,
      deleted: 1,
      createdUids: [],
      updatedUids: ['fsme-user-1', 'fsme-user-2'],
      deletedUids: ['fsme-user-3'],
    })
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      'https://app-id.api-us.cometchat.io/v3.0/users/fsme-user-3',
      expect.objectContaining({
        method: 'DELETE',
      }),
    )
  })

  it('backfills remote users from authoritative Appwrite user profiles', async () => {
    const tablesDB = createTablesDb()
    const fetchMock = vi.fn()

    tablesDB.listRows.mockImplementation(async ({ tableId, queries }) => {
      const queryText = Array.isArray(queries) ? queries.join(' ') : ''

      if (tableId === 'user_profiles') {
        return {
          rows: [
            {
              $id: 'profile-1',
              user_id: 'user-1',
              full_name: 'Faculty User',
              role: 'faculty',
            },
          ],
          total: 1,
        }
      }

      if (tableId === 'comet_user_profiles' && queryText.includes('equal("user_id",["user-1"])')) {
        return {
          rows: [],
          total: 0,
        }
      }

      if (tableId === 'comet_user_profiles') {
        return {
          rows: [],
          total: 0,
        }
      }

      return { rows: [], total: 0 }
    })
    tablesDB.createRow.mockResolvedValue({
      $id: 'row-1',
      user_id: 'user-1',
      cometchat_uid: 'fsme-user-1',
      full_name: 'Faculty User',
      role: 'faculty',
      avatar_url: null,
      profile_link: null,
      auth_token: 'token-123',
    })
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(
          {
            error: {
              code: 'ERR_UID_NOT_FOUND',
              message: 'User not found.',
            },
          },
          404,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            uid: 'fsme-user-1',
            authToken: 'token-123',
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const service = createCometChatProvisioningService({
      appId: 'app-id',
      region: 'us',
      apiKey: 'server-api-key',
      tablesDB,
      databaseId: 'main',
      userProfilesTableId: 'user_profiles',
      cometUserProfilesTableId: 'comet_user_profiles',
      logger: console,
    })

    const result = await service.syncAuthoritativeProfiles()

    expect(result).toEqual({
      totalAuthoritativeProfiles: 1,
      totalLocalProfiles: 1,
      totalManagedRemoteUsers: 0,
      created: 1,
      updated: 0,
      deleted: 0,
      createdUids: ['fsme-user-1'],
      updatedUids: [],
      deletedUids: [],
      deletedLocalMirrorRows: 0,
      deletedLocalMirrorUserIds: [],
    })
    expect(tablesDB.createRow).toHaveBeenCalledWith({
      databaseId: 'main',
      tableId: 'comet_user_profiles',
      rowId: expect.any(String),
      data: {
        user_id: 'user-1',
        cometchat_uid: 'fsme-user-1',
        full_name: 'Faculty User',
        role: 'faculty',
        avatar_url: null,
        profile_link: null,
        auth_token: 'token-123',
      },
    })
  })
})
