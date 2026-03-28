const { AppError } = require('../errors')

const accountSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'name', 'email', 'status', 'lastSignInAt', 'createdAt', 'updatedAt'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    status: { type: 'string' },
    lastSignInAt: { type: ['string', 'null'] },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
}

const authResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['token', 'account'],
  properties: {
    token: { type: 'string' },
    account: accountSchema,
  },
}

async function authRoutes(fastify) {
  fastify.post(
    '/auth/sign-up',
    {
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 120,
            },
            email: {
              type: 'string',
              format: 'email',
            },
            password: {
              type: 'string',
              minLength: 8,
              maxLength: 128,
            },
          },
        },
        response: {
          201: authResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const account = await fastify.services.accounts.signUp(request.body)
      const token = await reply.jwtSign({
        sub: account.id,
        email: account.email,
      })

      reply.code(201)

      return {
        token,
        account,
      }
    }
  )

  fastify.post(
    '/auth/sign-in',
    {
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
            },
            password: {
              type: 'string',
              minLength: 8,
              maxLength: 128,
            },
          },
        },
        response: {
          200: authResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const account = await fastify.services.accounts.signIn(request.body)
      const token = await reply.jwtSign({
        sub: account.id,
        email: account.email,
      })

      return {
        token,
        account,
      }
    }
  )

  fastify.get(
    '/auth/me',
    {
      preHandler: [fastify.authenticate],
      schema: {
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['account'],
            properties: {
              account: accountSchema,
            },
          },
        },
      },
    },
    async (request) => {
      const account = await fastify.services.accounts.getById(request.user.sub)

      if (!account) {
        throw new AppError(404, 'Authenticated account was not found.', {
          code: 'ACCOUNT_NOT_FOUND',
        })
      }

      return {
        account,
      }
    }
  )
}

module.exports = authRoutes
