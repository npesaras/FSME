import { createMiddleware } from '@tanstack/react-start'
import type { ServerLogger } from '../types/logger'
import { formatRequestLogMessage, getRequestDurationMs } from '../utils/request'
import { requestContextMiddleware } from './request-context'

const logger: ServerLogger = console

export const requestLoggerMiddleware = createMiddleware()
  .middleware([requestContextMiddleware])
  .server(async ({ context, next, request }) => {
    const { config } = await import('../shared/config.server')

    try {
      const result = await next()
      const durationMs = getRequestDurationMs(context.requestStartedAt)

      result.response.headers.set('x-request-id', context.requestId)

      if (config.server.logRequests) {
        logger.info?.(
          formatRequestLogMessage({
            request,
            requestId: context.requestId,
            durationMs,
            statusCode: result.response.status,
          })
        )
      }

      return result
    } catch (error) {
      if (config.server.logRequests) {
        logger.error?.(
          `[${context.requestId}] ${request.method.toUpperCase()} ${new URL(request.url).pathname} -> ERROR`,
          error
        )
      }

      throw error
    }
  })
