import { redirect } from '@tanstack/react-router'
import type { AuthAccount, AuthRole } from './types'
import { getCurrentAccountServerFn } from './session.functions'

export async function getAuthenticatedAccountOrNull(): Promise<AuthAccount | null> {
  return getCurrentAccountServerFn()
}

export function getDefaultAuthenticatedPath(account: Pick<AuthAccount, 'role'>) {
  return account.role === 'panelist' ? '/panelist' : '/faculty'
}

export async function redirectAuthenticatedToRoleDashboard() {
  const account = await getAuthenticatedAccountOrNull()

  if (account) {
    throw redirect({
      to: getDefaultAuthenticatedPath(account),
    })
  }
}

export async function requireAuthenticatedRole(role: AuthRole) {
  const account = await getAuthenticatedAccountOrNull()

  if (!account) {
    throw redirect({
      to: '/sign-in',
    })
  }

  if (account.role !== role) {
    throw redirect({
      to: getDefaultAuthenticatedPath(account),
    })
  }

  return account
}
