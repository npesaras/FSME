import { describe, expect, it } from 'vitest'
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '../../src/server/features/auth/schemas'

describe('auth request schemas', () => {
  it('accepts a valid sign-up payload', () => {
    const parsed = signUpSchema.parse({
      name: 'Faculty Member',
      email: 'faculty@example.com',
      password: 'secure-password',
      remember: true,
    })

    expect(parsed).toMatchObject({
      name: 'Faculty Member',
      email: 'faculty@example.com',
      remember: true,
    })
  })

  it('rejects unexpected properties on sign-up payloads', () => {
    const result = signUpSchema.safeParse({
      name: 'Faculty Member',
      email: 'faculty@example.com',
      password: 'secure-password',
      role: 'panelist',
    })

    expect(result.success).toBe(false)
  })

  it('rejects invalid sign-in emails', () => {
    const result = signInSchema.safeParse({
      email: 'not-an-email',
      password: 'secure-password',
    })

    expect(result.success).toBe(false)
  })

  it('requires a reset-password secret and user id', () => {
    const result = resetPasswordSchema.safeParse({
      userId: '',
      secret: '',
      password: 'next-password',
    })

    expect(result.success).toBe(false)
  })

  it('requires an origin for forgot-password requests', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'faculty@example.com',
      origin: '',
    })

    expect(result.success).toBe(false)
  })
})
