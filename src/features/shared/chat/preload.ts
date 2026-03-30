import type { ChatActor } from './config'

const chatPreloadPromises = new Map<ChatActor, Promise<void>>()

async function warmChatWorkspace(actor: ChatActor) {
  await import('./components/CometChatWorkspacePanel')

  const [
    { getCometChatRoleConfig },
    { getCurrentCometChatProfileServerFn },
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

  const profile = await getCurrentCometChatProfileServerFn()

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
      })
    })
    .then(() => undefined)

  chatPreloadPromises.set(actor, preloadPromise)

  return preloadPromise
}
