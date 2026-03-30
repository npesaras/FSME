import { CometChat } from '@cometchat/chat-sdk-javascript'
import { CometChatUIKit } from '@cometchat/chat-uikit-react'

export function getCometChatUserAuthToken(
  user: CometChat.User | null | undefined,
) {
  if (!user || typeof user.getAuthToken !== 'function') {
    return ''
  }

  const authToken = user.getAuthToken()

  return typeof authToken === 'string' ? authToken.trim() : ''
}

export async function getVerifiedCometChatLoggedInUser() {
  const uiKitUser = await CometChatUIKit.getLoggedinUser().catch(() => null)

  if (getCometChatUserAuthToken(uiKitUser)) {
    return uiKitUser
  }

  if (!uiKitUser) {
    return null
  }

  const sdkUser = await CometChat.getLoggedInUser().catch(() => null)

  return [uiKitUser, sdkUser].find((user): user is CometChat.User =>
    Boolean(getCometChatUserAuthToken(user)),
  ) ?? null
}
