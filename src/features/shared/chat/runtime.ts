import {
  CometChatUIKit,
  UIKitSettingsBuilder,
} from '@cometchat/chat-uikit-react'
import { setupLocalization } from '../../../CometChat/utils/utils'
import type { CometChatRoleConfig } from './config'

type CometChatCoreConfig = Pick<
  CometChatRoleConfig,
  'appId' | 'region' | 'authKey'
>

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

    initPromise = CometChatUIKit.init(uiKitSettings)
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
  config: CometChatRoleConfig,
) {
  const runSessionTransition = sessionTransitionPromise
    .catch(() => null)
    .then(async () => {
      await ensureCometChatInitialized(config)

      const loggedInUser = await CometChatUIKit.getLoggedinUser()

      if (loggedInUser?.getUid() === config.uid) {
        return loggedInUser
      }

      if (loggedInUser) {
        await CometChatUIKit.logout().catch(() => undefined)
      }

      return CometChatUIKit.login(config.uid).catch((error) => {
        throw new Error(
          `CometChat login failed for ${config.actor} UID "${config.uid}": ${getCometChatErrorMessage(error)}`
        )
      })
    })

  sessionTransitionPromise = runSessionTransition

  return runSessionTransition.finally(() => {
    if (sessionTransitionPromise === runSessionTransition) {
      sessionTransitionPromise = Promise.resolve(null)
    }
  })
}
