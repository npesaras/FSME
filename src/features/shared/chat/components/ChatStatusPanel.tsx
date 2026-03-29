import type { ReactNode } from 'react'

type ChatStatusPanelProps = {
  title: string
  description: string
  children?: ReactNode
}

export function ChatStatusPanel({
  title,
  description,
  children,
}: ChatStatusPanelProps) {
  return (
    <div className="flex h-full min-h-[680px] w-full items-center justify-center px-6 py-10 sm:px-10">
      <div className="w-full max-w-2xl rounded-[1.75rem] border border-border bg-card/90 p-6 shadow-sm backdrop-blur-[4px] sm:p-8">
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
        {children}
      </div>
    </div>
  )
}
