import type { WorkspaceLink } from '../shared/workspace-links'

export const facultyScopeLinks: WorkspaceLink[] = [
  {
    label: 'Faculty feature',
    title: 'Applications',
    description:
      'Draft, review, submit, and monitor scholarship applications from a faculty perspective.',
    to: '/faculty/applications',
  },
  {
    label: 'Faculty feature',
    title: 'Documents',
    description:
      'Upload required files, replace outdated attachments, and track completion before submission.',
    to: '/faculty/documents',
  },
  {
    label: 'Shared feature',
    title: 'Chat workspace',
    description:
      'Coordinate with support, reviewers, or workflow stakeholders from the shared CometChat workspace.',
    to: '/faculty/chat',
  },
]
