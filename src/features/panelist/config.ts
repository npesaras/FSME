import type { ScopeLink } from '../shared/components/ScopePage'

export const panelistScopeLinks: ScopeLink[] = [
  {
    label: 'Panelist feature',
    title: 'Review queue',
    description:
      'Filter submitted applications, inspect requirements, and prepare recommendations in a review-oriented queue.',
    to: '/panelist/reviews',
  },
  {
    label: 'Panelist feature',
    title: 'Decision recording',
    description:
      'Capture recommendation outcomes, rationale, and next steps once panel review is complete.',
    to: '/panelist/decisions',
  },
  {
    label: 'Shared feature',
    title: 'Chat workspace',
    description:
      'Jump into the shared CometChat workspace for follow-ups, coordination, and reviewer conversations.',
    to: '/panelist/chat',
  },
]
