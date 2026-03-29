import { createMiddleware } from '@tanstack/react-start'
import { createServerRequestContext } from '../utils/request'

export const requestContextMiddleware = createMiddleware().server(async ({ next, request }) => {
  const requestContext = createServerRequestContext(request)

  return next({
    context: requestContext,
  })
})
