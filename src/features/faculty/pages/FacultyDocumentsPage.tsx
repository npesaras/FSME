import { DocumentTrackingTable } from '../components/DocumentTrackingTable'
import { FacultyWorkspaceShell } from '../components/FacultyWorkspaceShell'
import type { AuthAccount } from '../../auth/types'

interface FacultyDocumentsPageProps {
  account: AuthAccount
}

export default function FacultyDocumentsPage({
  account,
}: FacultyDocumentsPageProps) {
  return (
    <FacultyWorkspaceShell account={account} activeSection="documents">
      <div className="mx-auto w-full max-w-[1600px] p-6 md:p-8">
        <DocumentTrackingTable accountId={account.id} />
      </div>
    </FacultyWorkspaceShell>
  )
}
