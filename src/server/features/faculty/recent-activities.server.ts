import { ID } from 'node-appwrite'
import { appwrite } from '../../plugins/appwrite.server'
import { config } from '../../shared/config.server'
import type { RecentActivityRecord } from '#/features/faculty/recent-activities'
import {
  listRecentActivitiesForAccount,
  normalizeRecentActivityRow,
} from '../shared/recent-activities.server'

interface LogRecentActivityInput {
  applicantId: string
  title: string
  description: string
  activityType?: string
  occurredAt?: string
  applicationId?: string
}

export async function listRecentActivitiesForFaculty(accountId: string) {
  return listRecentActivitiesForAccount(accountId) as Promise<RecentActivityRecord[]>
}

export async function logRecentActivity(input: LogRecentActivityInput) {
  const title = input.title.trim()
  const description = input.description.trim()
  const applicantId = input.applicantId.trim()
  const occurredAt = input.occurredAt || new Date().toISOString()

  if (!applicantId || !title || !description) {
    throw new Error('Applicant ID, title, and description are required to log an activity.')
  }

  const row = await appwrite.tablesDB.createRow({
    databaseId: config.appwrite.databaseId,
    tableId: config.appwrite.recentActivitiesTableId,
    rowId: ID.unique(),
    data: {
      applicant_id: applicantId,
      activity_type: input.activityType?.trim() || 'general',
      title,
      description,
      occurred_at: occurredAt,
      ...(input.applicationId?.trim() ? { application_id: input.applicationId.trim() } : {}),
    },
  })

  return normalizeRecentActivityRow(
    row as Parameters<typeof normalizeRecentActivityRow>[0]
  ) as RecentActivityRecord
}
