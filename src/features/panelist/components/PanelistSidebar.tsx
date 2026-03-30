import { ScopeSidebar } from '@/features/shared/workspace/components/ScopeSidebar'
import type { ScopeSidebarRenderProps } from '@/features/shared/workspace/types'

export function PanelistSidebar(props: ScopeSidebarRenderProps) {
  return (
    <ScopeSidebar
      {...props}
      applicationLabel="Track Applicants"
      documentsPath="/panelist/documents"
      chatPath="/panelist/chat"
    />
  )
}
