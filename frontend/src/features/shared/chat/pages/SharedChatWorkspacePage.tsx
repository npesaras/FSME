import { ClientOnly } from '@tanstack/react-router'
import { lazy, Suspense, useMemo } from 'react'
import type { ScopeLink } from '../../components/ScopePage'
import ScopePage from '../../components/ScopePage'
import type { ChatActor } from '../config'
import { getCometChatRoleConfig } from '../config'

const LazyCometChatWorkspacePanel = lazy(
  () => import('../components/CometChatWorkspacePanel'),
)

type SharedChatWorkspacePageProps = {
  actor: ChatActor
  kicker: string
  title: string
  description: string
  links: ScopeLink[]
}

function ChatStatusPanel({
  title,
  description,
}: {
  title: string
  description: string
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
      </div>
    </div>
  )
}

export default function SharedChatWorkspacePage({
  actor,
  kicker,
  title,
  description,
  links,
}: SharedChatWorkspacePageProps) {
  const config = useMemo(() => getCometChatRoleConfig(actor), [actor])

  return (
    <ScopePage
      kicker={kicker}
      title={title}
      description={description}
      links={links}
    >
      <section className="mt-8 overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_24px_70px_rgba(20,64,53,0.1)]">
        <ClientOnly
          fallback={
            <ChatStatusPanel
              title="Starting chat workspace"
              description="Initializing the CometChat UI kit and signing this workspace into the shared chat session."
            />
          }
        >
          <Suspense
            fallback={
              <ChatStatusPanel
                title="Loading shared chat"
                description="Preparing the CometChat workspace and syncing the latest conversations for this role."
              />
            }
          >
            <LazyCometChatWorkspacePanel config={config} />
          </Suspense>
        </ClientOnly>
      </section>
    </ScopePage>
  )
}
