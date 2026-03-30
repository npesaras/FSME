import { ScopeSidebar } from '@/features/shared/workspace/components/ScopeSidebar'
import type { ScopeSidebarRenderProps } from '@/features/shared/workspace/types'

export function FacultySidebar(props: ScopeSidebarRenderProps) {
  return (
    <ScopeSidebar
      {...props}
      applicationLabel="Apply for Scholarships"
      documentsPath="/faculty/documents"
      chatPath="/faculty/chat"
    />
  )
}
