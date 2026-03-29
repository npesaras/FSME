import type { ZodError } from 'zod'

export type ValidationDetail = {
  path: string
  message: string
}

export class AppError extends Error {
  statusCode: number
  code?: string | number
  details?: ValidationDetail[]

  constructor(
    statusCode: number,
    message: string,
    options: {
      code?: string | number
      details?: ValidationDetail[]
    } = {}
  ) {
    super(message)

    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = options.code
    this.details = options.details
  }
}

function getStatusLabel(statusCode: number) {
  if (statusCode === 400) {
    return 'Bad Request'
  }

  if (statusCode === 401) {
    return 'Unauthorized'
  }

  if (statusCode === 403) {
    return 'Forbidden'
  }

  if (statusCode === 404) {
    return 'Not Found'
  }

  if (statusCode === 409) {
    return 'Conflict'
  }

  if (statusCode === 429) {
    return 'Too Many Requests'
  }

  return 'Error'
}

export function createValidationDetails(error: ZodError) {
  return error.issues.map((issue) => ({
    path:
      issue.path
        .map((segment) => String(segment))
        .join('.') || '',
    message: issue.message,
  }))
}

export function createValidationError(error: ZodError) {
  return new AppError(400, 'The request body is invalid.', {
    code: 'VALIDATION_ERROR',
    details: createValidationDetails(error),
  })
}

export function jsonResponse(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)

  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json; charset=utf-8')
  }

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  })
}

export function errorResponse(
  error: unknown,
  init: {
    headers?: HeadersInit
  } = {}
) {
  const isKnownAppError = error instanceof AppError
  const externalStatusCode =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'number'
      ? (error as { code: number }).code
      : undefined
  const statusCode =
    typeof error === 'object' && error !== null && 'statusCode' in error
      ? Number((error as { statusCode?: unknown }).statusCode) || externalStatusCode || 500
      : externalStatusCode || 500
  const safeMessage =
    statusCode >= 500 && !isKnownAppError
      ? 'Something went wrong on the server.'
      : error instanceof Error
        ? error.message
        : 'Something went wrong on the server.'
  const payload: {
    error: string
    message: string
    code?: string
    details?: ValidationDetail[]
  } = {
    error: getStatusLabel(statusCode),
    message: safeMessage,
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string' &&
    (statusCode < 500 || isKnownAppError)
  ) {
    payload.code = (error as { code: string }).code
  }

  if (isKnownAppError && error.details?.length) {
    payload.details = error.details
  }

  if (statusCode >= 500) {
    console.error(error)
  }

  return jsonResponse(payload, {
    status: statusCode,
    headers: init.headers,
  })
}
