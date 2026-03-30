import { useEffect, useState } from 'react'
import CometChatApp from '#/cometChat/CometChatApp'
import { CometChatProvider } from '#/cometChat/context/CometChatContext'
import type { CometChatRoleConfig } from '../config'
import { getCurrentCometChatProfileServerFn } from '../profile.functions'
import { ensureCometChatRoleSession } from '../runtime'
import { ChatStatusPanel } from './ChatStatusPanel'

type ChatState =
  | { status: 'loading' }
  | { status: 'missing-config'; missingKeys: string[] }
  | { status: 'ready' }
  | { status: 'resolving-profile' }
  | { status: 'error'; message: string }

function formatError(error: unknown) {
  const collectDetails = (candidate: Record<string, unknown>) => {
    const nestedData =
      candidate.data && typeof candidate.data === 'object'
        ? (candidate.data as Record<string, unknown>)
        : null
    const nestedCause =
      candidate.cause && typeof candidate.cause === 'object'
        ? (candidate.cause as Record<string, unknown>)
        : null

    return [
      typeof candidate.message === 'string' ? candidate.message : null,
      typeof nestedData?.message === 'string' ? nestedData.message : null,
      typeof nestedCause?.message === 'string' ? nestedCause.message : null,
      typeof candidate.code === 'string' ? `code: ${candidate.code}` : null,
      typeof nestedData?.code === 'string' ? `code: ${nestedData.code}` : null,
      typeof candidate.statusCode === 'number' ? `status: ${candidate.statusCode}` : null,
    ].filter(Boolean)
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error) {
    return error
  }

  if (error && typeof error === 'object') {
    const candidate = error as Record<string, unknown>
    const detail = collectDetails(candidate).join(' | ')

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

    void getCurrentCometChatProfileServerFn()
      .then((profile) => {
        if (!cancelled) {
          setChatState({ status: 'resolving-profile' })
        }

        return ensureCometChatRoleSession({
          ...config,
          uid: profile.uid,
        })
      })
      .then(() => {
        if (!cancelled) {
          setChatState({ status: 'ready' })
        }
      })
      .catch((error) => {
        console.error('CometChat workspace startup failed', {
          actor: config.actor,
          region: config.region,
          error,
          formattedError: formatError(error),
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
        description="Initializing the CometChat UI kit for the authenticated workspace."
        bare={bare}
      />
    )
  }

  if (chatState.status === 'resolving-profile') {
    return (
      <ChatStatusPanel
        title="Preparing your chat identity"
        description="Resolving your Appwrite-backed CometChat profile and signing your account into chat."
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
        description="CometChat returned an initialization, provisioning, or login error for the authenticated workspace."
        bare={bare}
      >
        <div className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm leading-7 text-destructive">
          {chatState.message}
        </div>
        <p className="mt-4 text-xs leading-6 text-muted-foreground">
          Check the browser console for the raw CometChat error object. The most common causes are
          a missing CometChat API key on the server, a failed user provisioning request, or an app
          ID / region / auth key mismatch.
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
