import { ClientOnly, Link } from '@tanstack/react-router'
import { lazy, Suspense, useMemo } from 'react'
import type { WorkspaceLink } from '../../workspace-links'
import type { ChatActor } from '../config'
import { getCometChatRoleConfig } from '../config'
import { ChatStatusPanel } from '../components/ChatStatusPanel'

const LazyCometChatWorkspacePanel = lazy(
  () => import('../components/CometChatWorkspacePanel'),
)

type SharedChatWorkspacePageProps = {
  actor: ChatActor
  kicker?: string
  title?: string
  description?: string
  links?: WorkspaceLink[]
  bare?: boolean
}

export default function SharedChatWorkspacePage({
  actor,
  kicker,
  title,
  description,
  links,
  bare = false,
}: SharedChatWorkspacePageProps) {
  const config = useMemo(() => getCometChatRoleConfig(actor), [actor])

  const chatContent = (
    <section
      className={
        bare
          ? 'h-[calc(100vh-4rem)] min-h-[680px] overflow-hidden rounded-none border-0 bg-transparent shadow-none backdrop-blur-0'
          : 'mt-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 shadow-sm backdrop-blur-[4px]'
      }
    >
      <ClientOnly
        fallback={
          <ChatStatusPanel
            title="Starting chat workspace"
            description="Initializing the CometChat UI kit and signing this workspace into the shared chat session."
            bare={bare}
          />
        }
      >
        <Suspense
          fallback={
            <ChatStatusPanel
              title="Loading shared chat"
              description="Preparing the CometChat workspace and syncing the latest conversations for this role."
              bare={bare}
            />
          }
        >
          <LazyCometChatWorkspacePanel config={config} bare={bare} />
        </Suspense>
      </ClientOnly>
    </section>
  )

  if (bare) {
    return chatContent
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] p-6 md:p-8">
      <div>
        <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-primary uppercase">
          {kicker}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground [font-family:var(--font-heading)]">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      </div>

      {links?.length ? (
        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {links.map((link, index) => (
            <Link
              key={link.to}
              to={link.to}
              className="island-shell feature-card animate-rise-in rounded-2xl p-5 no-underline transition hover:border-primary/30 hover:text-foreground"
              style={{ animationDelay: `${index * 90 + 80}ms` }}
            >
              <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                {link.label}
              </p>
              <h2 className="mb-2 text-base font-semibold text-foreground">
                {link.title}
              </h2>
              <p className="m-0 text-sm leading-7 text-muted-foreground">
                {link.description}
              </p>
            </Link>
          ))}
        </section>
      ) : null}

      {chatContent}
    </div>
  )
}
