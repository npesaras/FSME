export type AuthAccount = {
  id: string
  name: string
  email: string
  status: string
  lastSignInAt: string | null
  createdAt: string
  updatedAt: string
}

export type AuthSession = {
  token: string
  account: AuthAccount
}

type SignInPayload = {
  email: string
  password: string
}

type SignUpPayload = {
  name: string
  email: string
  password: string
}

type ApiErrorPayload = {
  message?: string
}

const AUTH_STORAGE_KEY = 'fsme.auth.session'

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  return (configuredUrl || 'http://127.0.0.1:4000').replace(/\/+$/, '')
}

export class AuthApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)

    this.name = 'AuthApiError'
    this.statusCode = statusCode
  }
}

async function sendAuthRequest<TResponse>(
  path: string,
  payload: SignInPayload | SignUpPayload
): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as ApiErrorPayload | null

    throw new AuthApiError(
      errorPayload?.message || 'The authentication request failed.',
      response.status
    )
  }

  return response.json() as Promise<TResponse>
}

export function saveAuthSession(session: AuthSession) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getStoredAuthSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as AuthSession
  } catch {
    clearAuthSession()
    return null
  }
}

export function signIn(payload: SignInPayload) {
  return sendAuthRequest<AuthSession>('/api/v1/auth/sign-in', payload)
}

export function signUp(payload: SignUpPayload) {
  return sendAuthRequest<AuthSession>('/api/v1/auth/sign-up', payload)
}
