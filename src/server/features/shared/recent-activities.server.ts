import { Query } from 'node-appwrite'
import type { Models } from 'node-appwrite'
import { appwrite } from '../../plugins/appwrite.server'
import { config } from '../../shared/config.server'

type RecentActivitiesRowLike = Pick<Models.Row, '$id'> & {
  activity_type: string
  description: string
  occurred_at: string
  title: string
}

interface RecentActivitiesTableRow extends Models.Row {
  applicant_id: string
  application_id?: string
  activity_type: string
  title: string
  description: string
  occurred_at: string
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

export function normalizeRecentActivityRow(row: RecentActivitiesRowLike) {
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

export async function listRecentActivitiesForAccount(accountId: string) {
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
