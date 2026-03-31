import { describe, expect, it, vi } from 'vitest'
import type { AuthRuntime } from '../../src/server/features/auth/runtime.server'
import { handleCometChatSyncRequest } from '../../src/server/features/chat/routes.server'

function createRuntime(overrides: Partial<AuthRuntime['cometChat']> = {}, syncToken = 'sync-secret') {
  return {
    config: {
      cometchat: {
        syncToken,
      },
    },
    cometChat: {
      syncAuthoritativeProfiles: vi.fn(),
      ...overrides,
    },
  } as unknown as AuthRuntime
}

describe('cometchat sync route handler', () => {
  it('runs the sync service when the bearer token is valid', async () => {
    const runtime = createRuntime({
      syncAuthoritativeProfiles: vi.fn().mockResolvedValue({
        totalAuthoritativeProfiles: 2,
        totalLocalProfiles: 2,
        totalManagedRemoteUsers: 0,
        created: 1,
        updated: 1,
        deleted: 0,
        createdUids: ['fsme-user-1'],
        updatedUids: ['fsme-user-2'],
        deletedUids: [],
        deletedLocalMirrorRows: 0,
        deletedLocalMirrorUserIds: [],
      }),
    })

    const response = await handleCometChatSyncRequest(
      new Request('http://localhost:3000/api/v1/chat/sync?deleteStale=true', {
        method: 'POST',
        headers: {
          authorization: 'Bearer sync-secret',
        },
      }),
      runtime,
    )

    expect(response.status).toBe(200)
    expect(runtime.cometChat.syncAuthoritativeProfiles).toHaveBeenCalledWith({
      deleteRemoteUsers: true,
    })
    await expect(response.json()).resolves.toMatchObject({
      deleteStale: true,
      created: 1,
      updated: 1,
    })
  })

  it('rejects the sync request when the token is missing or invalid', async () => {
    const runtime = createRuntime()

    const response = await handleCometChatSyncRequest(
      new Request('http://localhost:3000/api/v1/chat/sync', {
        method: 'GET',
      }),
      runtime,
    )

    expect(response.status).toBe(401)
    expect(runtime.cometChat.syncAuthoritativeProfiles).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toMatchObject({
      code: 'UNAUTHORIZED',
    })
  })

  it('returns a configuration error when the sync token is not configured', async () => {
    const runtime = createRuntime({}, '')

    const response = await handleCometChatSyncRequest(
      new Request('http://localhost:3000/api/v1/chat/sync', {
        method: 'POST',
        headers: {
          authorization: 'Bearer sync-secret',
        },
      }),
      runtime,
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      code: 'COMETCHAT_SYNC_NOT_CONFIGURED',
    })
  })
})
