import { Query } from 'node-appwrite'
import type { Models } from 'node-appwrite'
import { appwrite } from '../../plugins/appwrite.server'
import { config } from '../../shared/config.server'
import type {
  DocumentTrackingRecord,
  DocumentTrackingStatus,
} from '#/features/faculty/document-tracking'

type AppwriteRow = Models.Row & Record<string, unknown>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key]

    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }

  return undefined
}

function mapStatus(rawStatus?: string): DocumentTrackingStatus {
  const normalizedStatus = rawStatus?.trim().toLowerCase()

  if (!normalizedStatus) {
    return 'Pending'
  }

  if (
    normalizedStatus.includes('accept') ||
    normalizedStatus.includes('approve') ||
    normalizedStatus.includes('recommend')
  ) {
    return 'Accepted'
  }

  if (
    normalizedStatus.includes('reject') ||
    normalizedStatus.includes('return') ||
    normalizedStatus.includes('fail')
  ) {
    return 'Rejected'
  }

  return 'Pending'
}

function getDefaultRemark(status: DocumentTrackingStatus) {
  if (status === 'Accepted') {
    return 'Reviewed and accepted.'
  }

  if (status === 'Rejected') {
    return 'This document needs revision.'
  }

  return 'Awaiting review.'
}

function formatDocumentDate(value?: string) {
  if (!value) {
    return 'Date unavailable'
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  const datePart = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(parsed)

  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(parsed)

  return `${datePart} ${timePart}`
}

function normalizeDocumentTrackingRow(row: AppwriteRow): DocumentTrackingRecord {
  const status = mapStatus(
    readString(row, 'status', 'document_status', 'review_status', 'current_status'),
  )

  return {
    id: row.$id,
    date: formatDocumentDate(readString(row, 'uploaded_at', 'date', '$createdAt')),
    status,
    fileName:
      readString(row, 'file_name', 'requirement_name', 'title', 'name', 'file_id') ||
      'Untitled document',
    remarks:
      readString(row, 'remarks', 'review_notes', 'missing_items', 'action_summary') ||
      getDefaultRemark(status),
  }
}

export async function listDocumentTrackingRecordsForFaculty(accountId: string) {
  const result = await appwrite.tablesDB.listRows({
    databaseId: config.appwrite.databaseId,
    tableId: config.appwrite.documentTrackingTableId,
    queries: [
      Query.equal('applicant_id', [accountId]),
      Query.orderDesc('uploaded_at'),
      Query.limit(20),
    ],
  })

  return result.rows
    .filter(isRecord)
    .map((row) => normalizeDocumentTrackingRow(row as AppwriteRow))
}
