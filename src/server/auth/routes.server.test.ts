import { describe, expect, it, vi } from 'vitest'
import { AppError } from './errors.server'
import {
  handleAppwriteHealthRequest,
  handleCurrentAccountRequest,
  handleHealthRequest,
  handleSignInRequest,
  handleSignOutRequest,
  handleSignUpRequest,
} from './routes.server'

function createRuntimeStub() {
  return {
    config: {
      envPaths: ['/home/zynex/dev/fsme/.env'],
      appwrite: {
        databaseId: 'db-1',
        accountsTableId: 'accounts',
      },
    },
    getAppwriteStatus: vi.fn().mockResolvedValue({
      status: 'ok',
      endpoint: 'https://example.appwrite.io/v1',
    }),
    appwrite: {
      tablesDB: {
        listTables: vi.fn().mockResolvedValue({
          total: 1,
          tables: [{ $id: 'accounts', name: 'Accounts' }],
        }),
      },
    },
    accounts: {
      signUp: vi.fn(),
      signIn: vi.fn(),
      getCurrentAccount: vi.fn(),
      signOut: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
    },
  }
}

describe('auth route handlers', () => {
  it('returns health metadata from the Start runtime', async () => {
    const runtime = createRuntimeStub()
    const response = await handleHealthRequest(runtime as never)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({
      status: 'ok',
      appwrite: {
        databaseId: 'db-1',
        accountsTableId: 'accounts',
      },
    })
  })

  it('returns Appwrite health metadata', async () => {
    const runtime = createRuntimeStub()
    const response = await handleAppwriteHealthRequest(runtime as never)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.endpoint).toBe('https://example.appwrite.io/v1')
    expect(runtime.getAppwriteStatus).toHaveBeenCalled()
  })

  it('sets the session cookie on sign-in', async () => {
    const runtime = createRuntimeStub()

    runtime.accounts.signIn.mockResolvedValue({
      account: {
        id: 'user-1',
        name: 'Jane Faculty',
        email: 'jane@example.com',
        role: 'faculty',
        status: 'active',
        lastSignInAt: null,
        createdAt: '2026-03-29T00:00:00.000Z',
        updatedAt: '2026-03-29T00:00:00.000Z',
      },
      session: {
        secret: 'session-secret',
        expire: '2026-04-01T00:00:00.000Z',
      },
    })

    const response = await handleSignInRequest(
      new Request('http://localhost/api/v1/auth/sign-in', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email: 'jane@example.com',
          password: 'secret-password',
          remember: false,
        }),
      }),
      runtime as never
    )

    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.account.role).toBe('faculty')
    expect(response.headers.get('set-cookie')).toContain('fsme_session=session-secret')
  })

  it('returns 201 and a session cookie on sign-up', async () => {
    const runtime = createRuntimeStub()

    runtime.accounts.signUp.mockResolvedValue({
      account: {
        id: 'user-1',
        name: 'Jane Faculty',
        email: 'jane@example.com',
        role: 'faculty',
        status: 'active',
        lastSignInAt: null,
        createdAt: '2026-03-29T00:00:00.000Z',
        updatedAt: '2026-03-29T00:00:00.000Z',
      },
      session: {
        secret: 'signup-session',
        expire: '2026-04-01T00:00:00.000Z',
      },
    })

    const response = await handleSignUpRequest(
      new Request('http://localhost/api/v1/auth/sign-up', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Jane Faculty',
          email: 'jane@example.com',
          password: 'secret-password',
        }),
      }),
      runtime as never
    )

    expect(response.status).toBe(201)
    expect(response.headers.get('set-cookie')).toContain('fsme_session=signup-session')
  })

  it('returns unauthorized for /auth/me when no cookie is present', async () => {
    const runtime = createRuntimeStub()
    const response = await handleCurrentAccountRequest(
      new Request('http://localhost/api/v1/auth/me'),
      runtime as never
    )
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.code).toBe('UNAUTHORIZED')
  })

  it('clears the cookie when /auth/me sees an invalid session', async () => {
    const runtime = createRuntimeStub()

    runtime.accounts.getCurrentAccount.mockRejectedValue(
      new AppError(401, 'Authentication required.', {
        code: 'UNAUTHORIZED',
      })
    )

    const response = await handleCurrentAccountRequest(
      new Request('http://localhost/api/v1/auth/me', {
        headers: {
          cookie: 'fsme_session=stale-session',
        },
      }),
      runtime as never
    )

    expect(response.status).toBe(401)
    expect(response.headers.get('set-cookie')).toContain('fsme_session=')
  })

  it('always clears the cookie on sign-out', async () => {
    const runtime = createRuntimeStub()

    runtime.accounts.signOut.mockResolvedValue({
      message: 'Signed out successfully.',
    })

    const response = await handleSignOutRequest(
      new Request('http://localhost/api/v1/auth/sign-out', {
        method: 'POST',
        headers: {
          cookie: 'fsme_session=session-secret',
        },
      }),
      runtime as never
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.message).toBe('Signed out successfully.')
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0')
  })
})
