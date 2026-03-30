import { describe, expect, it, vi } from 'vitest'
import type { AuthRuntime } from '../../src/server/features/auth/runtime.server'
import {
  handleSignInRequest,
  handleSignUpRequest,
  handleVerifyEmailRequest,
} from '../../src/server/features/auth/routes.server'

function createRuntime(overrides: Partial<AuthRuntime['accounts']>) {
  return {
    accounts: {
      checkEmailStatus: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      completeEmailVerification: vi.fn(),
      getCurrentAccount: vi.fn(),
      signOut: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      getById: vi.fn(),
      ...overrides,
    },
  } as unknown as AuthRuntime
}

describe('auth route handlers', () => {
  it('does not set an auth cookie after sign-up', async () => {
    const runtime = createRuntime({
      signUp: vi.fn().mockResolvedValue({
        email: 'faculty@example.com',
        message: 'Check your email.',
        verificationRequired: true,
      }),
    })

    const response = await handleSignUpRequest(
      new Request('http://localhost:3000/api/v1/auth/sign-up', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Faculty User',
          email: 'faculty@example.com',
          password: 'secure-password',
        }),
      }),
      runtime,
    )

    expect(response.status).toBe(201)
    expect(response.headers.get('set-cookie')).toBeNull()
    await expect(response.json()).resolves.toMatchObject({
      verificationRequired: true,
    })
  })

  it('still sets the auth cookie for verified sign-in', async () => {
    const runtime = createRuntime({
      signIn: vi.fn().mockResolvedValue({
        account: {
          id: 'user-1',
          name: 'Faculty User',
          email: 'faculty@example.com',
          role: 'faculty',
          status: 'active',
          lastSignInAt: null,
          emailVerified: true,
          createdAt: '2026-03-30T00:00:00.000Z',
          updatedAt: '2026-03-30T00:00:00.000Z',
        },
        session: {
          secret: 'verified-session-secret',
          expire: '2026-03-31T00:00:00.000Z',
        },
      }),
    })

    const response = await handleSignInRequest(
      new Request('http://localhost:3000/api/v1/auth/sign-in', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email: 'faculty@example.com',
          password: 'secure-password',
          remember: true,
        }),
      }),
      runtime,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('set-cookie')).toContain('fsme_session=')
  })

  it('completes verification through the auth API route', async () => {
    const runtime = createRuntime({
      completeEmailVerification: vi.fn().mockResolvedValue({
        message: 'Email verified successfully. You can now sign in.',
      }),
    })

    const response = await handleVerifyEmailRequest(
      new Request('http://localhost:3000/api/v1/auth/verify-email', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user-1',
          secret: 'verification-secret',
        }),
      }),
      runtime,
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      message: 'Email verified successfully. You can now sign in.',
    })
  })
})
