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

function getConfigSignature(config: CometChatCoreConfig) {
  return `${config.appId}:${config.region}:${config.authKey}`
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
        throw error
      })
  }

  await initPromise
}

export async function ensureCometChatRoleSession(
  config: CometChatRoleConfig,
) {
  await ensureCometChatInitialized(config)

  const loggedInUser = await CometChatUIKit.getLoggedinUser()

  if (loggedInUser?.getUid() === config.uid) {
    return loggedInUser
  }

  if (loggedInUser) {
    await CometChatUIKit.logout().catch(() => undefined)
  }

  return CometChatUIKit.login(config.uid)
}
