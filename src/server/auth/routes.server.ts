import { z } from 'zod'
import { authRuntime, type AuthRuntime } from './runtime.server'
import { createClearedSessionCookieHeader, createSessionCookieHeader, getSessionSecretFromRequest } from './cookies.server'
import { AppError, createValidationError, errorResponse, jsonResponse } from './errors.server'
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from './schemas'

async function parseRequestJson<T>(request: Request, schema: z.ZodSchema<T>) {
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

function responseHeaders(headers: Record<string, string> = {}) {
  return new Headers(headers)
}

export async function handleHealthRequest(runtime: AuthRuntime = authRuntime) {
  try {
    return jsonResponse({
      status: 'ok',
      uptimeSeconds: Number(process.uptime().toFixed(2)),
      envPaths: runtime.config.envPaths,
      appwrite: {
        databaseId: runtime.config.appwrite.databaseId,
        accountsTableId: runtime.config.appwrite.accountsTableId,
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function handleAppwriteHealthRequest(runtime: AuthRuntime = authRuntime) {
  try {
    return jsonResponse({
      ...(await runtime.getAppwriteStatus()),
      checkedAt: new Date().toISOString(),
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function handleAppwriteTablesRequest(runtime: AuthRuntime = authRuntime) {
  try {
    const result = await runtime.appwrite.tablesDB.listTables({
      databaseId: runtime.config.appwrite.databaseId,
    })

    return jsonResponse({
      total: result.total,
      tables: result.tables.map((table) => ({
        id: table.$id,
        name: table.name,
      })),
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function handleSignUpRequest(request: Request, runtime: AuthRuntime = authRuntime) {
  try {
    const payload = await parseRequestJson(request, signUpSchema)
    const { account, session } = await runtime.accounts.signUp(payload)

    return jsonResponse(
      {
        account,
      },
      {
        status: 201,
        headers: responseHeaders({
          'set-cookie': createSessionCookieHeader(session.secret, {
            rememberSession: payload.remember !== false,
            expiresAt: session.expire,
          }),
        }),
      }
    )
  } catch (error) {
    return errorResponse(error)
  }
}

export async function handleSignInRequest(request: Request, runtime: AuthRuntime = authRuntime) {
  try {
    const payload = await parseRequestJson(request, signInSchema)
    const { account, session } = await runtime.accounts.signIn(payload)

    return jsonResponse(
      {
        account,
      },
      {
        headers: responseHeaders({
          'set-cookie': createSessionCookieHeader(session.secret, {
            rememberSession: payload.remember !== false,
            expiresAt: session.expire,
          }),
        }),
      }
    )
  } catch (error) {
    return errorResponse(error)
  }
}

export async function handleCurrentAccountRequest(
  request: Request,
  runtime: AuthRuntime = authRuntime
) {
  const sessionSecret = getSessionSecretFromRequest(request)

  if (!sessionSecret) {
    return errorResponse(
      new AppError(401, 'Authentication required.', {
        code: 'UNAUTHORIZED',
      })
    )
  }

  try {
    const account = await runtime.accounts.getCurrentAccount(sessionSecret)

    return jsonResponse({
      account,
    })
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 401) {
      return errorResponse(error, {
        headers: responseHeaders({
          'set-cookie': createClearedSessionCookieHeader(),
        }),
      })
    }

    return errorResponse(error)
  }
}

export async function handleSignOutRequest(
  request: Request,
  runtime: AuthRuntime = authRuntime
) {
  const sessionSecret = getSessionSecretFromRequest(request)

  try {
    const response = sessionSecret
      ? await runtime.accounts.signOut(sessionSecret)
      : { message: 'Signed out successfully.' }

    return jsonResponse(response, {
      headers: responseHeaders({
        'set-cookie': createClearedSessionCookieHeader(),
      }),
    })
  } catch (error) {
    return errorResponse(error, {
      headers: responseHeaders({
        'set-cookie': createClearedSessionCookieHeader(),
      }),
    })
  }
}

export async function handleForgotPasswordRequest(
  request: Request,
  runtime: AuthRuntime = authRuntime
) {
  try {
    const payload = await parseRequestJson(request, forgotPasswordSchema)
    const response = await runtime.accounts.forgotPassword(payload)

    return jsonResponse(response)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function handleResetPasswordRequest(
  request: Request,
  runtime: AuthRuntime = authRuntime
) {
  try {
    const payload = await parseRequestJson(request, resetPasswordSchema)
    const response = await runtime.accounts.resetPassword(payload)

    return jsonResponse(response)
  } catch (error) {
    return errorResponse(error)
  }
}
