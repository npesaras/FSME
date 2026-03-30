import { PanelistDocumentTrackingTable } from '../components/PanelistDocumentTrackingTable'

interface PanelistDocumentsPageProps {
  accountId: string
}

export default function PanelistDocumentsPage({
  accountId,
}: PanelistDocumentsPageProps) {
  return (
    <div className="mx-auto w-full max-w-[1600px] p-6 md:p-8">
      <PanelistDocumentTrackingTable accountId={accountId} />
    </div>
  )
}
