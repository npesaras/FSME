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
  details?: Array<{
    path?: string
    message?: string
  }>
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
  details,
}: {
  path: string
  statusCode: number
  message?: string
  code?: string
  details?: ApiErrorPayload['details']
}) {
  if (code === 'INVALID_CREDENTIALS' || (path.includes('/auth/sign-in') && statusCode === 401)) {
    return 'We could not sign you in with that email and password. Please check them and try again.'
  }

  if (code === 'EMAIL_NOT_VERIFIED') {
    return 'Please verify your email before signing in. Check your inbox for the latest verification message.'
  }

  if (code === 'EMAIL_TAKEN' || (path.includes('/auth/sign-up') && statusCode === 409)) {
    return 'An account with this email already exists. Try signing in instead.'
  }

  if (code === 'INVALID_VERIFICATION') {
    return 'This verification link is invalid or has expired.'
  }

  if (code === 'INVALID_RECOVERY') {
    return 'This password reset link is invalid or has expired.'
  }

  if (code === 'ACCOUNT_BLOCKED') {
    return 'Your account is temporarily unavailable. Please contact support.'
  }

  if (code === 'ACCOUNT_ROLE_MISSING') {
    return 'Your account setup is incomplete. Please contact support.'
  }

  if (code === 'RATE_LIMITED') {
    return 'Please wait a moment, then try again.'
  }

  if (code === 'VERIFICATION_SEND_FAILED') {
    return 'We could not send the verification email right now. Please try again.'
  }

  if (code === 'SESSION_CREATION_FAILED') {
    if (path.includes('/auth/sign-up')) {
      return 'Your account was created, but we could not send the verification email. Please try signing in again in a moment.'
    }

    return 'We could not finish signing you in right now. Please try again.'
  }

  if (message?.includes('missing scope')) {
    return 'We could not finish signing you in right now. Please try again.'
  }

  if (code === 'VALIDATION_ERROR' || statusCode === 400 || looksLikeTechnicalValidationMessage(message)) {
    return getValidationMessage({
      path,
      message,
      details,
    })
  }

  if (statusCode === 401) {
    return 'Your session has expired. Please sign in again.'
  }

  if (statusCode === 403) {
    return 'You do not have access to complete this request.'
  }

  if (statusCode === 404) {
    return 'We could not find what you were looking for.'
  }

  if (statusCode === 409) {
    return 'This request could not be completed because something has already changed. Please try again.'
  }

  if (statusCode >= 500) {
    return getDefaultAuthErrorMessage(path)
  }

  return getDefaultAuthErrorMessage(path)
}

function getDefaultAuthErrorMessage(path: string) {
  if (path.includes('/auth/sign-in')) {
    return 'Unable to sign in right now. Please try again.'
  }

  if (path.includes('/auth/sign-up')) {
    return 'Unable to create your account right now. Please try again.'
  }

  if (path.includes('/auth/forgot-password')) {
    return 'Unable to send reset instructions right now. Please try again.'
  }

  if (path.includes('/auth/reset-password')) {
    return 'Unable to reset your password right now. Please try again.'
  }

  if (path.includes('/auth/verify-email')) {
    return 'Unable to verify your email right now. Please try again.'
  }

  return 'We could not complete your request right now. Please try again.'
}

function looksLikeTechnicalValidationMessage(message?: string) {
  const normalizedMessage = message?.toLowerCase()

  if (!normalizedMessage) {
    return false
  }

  return (
    normalizedMessage.includes('missing required') ||
    normalizedMessage.includes('required parameter') ||
    normalizedMessage.includes('request body is invalid') ||
    normalizedMessage.includes('payload') && normalizedMessage.includes('invalid') ||
    normalizedMessage.includes('param') && normalizedMessage.includes('invalid') ||
    normalizedMessage.includes('parameter') && normalizedMessage.includes('invalid') ||
    normalizedMessage.includes('must be a valid') ||
    normalizedMessage.includes('too short') ||
    normalizedMessage.includes('too long')
  )
}

function getValidationMessage({
  path,
  message,
  details,
}: {
  path: string
  message?: string
  details?: ApiErrorPayload['details']
}) {
  const fields = getMentionedFields(details, message)

  if (path.includes('/auth/sign-in')) {
    if (fields.has('email') && fields.has('password')) {
      return 'Enter your email address and password to continue.'
    }

    if (fields.has('email')) {
      return 'Enter a valid email address to continue.'
    }

    if (fields.has('password')) {
      return 'Enter your password to continue.'
    }

    return 'Please check your sign-in details and try again.'
  }

  if (path.includes('/auth/sign-up')) {
    if (fields.has('name')) {
      return 'Enter your full name to continue.'
    }

    if (fields.has('email')) {
      return 'Enter a valid email address to continue.'
    }

    if (fields.has('password')) {
      return 'Choose a stronger password and try again.'
    }

    return 'Please review your details and try again.'
  }

  if (path.includes('/auth/forgot-password')) {
    return 'Enter a valid email address to continue.'
  }

  if (path.includes('/auth/reset-password')) {
    if (fields.has('secret') || fields.has('userId')) {
      return 'This password reset link is invalid or incomplete.'
    }

    if (fields.has('password')) {
      return 'Choose a stronger password and try again.'
    }

    return 'Please check your new password and try again.'
  }

  if (path.includes('/auth/verify-email')) {
    return 'This verification link is invalid or incomplete.'
  }

  return 'Please review your details and try again.'
}

function getMentionedFields(details?: ApiErrorPayload['details'], message?: string) {
  const fields = new Set<string>()

  for (const detail of details ?? []) {
    if (detail.path) {
      fields.add(detail.path)
    }
  }

  const normalizedMessage = message?.toLowerCase() ?? ''

  if (normalizedMessage.includes('email')) {
    fields.add('email')
  }

  if (normalizedMessage.includes('password')) {
    fields.add('password')
  }

  if (normalizedMessage.includes('name')) {
    fields.add('name')
  }

  if (normalizedMessage.includes('secret')) {
    fields.add('secret')
  }

  if (
    normalizedMessage.includes('userid') ||
    normalizedMessage.includes('user id') ||
    normalizedMessage.includes('user_id')
  ) {
    fields.add('userId')
  }

  return fields
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
        details: errorPayload?.details,
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
