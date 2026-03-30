import { ScopeAccountSettings } from '@/features/shared/workspace/components/ScopeAccountSettings'
import type { AuthAccount } from '../../auth/types'
interface PanelistAccountSettingsProps {
  account: AuthAccount
}

export const PanelistAccountSettings = ({ account }: PanelistAccountSettingsProps) => {
  return <ScopeAccountSettings account={account} />
}
