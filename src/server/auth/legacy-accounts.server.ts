import { Query } from 'node-appwrite'
import { AppError } from './errors.server'

const LEGACY_SCRYPT_OPTIONS = Object.freeze({
  cpu: 16384,
  memory: 8,
  parallel: 1,
  length: 64,
})

export type LegacyAccount = {
  $id: string
  email: string
  name: string
  passwordHash: string
  status?: string | null
  role?: string | null
}

function isLegacyAccount(row: unknown): row is LegacyAccount {
  return typeof row === 'object' && row !== null && '$id' in row && 'email' in row
}

export function normalizeEmail(email: string) {
  return String(email).trim().toLowerCase()
}

export function normalizeName(name: string) {
  return String(name).trim().replace(/\s+/g, ' ')
}

function createTableMissingError(tableId: string) {
  return new AppError(500, `The Appwrite table "${tableId}" is not ready.`, {
    code: 'ACCOUNTS_TABLE_MISSING',
  })
}

export function parseLegacyScryptHash(storedHash: string) {
  const [algorithm, salt, hash] = String(storedHash).split('$')

  if (algorithm !== 'scrypt' || !salt || !hash) {
    throw new AppError(500, 'The legacy account password hash format is invalid.', {
      code: 'INVALID_LEGACY_PASSWORD_HASH',
    })
  }

  return {
    password: hash,
    passwordSalt: salt,
    passwordCpu: LEGACY_SCRYPT_OPTIONS.cpu,
    passwordMemory: LEGACY_SCRYPT_OPTIONS.memory,
    passwordParallel: LEGACY_SCRYPT_OPTIONS.parallel,
    passwordLength: LEGACY_SCRYPT_OPTIONS.length,
  }
}

type LegacyAccountsRepositoryOptions = {
  tablesDB: {
    listRows: (options: {
      databaseId: string
      tableId: string
      queries?: string[]
    }) => Promise<{ rows: unknown[]; total: number }>
    getRow: (options: {
      databaseId: string
      tableId: string
      rowId: string
    }) => Promise<unknown>
  }
  databaseId: string
  tableId: string
  logger?: {
    warn?: (...args: unknown[]) => void
  }
  strict?: boolean
}

export function createLegacyAccountsRepository({
  tablesDB,
  databaseId,
  tableId,
  logger,
  strict = false,
}: LegacyAccountsRepositoryOptions) {
  let hasLoggedMissingTable = false

  function handleMissingTable(error: unknown) {
    if (!(typeof error === 'object' && error !== null && 'code' in error && error.code === 404)) {
      throw error
    }

    if (strict) {
      throw createTableMissingError(tableId)
    }

    if (!hasLoggedMissingTable) {
      hasLoggedMissingTable = true
      logger?.warn?.(
        {
          tableId,
        },
        'Legacy accounts table was not found. Continuing without legacy account fallback.'
      )
    }

    return null
  }

  return {
    async findByEmail(email: string) {
      try {
        const result = await tablesDB.listRows({
          databaseId,
          tableId,
          queries: [Query.equal('email', normalizeEmail(email)), Query.limit(1)],
        })

        return isLegacyAccount(result.rows[0]) ? result.rows[0] : null
      } catch (error) {
        return handleMissingTable(error)
      }
    },

    async findById(accountId: string) {
      try {
        const row = await tablesDB.getRow({
          databaseId,
          tableId,
          rowId: accountId,
        })

        return isLegacyAccount(row) ? row : null
      } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 404) {
          return null
        }

        throw error
      }
    },

    async listAll({ pageSize = 100 }: { pageSize?: number } = {}) {
      let offset = 0
      const rows: LegacyAccount[] = []

      while (true) {
        let result

        try {
          result = await tablesDB.listRows({
            databaseId,
            tableId,
            queries: [Query.limit(pageSize), Query.offset(offset)],
          })
        } catch (error) {
          const fallback = handleMissingTable(error)

          return fallback === null ? [] : fallback
        }

        rows.push(...result.rows.filter(isLegacyAccount))
        offset += result.rows.length

        if (result.rows.length === 0 || offset >= result.total) {
          break
        }
      }

      return rows
    },
  }
}
