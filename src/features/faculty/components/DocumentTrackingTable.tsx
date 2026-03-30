import { useSuspenseQuery } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'

import { DataTable } from '@/components/ui/data-table'
import { documentTrackingQueryOptions } from '@/features/faculty/document-tracking.queries'
import type { DocumentTrackingRecord } from '@/features/faculty/document-tracking'

const columns: ColumnDef<DocumentTrackingRecord>[] = [
  {
    accessorKey: 'date',
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Date
      </span>
    ),
    cell: ({ row }) => <div className="text-sm font-semibold text-foreground">{row.original.date}</div>,
    meta: {
      headerClassName: 'h-auto w-[20%] px-6 py-4',
      cellClassName: 'px-6 py-4 whitespace-normal',
    },
  },
  {
    accessorKey: 'status',
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Status
      </span>
    ),
    cell: ({ row }) => {
      const { status } = row.original

      return (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
            status === 'Accepted'
              ? 'border-primary/20 bg-primary/5 text-primary'
              : status === 'Pending'
                ? 'border-amber-200/60 bg-amber-50 text-amber-700'
                : 'border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          <span
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
              status === 'Accepted'
                ? 'bg-primary'
                : status === 'Pending'
                  ? 'bg-amber-500'
                  : 'bg-destructive'
            }`}
          ></span>
          {status}
        </span>
      )
    },
    meta: {
      headerClassName: 'h-auto w-[20%] px-6 py-4',
      cellClassName: 'px-6 py-4',
    },
  },
  {
    accessorKey: 'fileName',
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        File Name
      </span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <span className="max-w-[200px] truncate text-sm font-medium text-primary">
          {row.original.fileName}
        </span>
      </div>
    ),
    meta: {
      headerClassName: 'h-auto w-[30%] px-6 py-4',
      cellClassName: 'px-6 py-4',
    },
  },
  {
    accessorKey: 'remarks',
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Remarks
      </span>
    ),
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.remarks}</span>,
    meta: {
      headerClassName: 'h-auto w-[30%] px-6 py-4',
      cellClassName: 'px-6 py-4 whitespace-normal',
    },
  },
]

interface DocumentTrackingTableProps {
  accountId: string
}

export function DocumentTrackingTable({ accountId }: DocumentTrackingTableProps) {
  const { data } = useSuspenseQuery(documentTrackingQueryOptions(accountId))

  return (
    <div className="faculty-panel overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-border/70 p-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Document Tracking</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review the latest document submission statuses and remarks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-primary/80"></span>
          <span className="text-xs font-medium text-primary">Latest sync</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        getRowId={(row) => row.id}
        emptyMessage="No uploaded documents yet."
        headerRowClassName="border-border/60 bg-accent/45 hover:bg-accent/45"
        rowClassName="border-border/40 hover:bg-accent/25"
      />
    </div>
  )
}
