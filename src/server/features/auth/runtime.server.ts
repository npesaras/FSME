import { appwrite, getAppwriteStatus } from '../../shared/appwrite.server'
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
    tableId: config.appwrite.accountsTableId,
    recoveryOrigins: config.appwrite.recoveryOrigins,
    logger: console,
  }),
}

export type AuthRuntime = typeof authRuntime
