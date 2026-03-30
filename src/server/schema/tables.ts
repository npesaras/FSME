import type { AppwriteTableSchema } from './types'

export const appRoles = ['faculty', 'panelist'] as const
export type AppRole = (typeof appRoles)[number]

export const documentTrackingStatuses = ['Pending', 'Accepted', 'Rejected'] as const
export type DocumentTrackingStatus = (typeof documentTrackingStatuses)[number]

export const applicationStatuses = [
  'Draft',
  'Submitted',
  'Under Review',
  'Returned for Revision',
  'Resubmitted',
  'Decision Recorded',
  'Closed',
] as const
export type ApplicationStatus = (typeof applicationStatuses)[number]

export const panelOutcomes = [
  'Recommended',
  'Not Recommended',
  'Returned for Revision',
] as const
export type PanelOutcome = (typeof panelOutcomes)[number]

export const appwriteTableSchemas = {
  documentTracking: {
    id: 'document_tracking',
    name: 'Document Tracking',
    status: 'live',
    description:
      'Faculty-facing document activity stream used by the dashboard document tracking widget.',
    columns: [
      {
        key: 'applicant_id',
        kind: 'varchar',
        required: true,
        size: 255,
        description: 'Authenticated faculty account ID that owns the tracked document entry.',
      },
      {
        key: 'application_id',
        kind: 'varchar',
        required: false,
        size: 255,
        description: 'Optional scholarship application ID related to the document.',
      },
      {
        key: 'file_name',
        kind: 'varchar',
        required: true,
        size: 255,
        description: 'Display name of the uploaded or reviewed file.',
      },
      {
        key: 'status',
        kind: 'enum',
        required: true,
        elements: documentTrackingStatuses,
        description: 'Current document tracking state shown in the faculty dashboard.',
      },
      {
        key: 'remarks',
        kind: 'varchar',
        required: false,
        size: 1024,
        description: 'Latest review note or tracking remark for the document.',
      },
      {
        key: 'uploaded_at',
        kind: 'datetime',
        required: true,
        description: 'Timestamp used to order tracking entries in the dashboard.',
      },
    ],
    indexes: [
      {
        key: 'document_tracking_applicant_id',
        type: 'key',
        columns: ['applicant_id'],
        orders: ['asc'],
      },
      {
        key: 'document_tracking_status',
        type: 'key',
        columns: ['status'],
        orders: ['asc'],
      },
      {
        key: 'document_tracking_uploaded_at',
        type: 'key',
        columns: ['uploaded_at'],
        orders: ['desc'],
      },
    ],
  },
  recentActivities: {
    id: 'recent_activities',
    name: 'Recent Activities',
    status: 'live',
    description:
      'Faculty-facing dashboard activity feed for recent workflow updates and alerts.',
    columns: [
      {
        key: 'applicant_id',
        kind: 'varchar',
        required: true,
        size: 255,
        description: 'Authenticated faculty account ID that owns the activity entry.',
      },
      {
        key: 'application_id',
        kind: 'varchar',
        required: false,
        size: 255,
        description: 'Optional scholarship application ID related to the activity.',
      },
      {
        key: 'activity_type',
        kind: 'varchar',
        required: true,
        size: 128,
        description: 'Machine-friendly activity category for filtering and future automation.',
      },
      {
        key: 'title',
        kind: 'varchar',
        required: true,
        size: 255,
        description: 'Short activity title shown in the recent activities card.',
      },
      {
        key: 'description',
        kind: 'text',
        required: true,
        description: 'Long-form activity summary shown beneath the card title.',
      },
      {
        key: 'occurred_at',
        kind: 'datetime',
        required: true,
        description: 'Timestamp used to order recent activity items in the dashboard.',
      },
    ],
    indexes: [
      {
        key: 'recent_activities_applicant_id',
        type: 'key',
        columns: ['applicant_id'],
        orders: ['asc'],
      },
      {
        key: 'recent_activities_activity_type',
        type: 'key',
        columns: ['activity_type'],
        orders: ['asc'],
      },
      {
        key: 'recent_activities_occurred_at',
        type: 'key',
        columns: ['occurred_at'],
        orders: ['desc'],
      },
    ],
  },
  userProfiles: {
    id: 'user_profiles',
    name: 'User Profiles',
    status: 'live',
    description:
      'Verified user profile metadata mirrored from Appwrite Auth and used for app-side RBAC/profile data.',
    columns: [
      {
        key: 'user_id',
        kind: 'varchar',
        required: true,
        size: 255,
        description: 'Appwrite Auth user ID for the verified account.',
      },
      {
        key: 'full_name',
        kind: 'varchar',
        required: true,
        size: 255,
        description: 'Verified display name mirrored from the Appwrite Auth profile.',
      },
      {
        key: 'role',
        kind: 'enum',
        required: true,
        elements: appRoles,
        description: 'Mirrored application role. New signups default to faculty.',
      },
      { key: 'department', kind: 'varchar', required: false, size: 255 },
      { key: 'college_or_office', kind: 'varchar', required: false, size: 255 },
      { key: 'employee_no', kind: 'varchar', required: false, size: 255 },
      { key: 'phone', kind: 'varchar', required: false, size: 64 },
    ],
    indexes: [
      { key: 'user_profiles_user_id', type: 'unique', columns: ['user_id'] },
      { key: 'user_profiles_role', type: 'key', columns: ['role'], orders: ['asc'] },
    ],
  },
  applications: {
    id: 'applications',
    name: 'Applications',
    status: 'planned',
    description: 'Core scholarship submission records owned by faculty applicants.',
    columns: [
      { key: 'applicant_id', kind: 'varchar', required: true, size: 255 },
      { key: 'reference_no', kind: 'varchar', required: true, size: 255 },
      { key: 'academic_year', kind: 'varchar', required: true, size: 64 },
      { key: 'semester', kind: 'varchar', required: true, size: 64 },
      { key: 'scholarship_type', kind: 'varchar', required: true, size: 255 },
      { key: 'proposed_program', kind: 'varchar', required: false, size: 255 },
      { key: 'institution_name', kind: 'varchar', required: false, size: 255 },
      { key: 'purpose_statement', kind: 'text', required: true },
      {
        key: 'current_status',
        kind: 'enum',
        required: true,
        elements: applicationStatuses,
      },
      { key: 'submitted_at', kind: 'datetime', required: false },
    ],
    indexes: [
      { key: 'applications_applicant_id', type: 'key', columns: ['applicant_id'], orders: ['asc'] },
      { key: 'applications_reference_no', type: 'unique', columns: ['reference_no'] },
      {
        key: 'applications_current_status',
        type: 'key',
        columns: ['current_status'],
        orders: ['asc'],
      },
    ],
  },
  applicationDocuments: {
    id: 'application_documents',
    name: 'Application Documents',
    status: 'planned',
    description: 'Metadata for uploaded supporting documents tied to an application.',
    columns: [
      { key: 'application_id', kind: 'varchar', required: true, size: 255 },
      { key: 'uploaded_by', kind: 'varchar', required: true, size: 255 },
      { key: 'requirement_code', kind: 'varchar', required: true, size: 255 },
      { key: 'requirement_name', kind: 'varchar', required: true, size: 255 },
      { key: 'file_id', kind: 'varchar', required: true, size: 255 },
      { key: 'file_name', kind: 'varchar', required: true, size: 255 },
      { key: 'mime_type', kind: 'varchar', required: true, size: 255 },
      { key: 'file_size', kind: 'integer', required: true },
      { key: 'version_no', kind: 'integer', required: true },
      { key: 'is_current', kind: 'boolean', required: true },
      { key: 'uploaded_at', kind: 'datetime', required: true },
    ],
    indexes: [
      {
        key: 'application_documents_application_id',
        type: 'key',
        columns: ['application_id'],
        orders: ['asc'],
      },
      {
        key: 'application_documents_requirement_code',
        type: 'key',
        columns: ['requirement_code'],
        orders: ['asc'],
      },
    ],
  },
  panelReviews: {
    id: 'panel_reviews',
    name: 'Panel Reviews',
    status: 'planned',
    description: 'Panel-side review notes and completeness checks for submitted applications.',
    columns: [
      { key: 'application_id', kind: 'varchar', required: true, size: 255 },
      { key: 'reviewer_id', kind: 'varchar', required: true, size: 255 },
      { key: 'review_status', kind: 'varchar', required: true, size: 255 },
      { key: 'review_notes', kind: 'text', required: false },
      { key: 'missing_items', kind: 'text', required: false },
      { key: 'reviewed_at', kind: 'datetime', required: true },
    ],
    indexes: [
      { key: 'panel_reviews_application_id', type: 'key', columns: ['application_id'], orders: ['asc'] },
      { key: 'panel_reviews_reviewer_id', type: 'key', columns: ['reviewer_id'], orders: ['asc'] },
    ],
  },
  decisionRecords: {
    id: 'decision_records',
    name: 'Decision Records',
    status: 'planned',
    description: 'Structured panel outcomes for a reviewed application.',
    columns: [
      { key: 'application_id', kind: 'varchar', required: true, size: 255 },
      { key: 'decided_by', kind: 'varchar', required: true, size: 255 },
      { key: 'panel_outcome', kind: 'enum', required: true, elements: panelOutcomes },
      { key: 'decision_notes', kind: 'text', required: false },
      { key: 'decided_at', kind: 'datetime', required: true },
    ],
    indexes: [
      { key: 'decision_records_application_id', type: 'unique', columns: ['application_id'] },
      { key: 'decision_records_panel_outcome', type: 'key', columns: ['panel_outcome'], orders: ['asc'] },
    ],
  },
  statusHistory: {
    id: 'status_history',
    name: 'Status History',
    status: 'planned',
    description: 'Timeline of application status transitions and their reasons.',
    columns: [
      { key: 'application_id', kind: 'varchar', required: true, size: 255 },
      { key: 'changed_by', kind: 'varchar', required: true, size: 255 },
      { key: 'from_status', kind: 'enum', required: true, elements: applicationStatuses },
      { key: 'to_status', kind: 'enum', required: true, elements: applicationStatuses },
      { key: 'reason', kind: 'text', required: false },
      { key: 'changed_at', kind: 'datetime', required: true },
    ],
    indexes: [
      { key: 'status_history_application_id', type: 'key', columns: ['application_id'], orders: ['asc'] },
      { key: 'status_history_to_status', type: 'key', columns: ['to_status'], orders: ['asc'] },
      { key: 'status_history_changed_at', type: 'key', columns: ['changed_at'], orders: ['desc'] },
    ],
  },
  activityLogs: {
    id: 'activity_logs',
    name: 'Activity Logs',
    status: 'planned',
    description: 'Audit-friendly log of major workflow actions inside FSMES.',
    columns: [
      { key: 'application_id', kind: 'varchar', required: false, size: 255 },
      { key: 'actor_id', kind: 'varchar', required: true, size: 255 },
      { key: 'action_type', kind: 'varchar', required: true, size: 255 },
      { key: 'action_summary', kind: 'text', required: false },
      { key: 'created_at', kind: 'datetime', required: true },
    ],
    indexes: [
      { key: 'activity_logs_application_id', type: 'key', columns: ['application_id'], orders: ['asc'] },
      { key: 'activity_logs_actor_id', type: 'key', columns: ['actor_id'], orders: ['asc'] },
      { key: 'activity_logs_action_type', type: 'key', columns: ['action_type'], orders: ['asc'] },
      { key: 'activity_logs_created_at', type: 'key', columns: ['created_at'], orders: ['desc'] },
    ],
  },
} as const satisfies Record<string, AppwriteTableSchema>

export type AppwriteTableSchemaKey = keyof typeof appwriteTableSchemas

export const liveAppwriteTableSchemas = Object.values(appwriteTableSchemas).filter(
  (schema) => schema.status === 'live',
)

export const plannedAppwriteTableSchemas = Object.values(appwriteTableSchemas).filter(
  (schema) => schema.status === 'planned',
)

export function getAppwriteTableSchema(tableId: string) {
  return Object.values(appwriteTableSchemas).find((schema) => schema.id === tableId) || null
}
