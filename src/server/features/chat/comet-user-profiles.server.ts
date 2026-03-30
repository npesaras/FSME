import { ID, Query, type Models } from 'node-appwrite'
import type { AuthRole } from '#/features/auth/types'
import { AppError } from '../../shared/errors.server'
import type { ServerLogger } from '../../types/logger'

export interface CometUserProfileRow extends Models.Row {
  user_id: string
  cometchat_uid: string
  full_name: string
  role: AuthRole
  avatar_url?: string | null
  profile_link?: string | null
  auth_token?: string | null
}

type CometUserProfilesRepositoryOptions = {
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

export function createCometUserProfilesRepository({
  tablesDB,
  databaseId,
  tableId,
  logger,
}: CometUserProfilesRepositoryOptions) {
  function createTableMissingError() {
    return new AppError(500, `The Appwrite table "${tableId}" is not ready.`, {
      code: 'COMET_USER_PROFILES_TABLE_MISSING',
    })
  }

  async function findByUserId(userId: string) {
    try {
      const result = await tablesDB.listRows<CometUserProfileRow>({
        databaseId,
        tableId,
        queries: [Query.equal('user_id', [userId]), Query.limit(1)],
        total: false,
      })

      return result.rows[0] || null
    } catch (error) {
      if (isMissingTableError(error)) {
        logger?.warn?.(
          { tableId },
          'Comet user profiles table was not found while resolving chat profile data.',
        )
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
      const rows: CometUserProfileRow[] = []
      let offset = 0

      while (true) {
        try {
          const result = await tablesDB.listRows<CometUserProfileRow>({
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
            logger?.warn?.(
              { tableId },
              'Comet user profiles table was not found while listing chat profile data.',
            )
            throw createTableMissingError()
          }

          throw error
        }
      }
    },

    async upsertProfile({
      userId,
      cometchatUid,
      fullName,
      role,
      avatarUrl,
      profileLink,
      authToken,
    }: {
      userId: string
      cometchatUid: string
      fullName: string
      role: AuthRole
      avatarUrl?: string | null
      profileLink?: string | null
      authToken?: string | null
    }) {
      const existing = await findByUserId(userId)
      const nextData = {
        user_id: userId,
        cometchat_uid: cometchatUid,
        full_name: fullName,
        role,
        avatar_url: avatarUrl ?? null,
        profile_link: profileLink ?? null,
        auth_token: authToken ?? null,
      }

      if (!existing) {
        try {
          return await tablesDB.createRow<CometUserProfileRow>({
            databaseId,
            tableId,
            rowId: ID.unique(),
            data: nextData,
          })
        } catch (error) {
          if (
            !isMissingTableError(error) &&
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 409
          ) {
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

      if (
        existing.cometchat_uid === cometchatUid &&
        existing.full_name === fullName &&
        existing.role === role &&
        (existing.avatar_url ?? null) === (avatarUrl ?? null) &&
        (existing.profile_link ?? null) === (profileLink ?? null) &&
        (existing.auth_token ?? null) === (authToken ?? null)
      ) {
        return existing
      }

      return tablesDB.updateRow<CometUserProfileRow>({
        databaseId,
        tableId,
        rowId: existing.$id,
        data: {
          cometchat_uid: cometchatUid,
          full_name: fullName,
          role,
          avatar_url: avatarUrl ?? null,
          profile_link: profileLink ?? null,
          auth_token: authToken ?? null,
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
          logger?.warn?.(
            { tableId },
            'Comet user profiles table was not found while deleting chat profile data.',
          )
          throw createTableMissingError()
        }

        throw error
      }

      return true
    },
  }
}
