import { Query } from 'node-appwrite'
import type { Models } from 'node-appwrite'
import { appwrite } from '../../plugins/appwrite.server'
import { config } from '../../shared/config.server'

interface DocumentTrackingTableRow extends Models.Row {
  applicant_id: string
  application_id?: string
  file_name: string
  status: string
  remarks?: string
  uploaded_at: string
}

type SharedDocumentTrackingStatus = 'Accepted' | 'Pending' | 'Rejected'

function normalizeStatus(rawStatus: string): SharedDocumentTrackingStatus {
  if (rawStatus === 'Accepted' || rawStatus === 'Rejected') {
    return rawStatus
  }

  return 'Pending'
}

function getDefaultRemark(status: SharedDocumentTrackingStatus) {
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

function normalizeDocumentTrackingRow(row: DocumentTrackingTableRow) {
  const status = normalizeStatus(row.status)

  return {
    id: row.$id,
    date: formatDocumentDate(row.uploaded_at),
    status,
    fileName: row.file_name,
    remarks: row.remarks?.trim() || getDefaultRemark(status),
  }
}

export async function listDocumentTrackingRecordsForAccount(accountId: string) {
  const result = await appwrite.tablesDB.listRows<DocumentTrackingTableRow>({
    databaseId: config.appwrite.databaseId,
    tableId: config.appwrite.documentTrackingTableId,
    queries: [
      Query.equal('applicant_id', [accountId]),
      Query.orderDesc('uploaded_at'),
      Query.limit(20),
    ],
    total: false,
  })

  return result.rows.map((row) => normalizeDocumentTrackingRow(row))
}
