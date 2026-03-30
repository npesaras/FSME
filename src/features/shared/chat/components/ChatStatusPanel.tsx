import type { ReactNode } from 'react'

type ChatStatusPanelProps = {
  title: string
  description: string
  children?: ReactNode
  bare?: boolean
}

export function ChatStatusPanel({
  title,
  description,
  children,
  bare = false,
}: ChatStatusPanelProps) {
  return (
    <div
      className={`flex h-full min-h-[680px] w-full items-center justify-center ${
        bare ? 'px-0 py-0' : 'px-6 py-10 sm:px-10'
      }`}
    >
      <div
        className={`w-full ${
          bare
            ? 'border-0 bg-transparent p-6 shadow-none backdrop-blur-0 sm:p-8'
            : 'max-w-2xl rounded-[1.75rem] border border-border bg-card/90 p-6 shadow-sm backdrop-blur-[4px] sm:p-8'
        }`}
      >
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
