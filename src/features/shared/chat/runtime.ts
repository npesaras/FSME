import {
  CometChatUIKit,
  UIKitSettingsBuilder,
} from '@cometchat/chat-uikit-react'
import { CometChat } from '@cometchat/chat-sdk-javascript'
import { setupLocalization } from '#/cometChat/utils/utils'
import type { CometChatRoleConfig } from './config'
import {
  getCometChatUserAuthToken,
  getVerifiedCometChatLoggedInUser,
} from './session'

type CometChatCoreConfig = Pick<
  CometChatRoleConfig,
  'appId' | 'region' | 'authKey'
>

type CometChatSessionConfig = CometChatRoleConfig & {
  uid: string
}

let initializedSignature: string | null = null
let initPromise: Promise<void> | null = null
let sessionTransitionPromise: Promise<CometChat.User | null> = Promise.resolve(null)

function getConfigSignature(config: CometChatCoreConfig) {
  return `${config.appId}:${config.region}:${config.authKey}`
}

function getCometChatErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error) {
    return error
  }

  if (error && typeof error === 'object') {
    const candidate = error as Record<string, unknown>
    const details = [
      typeof candidate.message === 'string' ? candidate.message : null,
      typeof candidate.description === 'string' ? candidate.description : null,
      typeof candidate.details === 'string' ? candidate.details : null,
      typeof candidate.code === 'string' ? `code: ${candidate.code}` : null,
    ].filter(Boolean)

    if (details.length > 0) {
      return details.join(' | ')
    }

    try {
      return JSON.stringify(candidate)
    } catch {
      return 'Unknown CometChat error.'
    }
  }

  return 'Unknown CometChat error.'
}

export async function ensureCometChatInitialized(
  config: CometChatCoreConfig,
) {
  const signature = getConfigSignature(config)

  if (initializedSignature === signature) {
    return
  }

  if (!initPromise) {
    const uiKitSettings = new UIKitSettingsBuilder()
      .setAppId(config.appId)
      .setRegion(config.region)
      .setAuthKey(config.authKey)
      .subscribePresenceForAllUsers()
      .build()
    const initCometChatUIKit = CometChatUIKit.init?.bind(CometChatUIKit)
    const initResult = initCometChatUIKit?.(uiKitSettings)

    initPromise = (
      initResult ?? Promise.reject(new Error('CometChat UIKit initialization is unavailable.'))
    )
      .then(() => {
        setupLocalization()
        initializedSignature = signature
      })
      .catch((error) => {
        initPromise = null
        throw new Error(
          `CometChat initialization failed: ${getCometChatErrorMessage(error)}`
        )
      })
  }

  await initPromise
}

export async function ensureCometChatRoleSession(
  config: CometChatSessionConfig,
) {
  const runSessionTransition = sessionTransitionPromise
    .catch(() => null)
    .then(async () => {
      await ensureCometChatInitialized(config)

      const loggedInUser = await getVerifiedCometChatLoggedInUser()

      if (loggedInUser?.getUid() === config.uid) {
        return loggedInUser
      }

      if (loggedInUser) {
        await Promise.allSettled([
          CometChatUIKit.logout().catch(() => undefined),
          CometChat.logout().catch(() => undefined),
        ])
      }

      const loggedInSession = await CometChatUIKit.login(config.uid).catch(
        (error) => {
          throw new Error(
            `CometChat login failed for ${config.actor} UID "${config.uid}": ${getCometChatErrorMessage(error)}`
          )
        },
      )
      const verifiedUser =
        (await getVerifiedCometChatLoggedInUser()) ?? loggedInSession

      if (
        verifiedUser?.getUid() === config.uid &&
        getCometChatUserAuthToken(verifiedUser)
      ) {
        return verifiedUser
      }

      throw new Error(
        `CometChat login failed for ${config.actor} UID "${config.uid}": the SDK did not produce a usable auth token. Restart the frontend dev server if you recently changed .env, and confirm that this UID exists in your CometChat app.`,
      )
    })

  sessionTransitionPromise = runSessionTransition

  return runSessionTransition.finally(() => {
    if (sessionTransitionPromise === runSessionTransition) {
      sessionTransitionPromise = Promise.resolve(null)
    }
  })
}
