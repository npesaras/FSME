import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCurrentAccountServerFn } from './session.functions'
import {
  getDefaultAuthenticatedPath,
  redirectAuthenticatedToRoleDashboard,
  requireAuthenticatedRole,
} from './session'

vi.mock('./session.functions', () => ({
  getCurrentAccountServerFn: vi.fn(),
}))

const mockedGetCurrentAccountServerFn = vi.mocked(getCurrentAccountServerFn)

describe('auth session helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps faculty and panelist users to the correct default path', () => {
    expect(getDefaultAuthenticatedPath({ role: 'faculty' })).toBe('/faculty')
    expect(getDefaultAuthenticatedPath({ role: 'panelist' })).toBe('/panelist')
  })

  it('redirects authenticated users to their role dashboard', async () => {
    mockedGetCurrentAccountServerFn.mockResolvedValue({
      id: 'panel-1',
      name: 'Panel User',
      email: 'panel@example.com',
      role: 'panelist',
      status: 'active',
      lastSignInAt: null,
      createdAt: '2026-03-29T00:00:00.000Z',
      updatedAt: '2026-03-29T00:00:00.000Z',
    })

    await expect(redirectAuthenticatedToRoleDashboard()).rejects.toMatchObject({
      options: {
        to: '/panelist',
      },
    })
  })

  it('redirects unauthenticated users to sign-in when a role is required', async () => {
    mockedGetCurrentAccountServerFn.mockResolvedValue(null)

    await expect(requireAuthenticatedRole('faculty')).rejects.toMatchObject({
      options: {
        to: '/sign-in',
      },
    })
  })

  it('redirects authenticated users away from the wrong role area', async () => {
    mockedGetCurrentAccountServerFn.mockResolvedValue({
      id: 'panel-1',
      name: 'Panel User',
      email: 'panel@example.com',
      role: 'panelist',
      status: 'active',
      lastSignInAt: null,
      createdAt: '2026-03-29T00:00:00.000Z',
      updatedAt: '2026-03-29T00:00:00.000Z',
    })

    await expect(requireAuthenticatedRole('faculty')).rejects.toMatchObject({
      options: {
        to: '/panelist',
      },
    })
  })

  it('returns the account when the authenticated role matches', async () => {
    mockedGetCurrentAccountServerFn.mockResolvedValue({
      id: 'faculty-1',
      name: 'Faculty User',
      email: 'faculty@example.com',
      role: 'faculty',
      status: 'active',
      lastSignInAt: null,
      createdAt: '2026-03-29T00:00:00.000Z',
      updatedAt: '2026-03-29T00:00:00.000Z',
    })

    await expect(requireAuthenticatedRole('faculty')).resolves.toMatchObject({
      role: 'faculty',
    })
  })
})
