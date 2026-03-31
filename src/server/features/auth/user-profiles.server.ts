import { ID, Query, type Models } from 'node-appwrite'
import type { AuthRole } from '#/features/auth/types'
import { AppError } from '../../shared/errors.server'
import type { ServerLogger } from '../../types/logger'

export interface UserProfileRow extends Models.Row {
  user_id: string
  full_name: string
  role: AuthRole
  department?: string | null
  college_or_office?: string | null
  employee_no?: string | null
  phone?: string | null
}

type UserProfilesRepositoryOptions = {
  tablesDB: {
    listRows: <Row extends Models.Row = Models.DefaultRow>(options: {
      databaseId: string
      tableId: string
      queries?: string[]
      total?: boolean
    }) => Promise<{ rows: Row[]; total: number }>
    createRow: <Row extends Models.Row = Models.DefaultRow>(options: {
      databaseId: string
      tableId: string
      rowId: string
      data: Record<string, unknown>
      permissions?: string[]
    }) => Promise<Row>
    updateRow: <Row extends Models.Row = Models.DefaultRow>(options: {
      databaseId: string
      tableId: string
      rowId: string
      data: Record<string, unknown>
      permissions?: string[]
    }) => Promise<Row>
    deleteRow: (options: {
      databaseId: string
      tableId: string
      rowId: string
    }) => Promise<unknown>
  }
  databaseId: string
  tableId: string
  logger?: ServerLogger
}

function isMissingTableError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 404
}

export function createUserProfilesRepository({
  tablesDB,
  databaseId,
  tableId,
  logger,
}: UserProfilesRepositoryOptions) {
  function createTableMissingError() {
    return new AppError(500, `The Appwrite table "${tableId}" is not ready.`, {
      code: 'USER_PROFILES_TABLE_MISSING',
    })
  }

  async function findByUserId(userId: string) {
    try {
      const result = await tablesDB.listRows<UserProfileRow>({
        databaseId,
        tableId,
        queries: [Query.equal('user_id', [userId]), Query.limit(1)],
        total: false,
      })

      return result.rows[0] || null
    } catch (error) {
      if (isMissingTableError(error)) {
        logger?.warn?.({ tableId }, 'User profiles table was not found while resolving auth profile data.')
        throw createTableMissingError()
      }

      throw error
    }
  }

  return {
    async findByUserId(userId: string) {
      return findByUserId(userId)
    },

    async listProfiles({ limit = 100 }: { limit?: number } = {}) {
      const rows: UserProfileRow[] = []
      let offset = 0

      while (true) {
        try {
          const result = await tablesDB.listRows<UserProfileRow>({
            databaseId,
            tableId,
            queries: [Query.orderAsc('user_id'), Query.limit(limit), Query.offset(offset)],
            total: false,
          })

          rows.push(...result.rows)

          if (result.rows.length < limit) {
            return rows
          }

          offset += result.rows.length
        } catch (error) {
          if (isMissingTableError(error)) {
            logger?.warn?.({ tableId }, 'User profiles table was not found while listing auth profile data.')
            throw createTableMissingError()
          }

          throw error
        }
      }
    },

    async upsertVerifiedProfile({
      userId,
      fullName,
      role,
    }: {
      userId: string
      fullName: string
      role: AuthRole
    }) {
      const existing = await findByUserId(userId)

      if (!existing) {
        try {
          return await tablesDB.createRow<UserProfileRow>({
            databaseId,
            tableId,
            rowId: ID.unique(),
            data: {
              user_id: userId,
              full_name: fullName,
              role,
            },
          })
        } catch (error) {
          if (!isMissingTableError(error) && typeof error === 'object' && error !== null && 'code' in error && error.code === 409) {
            const racedProfile = await findByUserId(userId)

            if (racedProfile) {
              return racedProfile
            }
          }

          if (isMissingTableError(error)) {
            throw createTableMissingError()
          }

          throw error
        }
      }

      if (existing.full_name === fullName && existing.role === role) {
        return existing
      }

      return tablesDB.updateRow<UserProfileRow>({
        databaseId,
        tableId,
        rowId: existing.$id,
        data: {
          full_name: fullName,
          role,
        },
      })
    },

    async deleteByUserId(userId: string) {
      const existing = await findByUserId(userId)

      if (!existing) {
        return false
      }

      try {
        await tablesDB.deleteRow({
          databaseId,
          tableId,
          rowId: existing.$id,
        })
      } catch (error) {
        if (isMissingTableError(error)) {
          logger?.warn?.({ tableId }, 'User profiles table was not found while deleting auth profile data.')
          throw createTableMissingError()
        }

        throw error
      }

      return true
    },
  }
}
