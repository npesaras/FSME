import { ID, Query } from 'node-appwrite'
import type { Models } from 'node-appwrite'
import { appwrite } from '../../plugins/appwrite.server'
import { config } from '../../shared/config.server'
import type { RecentActivityRecord } from '#/features/faculty/recent-activities'

interface RecentActivitiesTableRow extends Models.Row {
  applicant_id: string
  application_id?: string
  activity_type: string
  title: string
  description: string
  occurred_at: string
}

interface LogRecentActivityInput {
  applicantId: string
  title: string
  description: string
  activityType?: string
  occurredAt?: string
  applicationId?: string
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function formatRecentActivityTime(value?: string) {
  if (!value) {
    return 'Time unavailable'
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  const now = new Date()
  const diffMilliseconds = now.getTime() - parsed.getTime()
  const diffMinutes = Math.floor(diffMilliseconds / 60_000)

  if (diffMinutes <= 0) {
    return 'Just now'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 4) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  if (isSameCalendarDay(parsed, now)) {
    return `Today, ${timeFormatter.format(parsed)}`
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  if (isSameCalendarDay(parsed, yesterday)) {
    return `Yesterday, ${timeFormatter.format(parsed)}`
  }

  const sameYear = parsed.getFullYear() === now.getFullYear()

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? { hour: 'numeric', minute: '2-digit', hour12: true } : { year: 'numeric' }),
  }).format(parsed)
}

function normalizeRecentActivityRow(
  row: RecentActivitiesTableRow,
): RecentActivityRecord {
  return {
    id: row.$id,
    title: row.title,
    description: row.description,
    timeLabel: formatRecentActivityTime(row.occurred_at),
    occurredAt: row.occurred_at,
    activityType: row.activity_type,
  }
}

function isMissingTableError(error: unknown) {
  return error instanceof Error && error.message.includes('could not be found')
}

export async function listRecentActivitiesForFaculty(accountId: string) {
  try {
    const result = await appwrite.tablesDB.listRows<RecentActivitiesTableRow>({
      databaseId: config.appwrite.databaseId,
      tableId: config.appwrite.recentActivitiesTableId,
      queries: [
        Query.equal('applicant_id', [accountId]),
        Query.orderDesc('occurred_at'),
        Query.limit(5),
      ],
      total: false,
    })

    return result.rows.map((row) => normalizeRecentActivityRow(row))
  } catch (error) {
    if (isMissingTableError(error)) {
      return []
    }

    throw error
  }
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

  return normalizeRecentActivityRow(row as unknown as RecentActivitiesTableRow)
}
