export type ChatActor = 'faculty' | 'panelist'

export type CometChatRoleConfig = {
  actor: ChatActor
  appId: string
  region: string
  authKey: string
  missingKeys: string[]
}

function readEnv(value: string | undefined) {
  const normalizedValue = value?.trim() ?? ''

  if (!normalizedValue) {
    return ''
  }

  if (
    normalizedValue.startsWith('YOUR_') ||
    normalizedValue.startsWith('REPLACE_') ||
    normalizedValue === 'UID'
  ) {
    return ''
  }

  return normalizedValue
}

export function getCometChatRoleConfig(actor: ChatActor): CometChatRoleConfig {
  const appId = readEnv(import.meta.env.VITE_COMETCHAT_APP_ID)
  const region = readEnv(import.meta.env.VITE_COMETCHAT_REGION)
  const authKey = readEnv(import.meta.env.VITE_COMETCHAT_AUTH_KEY)

  const missingKeys = [
    ['VITE_COMETCHAT_APP_ID', appId],
    ['VITE_COMETCHAT_REGION', region],
    ['VITE_COMETCHAT_AUTH_KEY', authKey],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key)

  return {
    actor,
    appId,
    region,
    authKey,
    missingKeys,
  }
}
