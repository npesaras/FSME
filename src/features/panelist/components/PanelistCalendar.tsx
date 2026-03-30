import * as React from 'react'

import { Calendar as DateCalendar } from '@/components/ui/calendar'

const DEFAULT_MONTH = new Date(2024, 0, 1)
const DEFAULT_SELECTED_DATE = new Date(2024, 0, 4)

export function PanelistCalendar() {
  const [month, setMonth] = React.useState(DEFAULT_MONTH)
  const [date, setDate] = React.useState<Date | undefined>(DEFAULT_SELECTED_DATE)

  return (
    <div className="faculty-panel rounded-lg p-4">
      <DateCalendar
        mode="single"
        month={month}
        onMonthChange={setMonth}
        selected={date}
        onSelect={setDate}
        showOutsideDays={false}
        className="w-full p-0"
        classNames={{
          months: 'w-full',
          month: 'w-full',
          month_caption: 'faculty-panel-subtle mb-4 flex items-center justify-between rounded-lg p-2',
          caption_label: 'text-sm font-bold text-foreground',
          nav: 'contents',
          button_previous:
            'rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
          button_next:
            'rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
          weekdays: 'mb-2 grid grid-cols-7 text-center',
          weekday: 'py-1 text-xs font-medium text-muted-foreground',
          month_grid: 'w-full border-collapse',
          week: 'grid grid-cols-7 gap-y-2 text-center',
          day: 'flex items-center justify-center',
          day_button:
            'h-8 w-8 rounded-full text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground',
          selected:
            '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:font-medium [&>button]:shadow-sm [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground',
          today: '[&>button]:bg-accent/60 [&>button]:text-foreground',
          outside: '[&>button]:text-muted-foreground/50',
          disabled: 'opacity-50',
          chevron: 'h-4 w-4',
        }}
      />
    </div>
  )
}
