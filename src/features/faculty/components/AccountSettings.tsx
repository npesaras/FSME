import { ScopeAccountSettings } from '@/features/shared/workspace/components/ScopeAccountSettings'
import type { AuthAccount } from '../../auth/types'

interface AccountSettingsProps {
  account: AuthAccount
}

export const AccountSettings = ({ account }: AccountSettingsProps) => {
  return <ScopeAccountSettings account={account} />
}
