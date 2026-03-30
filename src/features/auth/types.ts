export const authRoles = ['faculty', 'panelist'] as const

export type AuthRole = (typeof authRoles)[number]

export type AuthAccount = {
  id: string
  name: string
  email: string
  role: AuthRole
  status: string
  lastSignInAt: string | null
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export type AuthSession = {
  account: AuthAccount
}

export type AuthMessageResponse = {
  message: string
}

export type AuthVerificationPendingResponse = {
  message: string
  email: string
  verificationRequired: true
}
