import { useEffect, useState } from 'react'
import CometChatApp from '#/cometChat/CometChatApp'
import { CometChatProvider } from '#/cometChat/context/CometChatContext'
import type { CometChatRoleConfig } from '../config'
import { ensureCometChatRoleSession } from '../runtime'
import { ChatStatusPanel } from './ChatStatusPanel'

type ChatState =
  | { status: 'loading' }
  | { status: 'missing-config'; missingKeys: string[] }
  | { status: 'ready' }
  | { status: 'error'; message: string }

function formatError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error) {
    return error
  }

  if (error && typeof error === 'object') {
    const candidate = error as Record<string, unknown>
    const detail = [
      typeof candidate.message === 'string' ? candidate.message : null,
      typeof candidate.code === 'string' ? `code: ${candidate.code}` : null,
    ]
      .filter(Boolean)
      .join(' | ')

    if (detail) {
      return detail
    }
  }

  return 'CometChat could not be initialized for this workspace.'
}

export default function CometChatWorkspacePanel({
  config,
  bare = false,
}: {
  config: CometChatRoleConfig
  bare?: boolean
}) {
  const [chatState, setChatState] = useState<ChatState>({ status: 'loading' })

  useEffect(() => {
    if (config.missingKeys.length > 0) {
      setChatState({
        status: 'missing-config',
        missingKeys: config.missingKeys,
      })
      return
    }

    let cancelled = false

    setChatState({ status: 'loading' })

    void ensureCometChatRoleSession(config)
      .then(() => {
        if (!cancelled) {
          setChatState({ status: 'ready' })
        }
      })
      .catch((error) => {
        console.error('CometChat workspace startup failed', {
          actor: config.actor,
          region: config.region,
          uid: config.uid,
          error,
        })

        if (!cancelled) {
          setChatState({
            status: 'error',
            message: formatError(error),
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [config])

  if (chatState.status === 'loading') {
    return (
      <ChatStatusPanel
        title="Starting chat workspace"
        description="Initializing the CometChat UI kit and signing this workspace into the shared chat session."
        bare={bare}
      />
    )
  }

  if (chatState.status === 'missing-config') {
    return (
      <ChatStatusPanel
        title="CometChat needs configuration"
        description="Add the missing Vite environment variables below in `.env`, then restart the frontend dev server."
        bare={bare}
      >
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/30 p-4">
          <p className="m-0 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Missing keys
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {chatState.missingKeys.map((key) => (
              <code
                key={key}
                className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-foreground"
              >
                {key}
              </code>
            ))}
          </div>
        </div>
      </ChatStatusPanel>
    )
  }

  if (chatState.status === 'error') {
    return (
      <ChatStatusPanel
        title="Chat workspace could not start"
        description="CometChat returned an initialization or login error for this role-specific workspace."
        bare={bare}
      >
        <div className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm leading-7 text-destructive">
          {chatState.message}
        </div>
        <p className="mt-4 text-xs leading-6 text-muted-foreground">
          Check the browser console for the raw CometChat error object. The most common causes are
          a missing role UID, a UID that does not exist in your CometChat app, or an app ID /
          region / auth key mismatch.
        </p>
      </ChatStatusPanel>
    )
  }

  return (
    <div className={`w-full ${bare ? 'h-[calc(100vh-4rem)] min-h-[680px]' : 'h-[75vh] min-h-[680px]'}`}>
      <CometChatProvider>
        <CometChatApp />
      </CometChatProvider>
    </div>
  )
}
