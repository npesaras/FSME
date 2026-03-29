import { z } from 'zod'
import { AppError, createValidationError } from '../shared/errors.server'

export async function parseJsonRequest<T>(request: Request, schema: z.ZodSchema<T>) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    throw new AppError(400, 'The request body is invalid.', {
      code: 'VALIDATION_ERROR',
    })
  }

  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    throw createValidationError(parsed.error)
  }

  return parsed.data
}

export function createResponseHeaders(headers: HeadersInit = {}) {
  return new Headers(headers)
}
