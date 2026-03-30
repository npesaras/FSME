import { appwrite, getAppwriteStatus } from '../../plugins/appwrite.server'
import { createAccountsService } from './accounts-service.server'
import { config } from '../../shared/config.server'

export const authRuntime = {
  config,
  appwrite,
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
    logger: console,
  }),
}

export type AuthRuntime = typeof authRuntime
