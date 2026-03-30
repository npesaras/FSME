import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/panelist/decisions')({
  beforeLoad: () => {
    throw redirect({
      to: '/panelist',
    })
  },
})
