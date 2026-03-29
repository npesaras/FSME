import { parse, serialize, type SerializeOptions } from 'cookie'
import { config } from '../../shared/config.server'

function getBaseCookieOptions(): SerializeOptions {
  return {
    httpOnly: true,
    path: '/',
    sameSite: config.auth.cookieSameSite,
    secure: config.auth.cookieSecure,
  }
}

export function getSessionSecretFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie')

  if (!cookieHeader) {
    return null
  }

  return parse(cookieHeader)[config.auth.cookieName] || null
}

export function createSessionCookieHeader(
  sessionSecret: string,
  options: {
    rememberSession?: boolean
    expiresAt?: string
  } = {}
) {
  const cookieOptions = getBaseCookieOptions()

  if (options.rememberSession !== false && options.expiresAt) {
    cookieOptions.expires = new Date(options.expiresAt)
  }

  return serialize(config.auth.cookieName, sessionSecret, cookieOptions)
}

export function createClearedSessionCookieHeader() {
  return serialize(config.auth.cookieName, '', {
    ...getBaseCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  })
}
