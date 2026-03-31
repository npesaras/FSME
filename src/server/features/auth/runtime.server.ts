import { appwrite, getAppwriteStatus } from '../../plugins/appwrite.server'
import { createAccountsService } from './accounts-service.server'
import { createCometChatProvisioningService } from '../chat/cometchat-provisioning.server'
import { config } from '../../shared/config.server'

const cometChat = createCometChatProvisioningService({
  appId: config.cometchat.appId,
  region: config.cometchat.region,
  apiKey: config.cometchat.apiKey,
  tablesDB: appwrite.tablesDB,
  databaseId: config.appwrite.databaseId,
  userProfilesTableId: config.appwrite.userProfilesTableId,
  cometUserProfilesTableId: config.appwrite.cometUserProfilesTableId,
  logger: console,
})

export const authRuntime = {
  config,
  appwrite,
  cometChat,
  getAppwriteStatus,
  accounts: createAccountsService({
    users: appwrite.users,
    createAdminAccount: appwrite.createAdminAccount,
    createAuthAccount: appwrite.createAuthAccount,
    createSessionAccount: appwrite.createSessionAccount,
    tablesDB: appwrite.tablesDB,
    databaseId: config.appwrite.databaseId,
    userProfilesTableId: config.appwrite.userProfilesTableId,
    recoveryOrigins: config.appwrite.recoveryOrigins,
    verificationOrigins: config.appwrite.verificationOrigins,
    ensureCometChatProfile: (account) => cometChat.ensureProfileForAccount(account),
    deleteCometChatProfile: (userId) => cometChat.deleteProfileForUser(userId),
    logger: console,
  }),
}

export type AuthRuntime = typeof authRuntime
