import type { ChatActor } from './config'

const chatPreloadPromises = new Map<ChatActor, Promise<void>>()

async function warmChatWorkspace(actor: ChatActor) {
  await import('./components/CometChatWorkspacePanel')

  const [{ getCometChatRoleConfig }, { ensureCometChatRoleSession }] =
    await Promise.all([import('./config'), import('./runtime')])

  const config = getCometChatRoleConfig(actor)

  if (config.missingKeys.length > 0) {
    return
  }

  await ensureCometChatRoleSession(config)
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
