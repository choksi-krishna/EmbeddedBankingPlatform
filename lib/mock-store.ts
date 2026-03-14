import {
  mockAccounts,
  mockApiKeys,
  mockBalances,
  mockCards,
  mockComplianceRecords,
  mockDocuments,
  mockNotifications,
  mockPartners,
  mockTransactions,
  mockTransfers,
  mockUsers,
  mockWebhooks,
} from "@/lib/mock-data";

type MockDb = {
  partners: typeof mockPartners;
  users: typeof mockUsers;
  accounts: typeof mockAccounts;
  balances: typeof mockBalances;
  transactions: typeof mockTransactions;
  transfers: typeof mockTransfers;
  cards: typeof mockCards;
  documents: typeof mockDocuments;
  compliance: typeof mockComplianceRecords;
  apiKeys: typeof mockApiKeys;
  webhooks: typeof mockWebhooks;
  notifications: typeof mockNotifications;
};

declare global {
  var __mockBaasDb: MockDb | undefined;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getMockDb() {
  if (!global.__mockBaasDb) {
    global.__mockBaasDb = {
      partners: clone(mockPartners),
      users: clone(mockUsers),
      accounts: clone(mockAccounts),
      balances: clone(mockBalances),
      transactions: clone(mockTransactions),
      transfers: clone(mockTransfers),
      cards: clone(mockCards),
      documents: clone(mockDocuments),
      compliance: clone(mockComplianceRecords),
      apiKeys: clone(mockApiKeys),
      webhooks: clone(mockWebhooks),
      notifications: clone(mockNotifications),
    };
  }

  return global.__mockBaasDb;
}
