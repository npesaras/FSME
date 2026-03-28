import { useEffect, useState } from 'react'
import { CometChatProvider } from '#/CometChat/context/CometChatContext'
import CometChatApp from '#/CometChat/CometChatApp'
import type { CometChatRoleConfig } from '../config'
import { ensureCometChatRoleSession } from '../runtime'

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

  return 'CometChat could not be initialized for this workspace.'
}

function ChatStatusPanel({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex h-full min-h-[680px] w-full items-center justify-center px-6 py-10 sm:px-10">
      <div className="w-full max-w-2xl rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(22,74,60,0.08)] sm:p-8">
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-[var(--sea-ink)]">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--sea-ink-soft)] sm:text-base">
          {description}
        </p>
        {children}
      </div>
    </div>
  )
}

export default function CometChatWorkspacePanel({
  config,
}: {
  config: CometChatRoleConfig
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
      />
    )
  }

  if (chatState.status === 'missing-config') {
    return (
      <ChatStatusPanel
        title="CometChat needs configuration"
        description="Add the missing Vite environment variables below in the repository root `.env` file, then restart the frontend dev server."
      >
        <div className="mt-5 rounded-2xl border border-dashed border-[var(--line)] bg-white/70 p-4">
          <p className="m-0 text-xs font-semibold tracking-[0.18em] text-[var(--sea-ink-soft)] uppercase">
            Missing keys
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {chatState.missingKeys.map((key) => (
              <code
                key={key}
                className="rounded-full bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--sea-ink)]"
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
      >
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm leading-7 text-red-700">
          {chatState.message}
        </div>
      </ChatStatusPanel>
    )
  }

  return (
    <div className="h-[75vh] min-h-[680px] w-full">
      <CometChatProvider>
        <CometChatApp />
      </CometChatProvider>
    </div>
  )
}
