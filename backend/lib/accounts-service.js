const { ID, Query } = require('node-appwrite')
const { AppError } = require('./errors')
const { hashPassword, verifyPassword } = require('./passwords')

function normalizeEmail(email) {
  return String(email).trim().toLowerCase()
}

function normalizeName(name) {
  return String(name).trim().replace(/\s+/g, ' ')
}

function toPublicAccount(row) {
  return {
    id: row.$id,
    name: row.name,
    email: row.email,
    status: row.status,
    lastSignInAt: row.lastSignInAt || null,
    createdAt: row.$createdAt,
    updatedAt: row.$updatedAt,
  }
}

function createTableMissingError(tableId) {
  return new AppError(
    500,
    `The Appwrite table "${tableId}" is not ready. Run "npm run appwrite:reset-accounts" in the backend first.`,
    {
      code: 'ACCOUNTS_TABLE_MISSING',
    }
  )
}

function createAccountsService({ tablesDB, databaseId, tableId }) {
  async function findByEmail(email) {
    try {
      const result = await tablesDB.listRows({
        databaseId,
        tableId,
        queries: [Query.equal('email', normalizeEmail(email)), Query.limit(1)],
      })

      return result.rows[0] || null
    } catch (error) {
      if (error.code === 404) {
        throw createTableMissingError(tableId)
      }

      throw error
    }
  }

  async function findById(accountId) {
    try {
      return await tablesDB.getRow({
        databaseId,
        tableId,
        rowId: accountId,
      })
    } catch (error) {
      if (error.code === 404) {
        return null
      }

      throw error
    }
  }

  return {
    async signUp({ name, email, password }) {
      const normalizedEmail = normalizeEmail(email)
      const normalizedName = normalizeName(name)
      const existingAccount = await findByEmail(normalizedEmail)

      if (existingAccount) {
        throw new AppError(409, 'An account with that email already exists.', {
          code: 'EMAIL_TAKEN',
        })
      }

      const passwordHash = await hashPassword(password)

      try {
        const row = await tablesDB.createRow({
          databaseId,
          tableId,
          rowId: ID.unique(),
          data: {
            name: normalizedName,
            email: normalizedEmail,
            passwordHash,
            status: 'active',
            lastSignInAt: new Date().toISOString(),
          },
          permissions: [],
        })

        return toPublicAccount(row)
      } catch (error) {
        if (error.code === 404) {
          throw createTableMissingError(tableId)
        }

        if (error.code === 409) {
          throw new AppError(409, 'An account with that email already exists.', {
            code: 'EMAIL_TAKEN',
          })
        }

        throw error
      }
    },

    async signIn({ email, password }) {
      const row = await findByEmail(email)

      if (!row) {
        throw new AppError(401, 'Invalid email or password.', {
          code: 'INVALID_CREDENTIALS',
        })
      }

      const isPasswordValid = await verifyPassword(password, row.passwordHash)

      if (!isPasswordValid) {
        throw new AppError(401, 'Invalid email or password.', {
          code: 'INVALID_CREDENTIALS',
        })
      }

      const updatedRow = await tablesDB.updateRow({
        databaseId,
        tableId,
        rowId: row.$id,
        data: {
          lastSignInAt: new Date().toISOString(),
        },
      })

      return toPublicAccount(updatedRow)
    },

    async getById(accountId) {
      const row = await findById(accountId)

      return row ? toPublicAccount(row) : null
    },
  }
}

module.exports = {
  createAccountsService,
}
