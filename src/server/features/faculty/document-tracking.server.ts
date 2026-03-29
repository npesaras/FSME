import { Query } from 'node-appwrite'
import type { Models } from 'node-appwrite'
import { appwrite } from '../../plugins/appwrite.server'
import { config } from '../../shared/config.server'
import type {
  DocumentTrackingRecord,
  DocumentTrackingStatus,
} from '#/features/faculty/document-tracking'

type AppwriteRow = Models.Row & Record<string, unknown>

const demoDocumentTrackingRecords: DocumentTrackingRecord[] = [
  {
    id: 'demo-1',
    date: 'Oct 24, 2023 10:30 AM',
    status: 'Pending',
    fileName: 'Q3_Financial_Report.pdf',
    remarks: 'Awaiting department head signature',
  },
  {
    id: 'demo-2',
    date: 'Oct 23, 2023 04:15 PM',
    status: 'Accepted',
    fileName: 'Student_Enrollment_List_2023.xlsx',
    remarks: 'Approved by Registrar',
  },
  {
    id: 'demo-3',
    date: 'Oct 22, 2023 09:00 AM',
    status: 'Pending',
    fileName: 'Teacher_Syllabus_Math101.docx',
    remarks: 'Under review by Curriculum Dept',
  },
  {
    id: 'demo-4',
    date: 'Oct 21, 2023 02:45 PM',
    status: 'Accepted',
    fileName: 'Facility_Maintenance_Request.pdf',
    remarks: 'Scheduled for next week',
  },
  {
    id: 'demo-5',
    date: 'Oct 20, 2023 11:20 AM',
    status: 'Rejected',
    fileName: 'Field_Trip_Proposal.pdf',
    remarks: 'Missing budget breakdown',
  },
  {
    id: 'demo-6',
    date: 'Oct 19, 2023 03:50 PM',
    status: 'Accepted',
    fileName: 'Annual_Budget_Review.xlsx',
    remarks: 'Approved by Finance',
  },
]

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

function isMissingDocumentTableError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes(
      `Table with the requested ID '${config.appwrite.documentTrackingTableId}' could not be found`,
    )
  )
}

export async function listDocumentTrackingRecordsForFaculty(accountId: string) {
  try {
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
  } catch (error) {
    if (isMissingDocumentTableError(error)) {
      return demoDocumentTrackingRecords
    }

    throw error
  }
}
