import { z } from 'zod'

const passwordSchema = z.string().min(1).max(4096)

export const signUpSchema = z
  .object({
    name: z.string().min(2).max(120),
    email: z.email(),
    password: passwordSchema,
    remember: z.boolean().optional(),
  })
  .strict()

export const signInSchema = z
  .object({
    email: z.email(),
    password: passwordSchema,
    remember: z.boolean().optional(),
  })
  .strict()

export const forgotPasswordSchema = z
  .object({
    email: z.email(),
  })
  .strict()

export const resetPasswordSchema = z
  .object({
    userId: z.string().min(1).max(128),
    secret: z.string().min(1).max(2048),
    password: passwordSchema,
  })
  .strict()

export const verifyEmailSchema = z
  .object({
    userId: z.string().min(1).max(128),
    secret: z.string().min(1).max(2048),
  })
  .strict()

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
