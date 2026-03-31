import { authRuntime, type AuthRuntime } from '#/server/features/auth/runtime.server'
import {
  AppError,
  errorResponse,
  jsonResponse,
} from '../../shared/errors.server'

function readSyncTokenFromRequest(request: Request) {
  const authorizationHeader = request.headers.get('authorization')?.trim() ?? ''

  if (authorizationHeader.toLowerCase().startsWith('bearer ')) {
    const bearerToken = authorizationHeader.slice('bearer '.length).trim()

    if (bearerToken) {
      return bearerToken
    }
  }

  const headerToken = request.headers.get('x-cometchat-sync-token')?.trim()

  return headerToken || ''
}

function assertCometChatSyncAccess(request: Request, runtime: AuthRuntime) {
  const expectedToken = runtime.config.cometchat.syncToken

  if (!expectedToken) {
    throw new AppError(
      503,
      'CometChat sync is not configured. Add COMETCHAT_SYNC_TOKEN to your .env before using the sync endpoint.',
      {
        code: 'COMETCHAT_SYNC_NOT_CONFIGURED',
      },
    )
  }

  const receivedToken = readSyncTokenFromRequest(request)

  if (!receivedToken || receivedToken !== expectedToken) {
    throw new AppError(401, 'Authentication required.', {
      code: 'UNAUTHORIZED',
    })
  }
}

function readDeleteStaleFlag(request: Request) {
  const rawValue = new URL(request.url).searchParams.get('deleteStale')?.trim().toLowerCase()

  return rawValue === '1' || rawValue === 'true' || rawValue === 'yes'
}

export async function handleCometChatSyncRequest(
  request: Request,
  runtime: AuthRuntime = authRuntime,
) {
  try {
    assertCometChatSyncAccess(request, runtime)

    const deleteStale = readDeleteStaleFlag(request)
    const result = await runtime.cometChat.syncAuthoritativeProfiles({
      deleteRemoteUsers: deleteStale,
    })

    return jsonResponse({
      checkedAt: new Date().toISOString(),
      deleteStale,
      ...result,
    })
  } catch (error) {
    return errorResponse(error)
  }
}
