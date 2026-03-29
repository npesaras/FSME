import type { ServerRequestContext } from '../types/request'

export function createServerRequestContext(request: Request): ServerRequestContext {
  const forwardedRequestId = request.headers.get('x-request-id')?.trim()

  return {
    requestId: forwardedRequestId || globalThis.crypto.randomUUID(),
    requestStartedAt: Date.now(),
  }
}

export function getRequestDurationMs(requestStartedAt: number) {
  return Date.now() - requestStartedAt
}

export function getRequestTarget(request: Request) {
  const url = new URL(request.url)

  return `${request.method.toUpperCase()} ${url.pathname}${url.search}`
}

export function formatRequestLogMessage(options: {
  request: Request
  requestId: string
  durationMs: number
  statusCode: number
}) {
  return `[${options.requestId}] ${getRequestTarget(options.request)} -> ${options.statusCode} (${options.durationMs}ms)`
}
