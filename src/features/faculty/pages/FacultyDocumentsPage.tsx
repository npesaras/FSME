import { DocumentTrackingTable } from '../components/DocumentTrackingTable'

interface FacultyDocumentsPageProps {
  accountId: string
}

export default function FacultyDocumentsPage({
  accountId,
}: FacultyDocumentsPageProps) {
  return (
    <div className="mx-auto w-full max-w-[1600px] p-6 md:p-8">
      <DocumentTrackingTable accountId={accountId} />
    </div>
  )
}
