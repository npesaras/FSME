import { ClientOnly } from '@tanstack/react-router'
import { CometChat } from '@cometchat/chat-sdk-javascript'
import { useEffect, useMemo, useState } from 'react'
import CometChatApp from '#/cometChat/CometChatApp'
import { CometChatSettings } from '#/cometChat/CometChatSettings'
import { CometChatProvider } from '#/cometChat/context/CometChatContext'
import type { CometChatSettingsInterface } from '#/cometChat/context/CometChatContext'
import { ChatStatusPanel } from '../../shared/chat/components/ChatStatusPanel'
import { getCometChatRoleConfig } from '../../shared/chat/config'
import { ensureCometChatRoleSession } from '../../shared/chat/runtime'

type FacultyChatState =
  | { status: 'loading' }
  | { status: 'missing-standard-config'; missingKeys: string[] }
  | { status: 'missing-target-config' }
  | { status: 'ready'; panelist: CometChat.User }
  | { status: 'error'; message: string }

function formatError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error) {
    return error
  }

  return 'The custom faculty chat could not be started.'
}

function FacultyChatWorkspace() {
  const facultyConfig = useMemo(() => getCometChatRoleConfig('faculty'), [])
  const panelistConfig = useMemo(() => getCometChatRoleConfig('panelist'), [])
  const facultyChatSettings = useMemo<CometChatSettingsInterface>(
    () => ({
      ...CometChatSettings,
      layout: {
        ...CometChatSettings.layout,
        withSideBar: false,
        tabs: ['chats'],
        chatType: 'user',
      },
    }),
    [],
  )
  const [chatState, setChatState] = useState<FacultyChatState>({
    status: 'loading',
  })

  useEffect(() => {
    if (facultyConfig.missingKeys.length > 0) {
      setChatState({
        status: 'missing-standard-config',
        missingKeys: facultyConfig.missingKeys,
      })
      return
    }

    if (!panelistConfig.uid) {
      setChatState({ status: 'missing-target-config' })
      return
    }

    let cancelled = false

    setChatState({ status: 'loading' })

    void ensureCometChatRoleSession(facultyConfig)
      .then(async () => {
        const panelist = await CometChat.getUser(panelistConfig.uid)

        if (!cancelled) {
          setChatState({
            status: 'ready',
            panelist,
          })
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
  }, [facultyConfig, panelistConfig])

  if (chatState.status === 'loading') {
    return (
      <ChatStatusPanel
        title="Starting faculty chat"
        description="Preparing the faculty chat workspace and opening the panelist conversation."
      />
    )
  }

  if (chatState.status === 'missing-standard-config') {
    return (
      <ChatStatusPanel
        title="Shared CometChat config is incomplete"
        description="The standard CometChat workspace still needs its base Vite configuration before the custom faculty chat can start."
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

  if (chatState.status === 'missing-target-config') {
    return (
      <ChatStatusPanel
        title="Faculty chat needs a panelist target"
        description="Add `VITE_COMETCHAT_PANELIST_UID` to `.env`, then restart the TanStack Start dev server so the faculty chat knows which panelist conversation to open."
      />
    )
  }

  if (chatState.status === 'error') {
    return (
      <ChatStatusPanel
        title="Faculty chat could not start"
        description="CometChat returned an initialization or target-user error while opening the custom faculty chat view."
      >
        <div className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm leading-7 text-destructive">
          {chatState.message}
        </div>
      </ChatStatusPanel>
    )
  }

  return (
    <div className="faculty-chat-shell h-[calc(100vh-4rem)] w-full overflow-hidden">
      <CometChatProvider authBuilderSetting={facultyChatSettings}>
        <CometChatApp
          user={chatState.panelist}
          defaultActiveTab="chats"
          autoOpenFirstItem
        />
      </CometChatProvider>
    </div>
  )
}

export function FacultyChatView() {
  return (
    <ClientOnly
      fallback={
        <ChatStatusPanel
          title="Starting faculty chat"
          description="Preparing the faculty chat workspace and opening the panelist conversation."
        />
      }
    >
      <FacultyChatWorkspace />
    </ClientOnly>
  )
}
