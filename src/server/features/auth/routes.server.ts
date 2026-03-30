import { authRuntime, type AuthRuntime } from './runtime.server'
import { createClearedSessionCookieHeader, createSessionCookieHeader, getSessionSecretFromRequest } from './cookies.server'
import {
  AppError,
  errorResponse,
  jsonResponse,
} from '../../shared/errors.server'
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from './schemas'
import { createResponseHeaders, parseJsonRequest } from '../../utils/http.server'

function createUnauthorizedError() {
  return new AppError(401, 'Authentication required.', {
    code: 'UNAUTHORIZED',
  })
}

async function assertInternalDiagnosticsAccess(
  request: Request,
  runtime: AuthRuntime,
) {
  if (runtime.config.server.nodeEnv === 'production') {
    throw new AppError(404, 'Not found.', {
      code: 'NOT_FOUND',
    })
  }

  const sessionSecret = getSessionSecretFromRequest(request)

  if (!sessionSecret) {
    throw createUnauthorizedError()
  }

  await runtime.accounts.getCurrentAccount(sessionSecret)
}

export async function handleHealthRequest(_runtime: AuthRuntime = authRuntime) {
  try {
    return jsonResponse({
      status: 'ok',
      checkedAt: new Date().toISOString(),
      uptimeSeconds: Number(process.uptime().toFixed(2)),
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function handleAppwriteHealthRequest(
  request: Request,
  runtime: AuthRuntime = authRuntime,
) {
  try {
    await assertInternalDiagnosticsAccess(request, runtime)
    const status = await runtime.getAppwriteStatus()

    return jsonResponse({
      status: status.status,
      checkedAt: new Date().toISOString(),
      services: status.services,
      tables: {
        total: status.tables.total,
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function handleAppwriteTablesRequest(
  request: Request,
  runtime: AuthRuntime = authRuntime,
) {
  try {
    await assertInternalDiagnosticsAccess(request, runtime)
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
    const payload = await parseJsonRequest(request, signUpSchema)
    const response = await runtime.accounts.signUp({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      origin: new URL(request.url).origin,
    })

    return jsonResponse(response, {
      status: 201,
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function handleSignInRequest(request: Request, runtime: AuthRuntime = authRuntime) {
  try {
    const payload = await parseJsonRequest(request, signInSchema)
    const { account, session } = await runtime.accounts.signIn({
      email: payload.email,
      password: payload.password,
      origin: new URL(request.url).origin,
    })

    return jsonResponse(
      {
        account,
      },
      {
        headers: createResponseHeaders({
          'set-cookie': createSessionCookieHeader(session.secret, {
            rememberSession: payload.remember === true,
            expiresAt: session.expire,
          }),
        }),
      }
    )
  } catch (error) {
    return errorResponse(error)
  }
}

export async function handleVerifyEmailRequest(
  request: Request,
  runtime: AuthRuntime = authRuntime
) {
  try {
    const payload = await parseJsonRequest(request, verifyEmailSchema)
    const response = await runtime.accounts.completeEmailVerification(payload)

    return jsonResponse(response)
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
    return errorResponse(createUnauthorizedError())
  }

  try {
    const account = await runtime.accounts.getCurrentAccount(sessionSecret)

    return jsonResponse({
      account,
    })
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 401) {
      return errorResponse(error, {
        headers: createResponseHeaders({
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
      headers: createResponseHeaders({
        'set-cookie': createClearedSessionCookieHeader(),
      }),
    })
  } catch (error) {
    return errorResponse(error, {
      headers: createResponseHeaders({
        'set-cookie': createClearedSessionCookieHeader(),
      }),
    })
  }
}

export async function handleDeleteAccountRequest(
  request: Request,
  runtime: AuthRuntime = authRuntime
) {
  const sessionSecret = getSessionSecretFromRequest(request)

  if (!sessionSecret) {
    return errorResponse(createUnauthorizedError(), {
      headers: createResponseHeaders({
        'set-cookie': createClearedSessionCookieHeader(),
      }),
    })
  }

  try {
    const response = await runtime.accounts.deleteCurrentAccount(sessionSecret)

    return jsonResponse(response, {
      headers: createResponseHeaders({
        'set-cookie': createClearedSessionCookieHeader(),
      }),
    })
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 401) {
      return errorResponse(error, {
        headers: createResponseHeaders({
          'set-cookie': createClearedSessionCookieHeader(),
        }),
      })
    }

    return errorResponse(error)
  }
}

export async function handleForgotPasswordRequest(
  request: Request,
  runtime: AuthRuntime = authRuntime
) {
  try {
    const payload = await parseJsonRequest(request, forgotPasswordSchema)
    const response = await runtime.accounts.forgotPassword({
      email: payload.email,
      origin: new URL(request.url).origin,
    })

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
    const payload = await parseJsonRequest(request, resetPasswordSchema)
    const response = await runtime.accounts.resetPassword(payload)

    return jsonResponse(response)
  } catch (error) {
    return errorResponse(error)
  }
}
