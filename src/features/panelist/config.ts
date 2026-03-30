import type { WorkspaceLink } from '../shared/workspace-links'

export const panelistScopeLinks: WorkspaceLink[] = [
  {
    label: 'Panelist feature',
    title: 'Applications',
    description:
      'Review submitted applications, organize supporting context, and prepare recommendation-ready cases.',
    to: '/panelist/applications',
  },
  {
    label: 'Panelist feature',
    title: 'Documents',
    description:
      'Inspect uploaded supporting documents and track remarks tied to the current review workload.',
    to: '/panelist/documents',
  },
  {
    label: 'Shared feature',
    title: 'Chat workspace',
    description:
      'Coordinate with fellow reviewers and workflow stakeholders from the shared CometChat workspace.',
    to: '/panelist/chat',
  },
]
