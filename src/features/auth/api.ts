import type {
  AuthAccount,
  AuthMessageResponse,
  AuthSession,
  AuthVerificationPendingResponse,
} from './types'

export type {
  AuthAccount,
  AuthMessageResponse,
  AuthSession,
  AuthVerificationPendingResponse,
} from './types'

type SignInPayload = {
  email: string
  password: string
  remember?: boolean
}

type SignUpPayload = {
  name: string
  email: string
  password: string
}

type ForgotPasswordPayload = {
  email: string
}

type ResetPasswordPayload = {
  userId: string
  secret: string
  password: string
}

type VerifyEmailPayload = {
  userId: string
  secret: string
}

type ApiErrorPayload = {
  message?: string
  code?: string
}

export class AuthApiError extends Error {
  statusCode: number
  code?: string

  constructor(message: string, statusCode: number, code?: string) {
    super(message)

    this.name = 'AuthApiError'
    this.statusCode = statusCode
    this.code = code
  }
}

function getReadableAuthErrorMessage({
  path,
  statusCode,
  message,
  code,
}: {
  path: string
  statusCode: number
  message?: string
  code?: string
}) {
  if (code === 'INVALID_CREDENTIALS' || (path.includes('/auth/sign-in') && statusCode === 401)) {
    return 'We could not sign you in with that email and password. Please try again.'
  }

  if (code === 'EMAIL_NOT_VERIFIED') {
    return 'Your account is not yet verified.'
  }

  if (code === 'EMAIL_TAKEN' || (path.includes('/auth/sign-up') && statusCode === 409)) {
    return 'An account with this email already exists. Try signing in instead.'
  }

  if (code === 'INVALID_VERIFICATION') {
    return 'This verification link is invalid or has expired.'
  }

  if (code === 'ACCOUNT_BLOCKED') {
    return 'Your account has been temporarily suspended. Please contact support.'
  }

  if (code === 'ACCOUNT_ROLE_MISSING') {
    return 'Your account does not have an assigned application role. Please contact support.'
  }

  if (code === 'RATE_LIMITED') {
    return 'Please wait a moment before trying again.'
  }

  if (message?.includes('missing scope')) {
    return 'We could not finish signing you in right now. Please try again.'
  }

  return message || 'The authentication request failed.'
}

async function sendAuthRequest<TResponse>(
  path: string,
  options: {
    method?: 'GET' | 'POST'
    payload?:
      | SignInPayload
      | SignUpPayload
      | ForgotPasswordPayload
      | ResetPasswordPayload
      | VerifyEmailPayload
  } = {}
): Promise<TResponse> {
  let response: Response

  try {
    response = await fetch(path, {
      cache: 'no-store',
      method: options.method || 'POST',
      credentials: 'include',
      headers: options.payload
        ? {
            'Content-Type': 'application/json',
          }
        : undefined,
      body: options.payload ? JSON.stringify(options.payload) : undefined,
    })
  } catch (error) {
    throw new AuthApiError(
      'Cannot reach the authentication service right now. Please try again.',
      0
    )
  }

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as ApiErrorPayload | null

    throw new AuthApiError(
      getReadableAuthErrorMessage({
        path,
        statusCode: response.status,
        message: errorPayload?.message,
        code: errorPayload?.code,
      }),
      response.status,
      errorPayload?.code
    )
  }

  return response.json() as Promise<TResponse>
}

export function signIn(payload: SignInPayload) {
  return sendAuthRequest<AuthSession>('/api/v1/auth/sign-in', {
    payload,
  })
}

export function signUp(payload: SignUpPayload) {
  return sendAuthRequest<AuthVerificationPendingResponse>('/api/v1/auth/sign-up', {
    payload,
  })
}

export function forgotPassword(payload: ForgotPasswordPayload) {
  return sendAuthRequest<AuthMessageResponse>('/api/v1/auth/forgot-password', {
    payload,
  })
}

export function resetPassword(payload: ResetPasswordPayload) {
  return sendAuthRequest<AuthMessageResponse>('/api/v1/auth/reset-password', {
    payload,
  })
}

export function verifyEmail(payload: VerifyEmailPayload) {
  return sendAuthRequest<AuthMessageResponse>('/api/v1/auth/verify-email', {
    payload,
  })
}

export function getCurrentAccount() {
  return sendAuthRequest<{ account: AuthAccount }>('/api/v1/auth/me', {
    method: 'GET',
  })
}

export function signOut() {
  return sendAuthRequest<AuthMessageResponse>('/api/v1/auth/sign-out', {
    method: 'POST',
  })
}

export function deleteAccount() {
  return sendAuthRequest<AuthMessageResponse>('/api/v1/auth/delete-account', {
    method: 'POST',
  })
}
