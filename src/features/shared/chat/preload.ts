import type { ChatActor } from './config'

const chatPreloadPromises = new Map<ChatActor, Promise<void>>()

function formatPreloadError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error.trim()
  }

  if (error && typeof error === 'object') {
    const candidate = error as Record<string, unknown>
    const detail = [
      typeof candidate.message === 'string' ? candidate.message : null,
      typeof candidate.code === 'string' ? `code: ${candidate.code}` : null,
      typeof candidate.statusCode === 'number' ? `status: ${candidate.statusCode}` : null,
    ]
      .filter(Boolean)
      .join(' | ')

    if (detail) {
      return detail
    }
  }

  return 'Unknown chat preload error.'
}

async function warmChatWorkspace(actor: ChatActor) {
  await import('./components/CometChatWorkspacePanel')

  const [
    { getCometChatRoleConfig },
    { getCurrentCometChatProfileOrNullServerFn },
    { ensureCometChatRoleSession },
  ] = await Promise.all([
    import('./config'),
    import('./profile.functions'),
    import('./runtime'),
  ])

  const config = getCometChatRoleConfig(actor)

  if (config.missingKeys.length > 0) {
    return
  }

  const profile = await getCurrentCometChatProfileOrNullServerFn()

  if (!profile) {
    return
  }

  await ensureCometChatRoleSession({
    ...config,
    uid: profile.uid,
  })
}

export function preloadChatWorkspace(actor: ChatActor) {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  const existingPromise = chatPreloadPromises.get(actor)

  if (existingPromise) {
    return existingPromise
  }

  const preloadPromise = warmChatWorkspace(actor)
    .catch((error) => {
      chatPreloadPromises.delete(actor)
      console.warn('Chat workspace preload failed', {
        actor,
        error,
        formattedError: formatPreloadError(error),
      })
    })
    .then(() => undefined)

  chatPreloadPromises.set(actor, preloadPromise)

  return preloadPromise
}
