import { createStart } from '@tanstack/react-start'
import { requestLoggerMiddleware } from './server/middlewares/request-logger'

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [requestLoggerMiddleware],
  }
})
