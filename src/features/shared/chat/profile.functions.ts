import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { requireCurrentAccountFromRequest } from '#/server/features/auth/current-account.server'
import { authRuntime } from '#/server/features/auth/runtime.server'

export type CurrentCometChatProfile = {
  uid: string
  fullName: string
  role: 'faculty' | 'panelist'
  avatarUrl: string | null
  profileLink: string | null
}

export const getCurrentCometChatProfileServerFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CurrentCometChatProfile> => {
    const account = await requireCurrentAccountFromRequest(getRequest())
    const profile = await authRuntime.cometChat.ensureProfileForAccount(account)

    return {
      uid: profile.uid,
      fullName: profile.fullName,
      role: profile.role,
      avatarUrl: profile.avatarUrl,
      profileLink: profile.profileLink,
    }
  },
)
