import { Account, Client, Health, TablesDB, Users } from 'node-appwrite'
import type { Models } from 'node-appwrite'
import { config } from './config.server'

const adminClient = new Client()
  .setEndpoint(config.appwrite.endpoint)
  .setProject(config.appwrite.projectId)
  .setKey(config.appwrite.apiKey)

function createAuthClient() {
  return new Client()
    .setEndpoint(config.appwrite.endpoint)
    .setProject(config.appwrite.projectId)
}

export function createAuthAccount() {
  return new Account(createAuthClient())
}

export function createAdminAccount() {
  return new Account(adminClient)
}

function createSessionClient(sessionSecret: string) {
  return new Client()
    .setEndpoint(config.appwrite.endpoint)
    .setProject(config.appwrite.projectId)
    .setSession(sessionSecret)
}

export function createSessionAccount(sessionSecret: string) {
  return new Account(createSessionClient(sessionSecret))
}

export const appwrite = {
  client: adminClient,
  health: new Health(adminClient),
  tablesDB: new TablesDB(adminClient),
  users: new Users(adminClient),
  createAdminAccount,
  createAuthAccount,
  createSessionAccount,
}

export async function getAppwriteStatus() {
  const [serviceHealth, databaseHealth, tables] = await Promise.all([
    appwrite.health.get(),
    appwrite.health.getDB(),
    appwrite.tablesDB.listTables({
      databaseId: config.appwrite.databaseId,
    }),
  ])

  return {
    status: 'ok',
    endpoint: config.appwrite.endpoint,
    projectId: config.appwrite.projectId,
    databaseId: config.appwrite.databaseId,
    accountsTableId: config.appwrite.accountsTableId,
    tables: {
      total: tables.total,
      ids: tables.tables.map((table: Models.Table) => table.$id),
    },
    services: {
      appwrite: {
        status: serviceHealth.status,
        ping: serviceHealth.ping,
      },
      database: databaseHealth.statuses.map((status) => ({
        name: status.name,
        status: status.status,
        ping: status.ping,
      })),
    },
  }
}
