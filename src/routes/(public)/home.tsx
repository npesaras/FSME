import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAuthenticatedAccountOrNull, getDefaultAuthenticatedPath } from '../../features/auth/session'

export const Route = createFileRoute('/(public)/home')({
  beforeLoad: async () => {
    const account = await getAuthenticatedAccountOrNull()

    throw redirect({
      to: account ? getDefaultAuthenticatedPath(account) : '/sign-in',
    })
  },
})
