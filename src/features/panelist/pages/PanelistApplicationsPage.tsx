const panelistApplicationHighlights = [
  [
    'Queue triage',
    'Surface the highest-priority application packets first so panelists can review in a disciplined order.',
  ],
  [
    'Review context',
    'Keep supporting evidence, applicant background, and reviewer-facing summary details close together.',
  ],
  [
    'Notes and flags',
    'Capture observations, questions, and readiness markers without bouncing across unrelated screens.',
  ],
  [
    'Recommendation prep',
    'Move cleanly from initial review into recommendation and outcome discussion once a case is ready.',
  ],
] as const

export function PanelistApplicationsFeature() {
  return (
    <>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-primary uppercase">
          Panelist applications
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground [font-family:var(--font-heading)]">
          Review submitted applications and prepare recommendation-ready cases.
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          This page is the natural home for the panelist queue, supporting context,
          review notes, and recommendation preparation.
        </p>
      </div>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {panelistApplicationHighlights.map(([title, description], index) => (
          <article
            key={title}
            className="island-shell feature-card animate-rise-in rounded-2xl p-5"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className="mb-2 text-base font-semibold text-foreground">
              {title}
            </h2>
            <p className="m-0 text-sm leading-7 text-muted-foreground">
              {description}
            </p>
          </article>
        ))}
      </section>
    </>
  )
}

export default function PanelistApplicationsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] p-6 md:p-8">
      <PanelistApplicationsFeature />
    </div>
  )
}
