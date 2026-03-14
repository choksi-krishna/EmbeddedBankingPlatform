import { isSupabaseConfigured } from "@/lib/env";
import { getMockDb } from "@/lib/mock-store";
import {
  createApiKeyMaterial,
  createWebhookSecret,
  digestValue,
  generateId,
  signWebhookPayload,
} from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Account,
  AccountWithBalance,
  AnalyticsSnapshot,
  ApiKey,
  Balance,
  Card,
  ComplianceRecord,
  CreateAccountPayload,
  DashboardSnapshot,
  InviteUserPayload,
  IssueCardPayload,
  KycDocument,
  KycUploadPayload,
  Notification,
  Partner,
  RegisterWebhookPayload,
  Transaction,
  TransactionKind,
  Transfer,
  TransferPayload,
  TransferStatus,
  User,
  ViewerContext,
  Webhook,
} from "@/lib/types";
import { slugify } from "@/lib/utils";

type DataClient = any;

function sortByDate<T>(rows: T[], getDate: (row: T) => string) {
  return [...rows].sort(
    (a, b) => new Date(getDate(b)).getTime() - new Date(getDate(a)).getTime(),
  );
}

function asRows(data: unknown): Record<string, any>[] {
  return Array.isArray(data) ? (data as Record<string, any>[]) : [];
}

function pickMockViewer(): ViewerContext {
  const db = getMockDb();
  const viewer = db.users.find((user) => user.id === "user-orbit-admin") ?? db.users[0];

  return {
    mode: "mock",
    authMethod: "mock",
    userId: viewer.id,
    partnerId: viewer.partnerId,
    role: viewer.role,
    email: viewer.email,
    fullName: viewer.fullName,
  };
}

function isScopedToPartner(
  viewer: ViewerContext,
  partnerId: string | null | undefined,
) {
  return viewer.role === "platform_admin" || viewer.partnerId === partnerId;
}

function canManageFunds(viewer: ViewerContext) {
  return ["platform_admin", "partner_admin", "operator"].includes(viewer.role);
}

function getTransactionSignedAmount(transaction: Transaction) {
  return transaction.direction === "credit" ? transaction.amount : -transaction.amount;
}

function sanitizeApiKey(apiKey: ApiKey) {
  const { keyHash, ...safeApiKey } = apiKey;
  return safeApiKey;
}

function sanitizeWebhook(webhook: Webhook) {
  const { signingSecret, ...safeWebhook } = webhook;
  return safeWebhook;
}

function computeAnalytics(
  accounts: AccountWithBalance[],
  transactions: Transaction[],
  cards: Card[],
  documents: KycDocument[],
  compliance: ComplianceRecord[],
): AnalyticsSnapshot {
  const totalBalance = accounts.reduce(
    (sum, entry) => sum + (entry.balance?.available ?? 0),
    0,
  );
  const monthlyTransferVolume = transactions
    .filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      return (
        transaction.kind === "transfer" &&
        transactionDate.getUTCMonth() === 2 &&
        transactionDate.getUTCFullYear() === 2026
      );
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const netFlow = transactions.reduce((sum, transaction) => {
    return transaction.direction === "credit"
      ? sum + transaction.amount
      : sum - transaction.amount;
  }, 0);

  return {
    totalBalance,
    monthlyTransferVolume,
    activeAccounts: accounts.filter(
      ({ account }) => account.status === "active",
    ).length,
    activeCards: cards.filter((card) => card.status === "active").length,
    pendingKyc: documents.filter((document) =>
      ["pending", "needs_review"].includes(document.status),
    ).length,
    flaggedCompliance: compliance.filter(
      (record) => record.status !== "clear",
    ).length,
    netFlow,
  };
}

function createNotification(
  partnerId: string,
  type: string,
  title: string,
  body: string,
  severity: Notification["severity"],
): Notification {
  return {
    id: generateId("notif"),
    partnerId,
    type,
    title,
    body,
    severity,
    createdAt: new Date().toISOString(),
    readAt: null,
  };
}

function mapPartnerRow(row: Record<string, any>): Partner {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    tier: row.tier,
    createdAt: row.created_at,
    settlementAccountId: row.settlement_account_id,
    settings: row.settings ?? {
      allowedWebhookEvents: [],
      region: "US",
      riskProfile: "moderate",
    },
  };
}

function mapUserRow(row: Record<string, any>): User {
  return {
    id: row.id,
    partnerId: row.partner_id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    lastSignInAt: row.last_sign_in_at,
  };
}

function mapAccountRow(row: Record<string, any>): Account {
  return {
    id: row.id,
    partnerId: row.partner_id,
    userId: row.user_id,
    accountNumber: row.account_number,
    routingNumber: row.routing_number,
    type: row.type,
    status: row.status,
    nickname: row.nickname,
    currency: row.currency,
    createdAt: row.created_at,
  };
}

function mapBalanceRow(row: Record<string, any>): Balance {
  return {
    id: row.id,
    partnerId: row.partner_id,
    accountId: row.account_id,
    available: Number(row.available),
    pending: Number(row.pending),
    ledger: Number(row.ledger),
    currency: row.currency,
    updatedAt: row.updated_at,
  };
}

function mapTransactionRow(row: Record<string, any>): Transaction {
  return {
    id: row.id,
    partnerId: row.partner_id,
    accountId: row.account_id,
    transferId: row.transfer_id,
    direction: row.direction,
    kind: row.kind,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    description: row.description,
    counterparty: row.counterparty,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    postedAt: row.posted_at,
  };
}

function mapTransferRow(row: Record<string, any>): Transfer {
  return {
    id: row.id,
    partnerId: row.partner_id,
    sourceAccountId: row.source_account_id,
    destinationAccountId: row.destination_account_id,
    amount: Number(row.amount),
    currency: row.currency,
    rail: row.rail,
    status: row.status,
    externalReference: row.external_reference,
    initiatedByUserId: row.initiated_by_user_id,
    createdAt: row.created_at,
    settledAt: row.settled_at,
  };
}

function mapCardRow(row: Record<string, any>): Card {
  return {
    id: row.id,
    partnerId: row.partner_id,
    userId: row.user_id,
    accountId: row.account_id,
    cardholderName: row.cardholder_name,
    brand: row.brand,
    last4: row.last4,
    type: row.type,
    status: row.status,
    spendingLimit: Number(row.spending_limit),
    createdAt: row.created_at,
    metadata: row.metadata ?? {},
  };
}

function mapDocumentRow(row: Record<string, any>): KycDocument {
  return {
    id: row.id,
    partnerId: row.partner_id,
    userId: row.user_id,
    documentType: row.document_type,
    fileName: row.file_name,
    storagePath: row.storage_path,
    status: row.status,
    notes: row.notes,
    uploadedAt: row.uploaded_at,
    reviewedAt: row.reviewed_at,
    reviewerUserId: row.reviewer_user_id,
  };
}

function mapComplianceRow(row: Record<string, any>): ComplianceRecord {
  return {
    id: row.id,
    partnerId: row.partner_id,
    userId: row.user_id,
    accountId: row.account_id,
    type: row.type,
    status: row.status,
    riskScore: Number(row.risk_score),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapApiKeyRow(row: Record<string, any>): ApiKey {
  return {
    id: row.id,
    partnerId: row.partner_id,
    name: row.name,
    prefix: row.prefix,
    keyHash: row.key_hash,
    permissions: row.permissions ?? [],
    status: row.status,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
  };
}

function mapWebhookRow(row: Record<string, any>): Webhook {
  return {
    id: row.id,
    partnerId: row.partner_id,
    url: row.url,
    signingSecret: row.signing_secret,
    events: row.events ?? [],
    status: row.status,
    createdAt: row.created_at,
    lastDeliveryAt: row.last_delivery_at,
  };
}

function mapNotificationRow(row: Record<string, any>): Notification {
  return {
    id: row.id,
    partnerId: row.partner_id,
    type: row.type,
    title: row.title,
    body: row.body,
    severity: row.severity,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

async function getDataClient(viewer?: ViewerContext): Promise<DataClient | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (viewer?.authMethod === "api_key") {
    return createSupabaseAdminClient();
  }

  return createSupabaseServerClient();
}

async function emitWebhookEvent(
  viewer: ViewerContext,
  partnerId: string,
  eventType: string,
  payload: Record<string, unknown>,
) {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    db.notifications.unshift(
      createNotification(
        partnerId,
        "webhook",
        `Webhook event: ${eventType}`,
        `Prepared ${eventType} for ${Object.keys(payload).length} payload fields.`,
        "info",
      ),
    );
    db.webhooks = db.webhooks.map((webhook) =>
      webhook.partnerId === partnerId && webhook.events.includes(eventType)
        ? { ...webhook, lastDeliveryAt: new Date().toISOString() }
        : webhook,
    );
    return;
  }

  const client = await getDataClient(viewer);
  if (!client) {
    return;
  }

  const query = client
    .from("webhooks")
    .select("*")
    .eq("partner_id", partnerId)
    .eq("status", "active")
    .contains("events", [eventType]);
  const { data = [] } = await query;
  const eventBody = JSON.stringify({
    event: eventType,
    createdAt: new Date().toISOString(),
    payload,
  });

  await Promise.all(
    (data as Record<string, any>[]).map(async (row) => {
      const webhook = mapWebhookRow(row);
      const signature = signWebhookPayload(webhook.signingSecret, eventBody);

      try {
        await fetch(webhook.url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-embeddyfi-signature": signature,
          },
          body: eventBody,
        });
        await client
          .from("webhooks")
          .update({ last_delivery_at: new Date().toISOString() })
          .eq("id", webhook.id);
      } catch {
        await client.from("notifications").insert({
          id: generateId("notif"),
          partner_id: partnerId,
          type: "webhook",
          title: "Webhook delivery failed",
          body: `Delivery to ${webhook.url} failed for event ${eventType}.`,
          severity: "warning",
        });
      }
    }),
  );
}

export async function getViewer(): Promise<ViewerContext | null> {
  if (!isSupabaseConfigured) {
    return pickMockViewer();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return {
      mode: "supabase",
      authMethod: "session",
      userId: user.id,
      partnerId: null,
      role: "viewer",
      email: user.email ?? "",
      fullName:
        (user.user_metadata.full_name as string | undefined) ??
        user.email?.split("@")[0] ??
        "User",
    };
  }

  const mapped = mapUserRow(profile as Record<string, any>);

  return {
    mode: "supabase",
    authMethod: "session",
    userId: mapped.id,
    partnerId: mapped.partnerId,
    role: mapped.role,
    email: mapped.email,
    fullName: mapped.fullName,
  };
}

export async function bootstrapPartnerWorkspace(
  userId: string,
  email: string,
  fullName: string,
  companyName: string,
) {
  if (!isSupabaseConfigured) {
    return null;
  }

  const admin = (await createSupabaseAdminClient()) as any;
  if (!admin) {
    throw new Error("Service role key is required to bootstrap a workspace.");
  }

  const partnerId = generateId("partner");
  const accountId = generateId("acct");

  await admin.from("partners").insert({
    id: partnerId,
    name: companyName,
    slug: slugify(companyName),
    status: "onboarding",
    tier: "starter",
    settings: {
      allowedWebhookEvents: [
        "account.created",
        "transfer.settled",
        "card.issued",
        "kyc.updated",
      ],
      region: "US",
      riskProfile: "moderate",
    },
  });

  await admin.from("users").upsert({
    id: userId,
    partner_id: partnerId,
    email,
    full_name: fullName,
    role: "partner_admin",
    status: "active",
  });

  await admin.from("accounts").insert({
    id: accountId,
    partner_id: partnerId,
    user_id: userId,
    account_number: `${Math.floor(100000000000 + Math.random() * 899999999999)}`,
    routing_number: "011000015",
    type: "operating",
    status: "pending",
    nickname: "Primary Operating",
    currency: "USD",
  });

  await admin
    .from("partners")
    .update({ settlement_account_id: accountId })
    .eq("id", partnerId);

  await admin.from("balances").insert({
    id: generateId("bal"),
    partner_id: partnerId,
    account_id: accountId,
    available: 0,
    pending: 0,
    ledger: 0,
    currency: "USD",
  });

  await admin.from("compliance_records").insert({
    id: generateId("comp"),
    partner_id: partnerId,
    user_id: userId,
    account_id: accountId,
    type: "kyc",
    status: "monitor",
    risk_score: 35,
    notes: "Auto-created compliance baseline during onboarding.",
  });

  return partnerId;
}

export async function joinPartnerWorkspace(
  userId: string,
  email: string,
  fullName: string,
  partnerCode: string,
) {
  if (!isSupabaseConfigured) {
    return null;
  }

  const admin = (await createSupabaseAdminClient()) as any;
  if (!admin) {
    throw new Error("Service role key is required to join an existing partner.");
  }

  const normalizedPartnerCode = partnerCode.trim().toLowerCase();
  const { data: partner } = await admin
    .from("partners")
    .select("*")
    .or(`id.eq.${normalizedPartnerCode},slug.eq.${normalizedPartnerCode}`)
    .maybeSingle();

  if (!partner) {
    throw new Error("Invalid partner code. Use a valid partner ID or slug.");
  }

  await admin.from("users").upsert({
    id: userId,
    partner_id: partner.id,
    email,
    full_name: fullName,
    role: "operator",
    status: "active",
    kyc_status: "pending",
  });

  return partner.id as string;
}

export async function listPartners(viewer: ViewerContext) {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    return viewer.role === "platform_admin"
      ? db.partners
      : db.partners.filter((partner) => partner.id === viewer.partnerId);
  }

  const client = await getDataClient(viewer);
  if (!client) {
    return [];
  }

  let query = client.from("partners").select("*").order("created_at", { ascending: false });
  if (viewer.role !== "platform_admin" && viewer.partnerId) {
    query = query.eq("id", viewer.partnerId);
  }
  const { data = [] } = await query;
  return asRows(data).map(mapPartnerRow);
}

export async function listUsers(viewer: ViewerContext) {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    return viewer.role === "platform_admin"
      ? sortByDate(db.users, (row) => row.createdAt)
      : sortByDate(
          db.users.filter((user) => isScopedToPartner(viewer, user.partnerId)),
          (row) => row.createdAt,
        );
  }

  const client = await getDataClient(viewer);
  if (!client) {
    return [];
  }
  let query = client.from("users").select("*").order("created_at", { ascending: false });
  if (viewer.role !== "platform_admin" && viewer.partnerId) {
    query = query.eq("partner_id", viewer.partnerId);
  }
  const { data = [] } = await query;
  return asRows(data).map(mapUserRow);
}

export async function listAccounts(viewer: ViewerContext): Promise<AccountWithBalance[]> {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    const accounts = db.accounts.filter((account) =>
      isScopedToPartner(viewer, account.partnerId),
    );

    return sortByDate(accounts, (row) => row.createdAt).map((account) => ({
      account,
      balance:
        db.balances.find((balance) => balance.accountId === account.id) ?? null,
      owner: db.users.find((user) => user.id === account.userId) ?? null,
    }));
  }

  const client = await getDataClient(viewer);
  if (!client) {
    return [];
  }

  let accountsQuery = client
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: false });
  let balancesQuery = client.from("balances").select("*");
  let usersQuery = client.from("users").select("*");

  if (viewer.role !== "platform_admin" && viewer.partnerId) {
    accountsQuery = accountsQuery.eq("partner_id", viewer.partnerId);
    balancesQuery = balancesQuery.eq("partner_id", viewer.partnerId);
    usersQuery = usersQuery.eq("partner_id", viewer.partnerId);
  }

  const [{ data: accounts = [] }, { data: balances = [] }, { data: users = [] }] =
    await Promise.all([accountsQuery, balancesQuery, usersQuery]);

  const accountRows = asRows(accounts);
  const balanceRows = asRows(balances);
  const userRows = asRows(users);

  return accountRows.map((row) => {
    const account = mapAccountRow(row);
    const balance = balanceRows.find(
      (entry) => entry.account_id === account.id,
    );
    const owner = userRows.find(
      (entry) => entry.id === account.userId,
    );

    return {
      account,
      balance: balance ? mapBalanceRow(balance) : null,
      owner: owner ? mapUserRow(owner) : null,
    };
  });
}

export async function getAccountById(
  viewer: ViewerContext,
  accountId: string,
): Promise<AccountWithBalance | null> {
  const accounts = await listAccounts(viewer);
  return accounts.find(({ account }) => account.id === accountId) ?? null;
}

export async function getAccountBalance(viewer: ViewerContext, accountId: string) {
  const account = await getAccountById(viewer, accountId);
  return account?.balance ?? null;
}

export async function updateAccount(
  viewer: ViewerContext,
  accountId: string,
  payload: Partial<Pick<Account, "nickname" | "type" | "status" | "currency">>,
) {
  if (!canManageFunds(viewer)) {
    throw new Error("Your role cannot update accounts.");
  }

  const existing = await getAccountById(viewer, accountId);
  if (!existing) {
    throw new Error("Account not found.");
  }

  if (!isSupabaseConfigured) {
    const db = getMockDb();
    const index = db.accounts.findIndex((account) => account.id === accountId);
    if (index === -1) {
      throw new Error("Account not found.");
    }

    db.accounts[index] = {
      ...db.accounts[index],
      ...payload,
    };

    return {
      account: db.accounts[index],
      balance: db.balances.find((entry) => entry.accountId === accountId) ?? null,
      owner: db.users.find((user) => user.id === db.accounts[index].userId) ?? null,
    };
  }

  const client = await getDataClient(viewer);
  if (!client) {
    throw new Error("Supabase is not available.");
  }

  const patch = Object.fromEntries(
    Object.entries({
      nickname: payload.nickname,
      type: payload.type,
      status: payload.status,
      currency: payload.currency,
    }).filter(([, value]) => value !== undefined),
  );

  await client.from("accounts").update(patch).eq("id", accountId);
  return getAccountById(viewer, accountId);
}

export async function deleteAccount(viewer: ViewerContext, accountId: string) {
  if (!canManageFunds(viewer)) {
    throw new Error("Your role cannot delete accounts.");
  }

  const existing = await getAccountById(viewer, accountId);
  if (!existing) {
    throw new Error("Account not found.");
  }

  const accountTransactions = await listTransactions(viewer, { accountId, limit: 5 });
  if (accountTransactions.length > 0) {
    throw new Error("Accounts with ledger activity cannot be deleted.");
  }

  if ((existing.balance?.ledger ?? 0) !== 0) {
    throw new Error("Account balance must be zero before deletion.");
  }

  if (!isSupabaseConfigured) {
    const db = getMockDb();
    db.balances = db.balances.filter((entry) => entry.accountId !== accountId);
    db.accounts = db.accounts.filter((entry) => entry.id !== accountId);
    return { success: true };
  }

  const client = await getDataClient(viewer);
  if (!client) {
    throw new Error("Supabase is not available.");
  }

  await client.from("balances").delete().eq("account_id", accountId);
  await client.from("accounts").delete().eq("id", accountId);
  return { success: true };
}

export async function listTransactions(
  viewer: ViewerContext,
  filters: {
    accountId?: string;
    status?: TransferStatus;
    type?: TransactionKind;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {},
) {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    let transactions = sortByDate(
      db.transactions.filter((transaction) =>
        isScopedToPartner(viewer, transaction.partnerId),
      ),
      (row) => row.createdAt,
    );

    if (filters.accountId) {
      transactions = transactions.filter((transaction) => transaction.accountId === filters.accountId);
    }
    if (filters.status) {
      transactions = transactions.filter((transaction) => transaction.status === filters.status);
    }
    if (filters.type) {
      transactions = transactions.filter((transaction) => transaction.kind === filters.type);
    }
    if (filters.startDate) {
      const startTime = new Date(filters.startDate).getTime();
      transactions = transactions.filter(
        (transaction) => new Date(transaction.createdAt).getTime() >= startTime,
      );
    }
    if (filters.endDate) {
      const endTime = new Date(filters.endDate).getTime();
      transactions = transactions.filter(
        (transaction) => new Date(transaction.createdAt).getTime() <= endTime,
      );
    }

    return typeof filters.limit === "number" ? transactions.slice(0, filters.limit) : transactions;
  }

  const client = await getDataClient(viewer);
  if (!client) {
    return [];
  }
  let query = client
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });
  if (viewer.role !== "platform_admin" && viewer.partnerId) {
    query = query.eq("partner_id", viewer.partnerId);
  }
  if (filters.accountId) {
    query = query.eq("account_id", filters.accountId);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.type) {
    query = query.eq("kind", filters.type);
  }
  if (filters.startDate) {
    query = query.gte("created_at", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("created_at", filters.endDate);
  }
  if (typeof filters.limit === "number") {
    query = query.limit(filters.limit);
  }
  const { data = [] } = await query;
  return asRows(data).map(mapTransactionRow);
}

export async function getTransactionById(viewer: ViewerContext, transactionId: string) {
  const transactions = await listTransactions(viewer, { limit: 500 });
  return transactions.find((transaction) => transaction.id === transactionId) ?? null;
}

export async function listTransfers(viewer: ViewerContext) {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    return sortByDate(
      db.transfers.filter((transfer) => isScopedToPartner(viewer, transfer.partnerId)),
      (row) => row.createdAt,
    );
  }

  const client = await getDataClient(viewer);
  if (!client) {
    return [];
  }
  let query = client.from("transfers").select("*").order("created_at", { ascending: false });
  if (viewer.role !== "platform_admin" && viewer.partnerId) {
    query = query.eq("partner_id", viewer.partnerId);
  }
  const { data = [] } = await query;
  return asRows(data).map(mapTransferRow);
}

export async function listCards(viewer: ViewerContext) {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    return sortByDate(
      db.cards.filter((card) => isScopedToPartner(viewer, card.partnerId)),
      (row) => row.createdAt,
    );
  }

  const client = await getDataClient(viewer);
  if (!client) {
    return [];
  }
  let query = client.from("cards").select("*").order("created_at", { ascending: false });
  if (viewer.role !== "platform_admin" && viewer.partnerId) {
    query = query.eq("partner_id", viewer.partnerId);
  }
  const { data = [] } = await query;
  return asRows(data).map(mapCardRow);
}

export async function listKycDocuments(viewer: ViewerContext) {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    return sortByDate(
      db.documents.filter((document) =>
        isScopedToPartner(viewer, document.partnerId),
      ),
      (row) => row.uploadedAt,
    );
  }

  const client = await getDataClient(viewer);
  if (!client) {
    return [];
  }
  let query = client
    .from("kyc_documents")
    .select("*")
    .order("uploaded_at", { ascending: false });
  if (viewer.role !== "platform_admin" && viewer.partnerId) {
    query = query.eq("partner_id", viewer.partnerId);
  }
  const { data = [] } = await query;
  return asRows(data).map(mapDocumentRow);
}

export async function listComplianceRecords(viewer: ViewerContext) {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    return sortByDate(
      db.compliance.filter((record) =>
        isScopedToPartner(viewer, record.partnerId),
      ),
      (row) => row.createdAt,
    );
  }

  const client = await getDataClient(viewer);
  if (!client) {
    return [];
  }
  let query = client
    .from("compliance_records")
    .select("*")
    .order("created_at", { ascending: false });
  if (viewer.role !== "platform_admin" && viewer.partnerId) {
    query = query.eq("partner_id", viewer.partnerId);
  }
  const { data = [] } = await query;
  return asRows(data).map(mapComplianceRow);
}

export async function listApiKeys(viewer: ViewerContext) {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    return sortByDate(
      db.apiKeys.filter((key) => isScopedToPartner(viewer, key.partnerId)),
      (row) => row.createdAt,
    ).map(sanitizeApiKey);
  }

  const client = await getDataClient(viewer);
  if (!client) {
    return [];
  }
  let query = client.from("api_keys").select("*").order("created_at", { ascending: false });
  if (viewer.role !== "platform_admin" && viewer.partnerId) {
    query = query.eq("partner_id", viewer.partnerId);
  }
  const { data = [] } = await query;
  return asRows(data).map(mapApiKeyRow).map(sanitizeApiKey);
}

export async function listWebhooks(viewer: ViewerContext) {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    return sortByDate(
      db.webhooks.filter((webhook) => isScopedToPartner(viewer, webhook.partnerId)),
      (row) => row.createdAt,
    ).map(sanitizeWebhook);
  }

  const client = await getDataClient(viewer);
  if (!client) {
    return [];
  }
  let query = client.from("webhooks").select("*").order("created_at", { ascending: false });
  if (viewer.role !== "platform_admin" && viewer.partnerId) {
    query = query.eq("partner_id", viewer.partnerId);
  }
  const { data = [] } = await query;
  return asRows(data).map(mapWebhookRow).map(sanitizeWebhook);
}

export async function listNotifications(viewer: ViewerContext) {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    return sortByDate(
      db.notifications.filter((notification) =>
        isScopedToPartner(viewer, notification.partnerId),
      ),
      (row) => row.createdAt,
    );
  }

  const client = await getDataClient(viewer);
  if (!client) {
    return [];
  }
  let query = client
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (viewer.role !== "platform_admin" && viewer.partnerId) {
    query = query.eq("partner_id", viewer.partnerId);
  }
  const { data = [] } = await query;
  return asRows(data).map(mapNotificationRow);
}

export async function getAnalytics(viewer: ViewerContext) {
  const [accounts, transactions, cards, documents, compliance] = await Promise.all([
    listAccounts(viewer),
    listTransactions(viewer),
    listCards(viewer),
    listKycDocuments(viewer),
    listComplianceRecords(viewer),
  ]);

  return computeAnalytics(accounts, transactions, cards, documents, compliance);
}

export async function getDashboardSnapshot(
  viewer: ViewerContext,
): Promise<DashboardSnapshot> {
  const [
    partners,
    users,
    accounts,
    transactions,
    transfers,
    cards,
    documents,
    compliance,
    apiKeys,
    webhooks,
    notifications,
    analytics,
  ] = await Promise.all([
    listPartners(viewer),
    listUsers(viewer),
    listAccounts(viewer),
    listTransactions(viewer),
    listTransfers(viewer),
    listCards(viewer),
    listKycDocuments(viewer),
    listComplianceRecords(viewer),
    listApiKeys(viewer),
    listWebhooks(viewer),
    listNotifications(viewer),
    getAnalytics(viewer),
  ]);

  const partner =
    viewer.role === "platform_admin"
      ? partners[0] ?? null
      : partners.find((item) => item.id === viewer.partnerId) ?? null;

  return {
    partner,
    users,
    accounts,
    transactions,
    transfers,
    cards,
    documents,
    compliance,
    apiKeys,
    webhooks,
    notifications,
    analytics,
  };
}

export async function createAccount(
  viewer: ViewerContext,
  payload: CreateAccountPayload,
) {
  if (!viewer.partnerId) {
    throw new Error("Partner scope is required to create an account.");
  }

  if (!isSupabaseConfigured) {
    const db = getMockDb();
    const account: Account = {
      id: generateId("acct"),
      partnerId: viewer.partnerId,
      userId: payload.userId,
      accountNumber: `${Math.floor(100000000000 + Math.random() * 899999999999)}`,
      routingNumber: "011000015",
      type: payload.type,
      status: "pending",
      nickname: payload.nickname,
      currency: payload.currency,
      createdAt: new Date().toISOString(),
    };
    const balance: Balance = {
      id: generateId("bal"),
      partnerId: viewer.partnerId,
      accountId: account.id,
      available: 0,
      pending: 0,
      ledger: 0,
      currency: payload.currency,
      updatedAt: new Date().toISOString(),
    };

    db.accounts.unshift(account);
    db.balances.unshift(balance);
    db.notifications.unshift(
      createNotification(
        viewer.partnerId,
        "account",
        "New account requested",
        `${payload.nickname} has been created in pending status.`,
        "info",
      ),
    );
    return { account, balance };
  }

  const client = await getDataClient(viewer);
  if (!client) {
    throw new Error("Supabase is not available.");
  }

  const accountId = generateId("acct");
  const createdAt = new Date().toISOString();
  await client.from("accounts").insert({
    id: accountId,
    partner_id: viewer.partnerId,
    user_id: payload.userId,
    account_number: `${Math.floor(100000000000 + Math.random() * 899999999999)}`,
    routing_number: "011000015",
    type: payload.type,
    status: "pending",
    nickname: payload.nickname,
    currency: payload.currency,
    created_at: createdAt,
  });
  await client.from("balances").insert({
    id: generateId("bal"),
    partner_id: viewer.partnerId,
    account_id: accountId,
    available: 0,
    pending: 0,
    ledger: 0,
    currency: payload.currency,
    updated_at: createdAt,
  });
  await client.from("notifications").insert({
    id: generateId("notif"),
    partner_id: viewer.partnerId,
    type: "account",
    title: "New account requested",
    body: `${payload.nickname} has been created in pending status.`,
    severity: "info",
  });
  await emitWebhookEvent(viewer, viewer.partnerId, "account.created", {
    accountId,
    nickname: payload.nickname,
  });

  return { accountId };
}

export async function createTransactionEntry(
  viewer: ViewerContext,
  payload: {
    accountId: string;
    direction: Transaction["direction"];
    kind: Transaction["kind"];
    amount: number;
    currency: string;
    status: Transaction["status"];
    description: string;
    counterparty: string;
    metadata: Record<string, string>;
  },
) {
  if (!viewer.partnerId) {
    throw new Error("Partner scope is required for transactions.");
  }

  if (!canManageFunds(viewer)) {
    throw new Error("Your role cannot create transactions.");
  }

  const account = await getAccountById(viewer, payload.accountId);
  if (!account) {
    throw new Error("Account not found.");
  }

  const timestamp = new Date().toISOString();
  const transaction: Transaction = {
    id: generateId("txn"),
    partnerId: account.account.partnerId,
    accountId: payload.accountId,
    transferId: null,
    direction: payload.direction,
    kind: payload.kind,
    amount: payload.amount,
    currency: payload.currency,
    status: payload.status,
    description: payload.description,
    counterparty: payload.counterparty,
    metadata: payload.metadata,
    createdAt: timestamp,
    postedAt: timestamp,
  };
  const signedAmount = getTransactionSignedAmount(transaction);

  if (!isSupabaseConfigured) {
    const db = getMockDb();
    const balance = db.balances.find((entry) => entry.accountId === payload.accountId);
    if (!balance) {
      throw new Error("Balance not found for account.");
    }

    if (payload.status === "settled") {
      balance.available += signedAmount;
      balance.ledger += signedAmount;
    } else if (payload.status !== "failed") {
      balance.pending += payload.amount;
    }
    balance.updatedAt = timestamp;

    db.transactions.unshift(transaction);
    db.notifications.unshift(
      createNotification(
        viewer.partnerId,
        "transaction",
        "Manual transaction recorded",
        `${payload.description} posted for ${payload.amount} ${payload.currency}.`,
        payload.amount >= 25000 ? "warning" : "info",
      ),
    );

    return transaction;
  }

  const client = await getDataClient(viewer);
  if (!client) {
    throw new Error("Supabase is not available.");
  }

  const currentBalance = await getAccountBalance(viewer, payload.accountId);
  if (!currentBalance) {
    throw new Error("Balance not found for account.");
  }

  const balancePatch =
    payload.status === "settled"
      ? {
          available: currentBalance.available + signedAmount,
          ledger: currentBalance.ledger + signedAmount,
          updated_at: timestamp,
        }
      : payload.status === "failed"
        ? { updated_at: timestamp }
        : {
            pending: currentBalance.pending + payload.amount,
            updated_at: timestamp,
          };

  await client.from("transactions").insert({
    id: transaction.id,
    partner_id: transaction.partnerId,
    account_id: transaction.accountId,
    transfer_id: null,
    direction: transaction.direction,
    kind: transaction.kind,
    type: transaction.kind,
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status,
    description: transaction.description,
    counterparty: transaction.counterparty,
    metadata: transaction.metadata,
    created_at: transaction.createdAt,
    posted_at: transaction.postedAt,
  });
  await client.from("balances").update(balancePatch).eq("account_id", payload.accountId);
  await client.from("notifications").insert({
    id: generateId("notif"),
    partner_id: viewer.partnerId,
    user_id: viewer.userId,
    type: "transaction",
    title: "Manual transaction recorded",
    body: `${payload.description} posted for ${payload.amount} ${payload.currency}.`,
    message: `${payload.description} posted for ${payload.amount} ${payload.currency}.`,
    severity: payload.amount >= 25000 ? "warning" : "info",
    metadata: payload.metadata,
    created_at: timestamp,
  });

  if (payload.amount >= 25000) {
    await client.from("fraud_alerts").insert({
      id: generateId("fraud"),
      account_id: payload.accountId,
      transaction_id: transaction.id,
      risk_score: 72,
      reason: "Large manual transaction requires review.",
      status: "open",
      metadata: payload.metadata,
      created_at: timestamp,
      updated_at: timestamp,
    });
  }

  return transaction;
}

export async function createTransfer(
  viewer: ViewerContext,
  payload: TransferPayload,
) {
  if (!viewer.partnerId || !viewer.userId) {
    throw new Error("Authenticated partner user required for transfers.");
  }

  if (!isSupabaseConfigured) {
    const db = getMockDb();
    const sourceBalance = db.balances.find(
      (balance) => balance.accountId === payload.sourceAccountId,
    );
    const destinationBalance = db.balances.find(
      (balance) => balance.accountId === payload.destinationAccountId,
    );
    if (!sourceBalance || !destinationBalance) {
      throw new Error("Source or destination account is missing.");
    }
    if (sourceBalance.available < payload.amount) {
      throw new Error("Insufficient available balance.");
    }

    const transfer: Transfer = {
      id: generateId("tr"),
      partnerId: viewer.partnerId,
      sourceAccountId: payload.sourceAccountId,
      destinationAccountId: payload.destinationAccountId,
      amount: payload.amount,
      currency: payload.currency,
      rail: payload.rail,
      status: "settled",
      externalReference: payload.externalReference ?? null,
      initiatedByUserId: viewer.userId,
      createdAt: new Date().toISOString(),
      settledAt: new Date().toISOString(),
    };

    sourceBalance.available -= payload.amount;
    sourceBalance.ledger -= payload.amount;
    sourceBalance.updatedAt = new Date().toISOString();
    destinationBalance.available += payload.amount;
    destinationBalance.ledger += payload.amount;
    destinationBalance.updatedAt = new Date().toISOString();

    db.transfers.unshift(transfer);
    db.transactions.unshift(
      {
        id: generateId("txn"),
        partnerId: viewer.partnerId,
        accountId: payload.destinationAccountId,
        transferId: transfer.id,
        direction: "credit",
        kind: "deposit",
        amount: payload.amount,
        currency: payload.currency,
        status: "settled",
        description: "Incoming transfer",
        counterparty: "Embedded BaaS",
        metadata: { rail: payload.rail },
        createdAt: transfer.createdAt,
        postedAt: transfer.settledAt ?? transfer.createdAt,
      },
      {
        id: generateId("txn"),
        partnerId: viewer.partnerId,
        accountId: payload.sourceAccountId,
        transferId: transfer.id,
        direction: "debit",
        kind: "transfer",
        amount: payload.amount,
        currency: payload.currency,
        status: "settled",
        description: "Outgoing transfer",
        counterparty: "Embedded BaaS",
        metadata: { rail: payload.rail },
        createdAt: transfer.createdAt,
        postedAt: transfer.settledAt ?? transfer.createdAt,
      },
    );
    db.notifications.unshift(
      createNotification(
        viewer.partnerId,
        "transfer",
        "Transfer settled",
        `Transfer ${transfer.id} settled for ${payload.amount} ${payload.currency}.`,
        "info",
      ),
    );
    await emitWebhookEvent(viewer, viewer.partnerId, "transfer.settled", {
      transferId: transfer.id,
      amount: payload.amount,
      rail: payload.rail,
    });

    return transfer;
  }

  const client = await getDataClient(viewer);
  if (!client) {
    throw new Error("Supabase is not available.");
  }

  const { data: sourceBalanceRow } = await client
    .from("balances")
    .select("*")
    .eq("account_id", payload.sourceAccountId)
    .maybeSingle();
  const { data: destinationBalanceRow } = await client
    .from("balances")
    .select("*")
    .eq("account_id", payload.destinationAccountId)
    .maybeSingle();

  if (!sourceBalanceRow || !destinationBalanceRow) {
    throw new Error("Source or destination balance not found.");
  }

  const sourceBalance = mapBalanceRow(sourceBalanceRow as Record<string, any>);
  const destinationBalance = mapBalanceRow(
    destinationBalanceRow as Record<string, any>,
  );

  if (sourceBalance.available < payload.amount) {
    throw new Error("Insufficient available balance.");
  }

  const transferId = generateId("tr");
  const timestamp = new Date().toISOString();
  await client.from("transfers").insert({
    id: transferId,
    partner_id: viewer.partnerId,
    source_account_id: payload.sourceAccountId,
    destination_account_id: payload.destinationAccountId,
    amount: payload.amount,
    currency: payload.currency,
    rail: payload.rail,
    status: "settled",
    external_reference: payload.externalReference ?? null,
    initiated_by_user_id: viewer.userId,
    created_at: timestamp,
    settled_at: timestamp,
  });
  await client
    .from("balances")
    .update({
      available: sourceBalance.available - payload.amount,
      ledger: sourceBalance.ledger - payload.amount,
      updated_at: timestamp,
    })
    .eq("account_id", payload.sourceAccountId);
  await client
    .from("balances")
    .update({
      available: destinationBalance.available + payload.amount,
      ledger: destinationBalance.ledger + payload.amount,
      updated_at: timestamp,
    })
    .eq("account_id", payload.destinationAccountId);
  await client.from("transactions").insert([
    {
      id: generateId("txn"),
      partner_id: viewer.partnerId,
      account_id: payload.sourceAccountId,
      transfer_id: transferId,
      direction: "debit",
      kind: "transfer",
      amount: payload.amount,
      currency: payload.currency,
      status: "settled",
      description: "Outgoing transfer",
      counterparty: "Embedded BaaS",
      metadata: { rail: payload.rail },
      created_at: timestamp,
      posted_at: timestamp,
    },
    {
      id: generateId("txn"),
      partner_id: viewer.partnerId,
      account_id: payload.destinationAccountId,
      transfer_id: transferId,
      direction: "credit",
      kind: "deposit",
      amount: payload.amount,
      currency: payload.currency,
      status: "settled",
      description: "Incoming transfer",
      counterparty: "Embedded BaaS",
      metadata: { rail: payload.rail },
      created_at: timestamp,
      posted_at: timestamp,
    },
  ]);
  await client.from("notifications").insert({
    id: generateId("notif"),
    partner_id: viewer.partnerId,
    type: "transfer",
    title: "Transfer settled",
    body: `Transfer ${transferId} settled for ${payload.amount} ${payload.currency}.`,
    severity: "info",
    created_at: timestamp,
  });
  await emitWebhookEvent(viewer, viewer.partnerId, "transfer.settled", {
    transferId,
    amount: payload.amount,
    rail: payload.rail,
  });

  return { transferId };
}

export async function issueVirtualCard(
  viewer: ViewerContext,
  payload: IssueCardPayload,
) {
  if (!viewer.partnerId) {
    throw new Error("Partner scope is required for card issuance.");
  }

  const card: Card = {
    id: generateId("card"),
    partnerId: viewer.partnerId,
    userId: payload.userId,
    accountId: payload.accountId,
    cardholderName: payload.cardholderName,
    brand: "Visa",
    last4: `${Math.floor(1000 + Math.random() * 9000)}`,
    type: "virtual",
    status: "active",
    spendingLimit: payload.spendingLimit,
    createdAt: new Date().toISOString(),
    metadata: { issuer: "EmbeddyFi Sandbox" },
  };

  if (!isSupabaseConfigured) {
    const db = getMockDb();
    db.cards.unshift(card);
    db.notifications.unshift(
      createNotification(
        viewer.partnerId,
        "card",
        "Virtual card issued",
        `${payload.cardholderName} received a new virtual card.`,
        "info",
      ),
    );
    await emitWebhookEvent(viewer, viewer.partnerId, "card.issued", {
      cardId: card.id,
      accountId: card.accountId,
    });
    return card;
  }

  const client = await getDataClient(viewer);
  if (!client) {
    throw new Error("Supabase is not available.");
  }

  await client.from("cards").insert({
    id: card.id,
    partner_id: card.partnerId,
    user_id: card.userId,
    account_id: card.accountId,
    cardholder_name: card.cardholderName,
    brand: card.brand,
    last4: card.last4,
    type: card.type,
    status: card.status,
    spending_limit: card.spendingLimit,
    metadata: card.metadata,
    created_at: card.createdAt,
  });
  await client.from("notifications").insert({
    id: generateId("notif"),
    partner_id: viewer.partnerId,
    type: "card",
    title: "Virtual card issued",
    body: `${payload.cardholderName} received a new virtual card.`,
    severity: "info",
  });
  await emitWebhookEvent(viewer, viewer.partnerId, "card.issued", {
    cardId: card.id,
    accountId: card.accountId,
  });

  return card;
}

export async function uploadKycDocument(
  viewer: ViewerContext,
  payload: KycUploadPayload,
) {
  if (!viewer.partnerId) {
    throw new Error("Partner scope is required for KYC uploads.");
  }

  const document: KycDocument = {
    id: generateId("kyc"),
    partnerId: viewer.partnerId,
    userId: payload.userId,
    documentType: payload.documentType,
    fileName: payload.fileName,
    storagePath: null,
    status: "pending",
    notes: payload.notes ?? null,
    uploadedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewerUserId: null,
  };

  if (!isSupabaseConfigured) {
    const db = getMockDb();
    db.documents.unshift(document);
    db.compliance.unshift({
      id: generateId("comp"),
      partnerId: viewer.partnerId,
      userId: payload.userId,
      accountId: null,
      type: "kyc",
      status: "monitor",
      riskScore: 42,
      notes: "Pending document review.",
      createdAt: document.uploadedAt,
      updatedAt: document.uploadedAt,
    });
    await emitWebhookEvent(viewer, viewer.partnerId, "kyc.updated", {
      documentId: document.id,
      status: document.status,
    });
    return document;
  }

  const client = await getDataClient(viewer);
  if (!client) {
    throw new Error("Supabase is not available.");
  }
  let storagePath: string | null = null;
  if (payload.fileBytes && viewer.partnerId) {
    const admin = await createSupabaseAdminClient();
    if (admin) {
      storagePath = `${viewer.partnerId}/${payload.userId}/${document.id}-${payload.fileName}`;
      await admin.storage
        .from("kyc-documents")
        .upload(storagePath, Buffer.from(payload.fileBytes), {
          contentType: "application/octet-stream",
          upsert: true,
        });
    }
  }
  await client.from("kyc_documents").insert({
    id: document.id,
    partner_id: document.partnerId,
    user_id: document.userId,
    document_type: document.documentType,
    file_name: document.fileName,
    storage_path: storagePath,
    status: "pending",
    notes: document.notes,
    uploaded_at: document.uploadedAt,
  });
  await client.from("compliance_records").insert({
    id: generateId("comp"),
    partner_id: viewer.partnerId,
    user_id: payload.userId,
    type: "kyc",
    status: "monitor",
    risk_score: 42,
    notes: "Pending document review.",
    created_at: document.uploadedAt,
    updated_at: document.uploadedAt,
  });
  await emitWebhookEvent(viewer, viewer.partnerId, "kyc.updated", {
    documentId: document.id,
    status: document.status,
  });

  return { ...document, storagePath };
}

export async function createPartnerApiKey(viewer: ViewerContext, name: string) {
  if (!viewer.partnerId) {
    throw new Error("Partner scope is required for API keys.");
  }

  const partnerName =
    (await listPartners(viewer)).find((partner) => partner.id === viewer.partnerId)
      ?.name ?? "partner";
  const material = createApiKeyMaterial(partnerName);
  const record: ApiKey = {
    id: generateId("api"),
    partnerId: viewer.partnerId,
    name,
    prefix: material.prefix,
    keyHash: material.keyHash,
    permissions: [
      "accounts:read",
      "transactions:read",
      "transfers:write",
      "cards:write",
      "webhooks:read",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };

  if (!isSupabaseConfigured) {
    const db = getMockDb();
    db.apiKeys.unshift(record);
    return {
      rawKey: material.rawKey,
      apiKey: sanitizeApiKey(record),
    };
  }

  const client = await getDataClient(viewer);
  if (!client) {
    throw new Error("Supabase is not available.");
  }
  await client.from("api_keys").insert({
    id: record.id,
    partner_id: record.partnerId,
    name: record.name,
    prefix: record.prefix,
    key_hash: record.keyHash,
    permissions: record.permissions,
    status: record.status,
    created_at: record.createdAt,
  });
  return {
    rawKey: material.rawKey,
    apiKey: sanitizeApiKey(record),
  };
}

export async function registerWebhook(
  viewer: ViewerContext,
  payload: RegisterWebhookPayload,
) {
  if (!viewer.partnerId) {
    throw new Error("Partner scope is required for webhook registration.");
  }

  const webhook: Webhook = {
    id: generateId("wh"),
    partnerId: viewer.partnerId,
    url: payload.url,
    signingSecret: createWebhookSecret(),
    events: payload.events,
    status: "active",
    createdAt: new Date().toISOString(),
    lastDeliveryAt: null,
  };

  if (!isSupabaseConfigured) {
    const db = getMockDb();
    db.webhooks.unshift(webhook);
    return {
      webhook: sanitizeWebhook(webhook),
      signingSecret: webhook.signingSecret,
    };
  }

  const client = await getDataClient(viewer);
  if (!client) {
    throw new Error("Supabase is not available.");
  }
  await client.from("webhooks").insert({
    id: webhook.id,
    partner_id: webhook.partnerId,
    url: webhook.url,
    signing_secret: webhook.signingSecret,
    events: webhook.events,
    status: webhook.status,
    created_at: webhook.createdAt,
  });

  return {
    webhook: sanitizeWebhook(webhook),
    signingSecret: webhook.signingSecret,
  };
}

export async function inviteUser(
  viewer: ViewerContext,
  payload: InviteUserPayload,
) {
  if (!viewer.partnerId) {
    throw new Error("Partner scope is required for user invitations.");
  }

  if (!isSupabaseConfigured) {
    const db = getMockDb();
    const user: User = {
      id: generateId("user"),
      partnerId: viewer.partnerId,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
      status: "invited",
      createdAt: new Date().toISOString(),
      lastSignInAt: null,
    };
    db.users.unshift(user);
    return user;
  }

  const admin = (await createSupabaseAdminClient()) as any;
  if (!admin) {
    throw new Error("Service role key is required to invite users.");
  }
  const invite = await admin.auth.admin.inviteUserByEmail(payload.email, {
    data: {
      full_name: payload.fullName,
      partner_id: viewer.partnerId,
      role: payload.role,
    },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login`,
  });

  if (invite.error || !invite.data.user) {
    throw new Error(invite.error?.message ?? "Unable to invite user.");
  }

  await admin.from("users").upsert({
    id: invite.data.user.id,
    partner_id: viewer.partnerId,
    email: payload.email,
    full_name: payload.fullName,
    role: payload.role,
    status: "invited",
  });

  const user: User = {
    id: invite.data.user.id,
    partnerId: viewer.partnerId,
    email: payload.email,
    fullName: payload.fullName,
    role: payload.role,
    status: "invited",
    createdAt: new Date().toISOString(),
    lastSignInAt: null,
  };

  return user;
}

export async function enforceApiRateLimit(
  viewer: ViewerContext,
  routeKey: string,
) {
  if (!viewer.partnerId || viewer.authMethod !== "api_key") {
    return { allowed: true, limit: null, remaining: null };
  }

  if (!isSupabaseConfigured) {
    return { allowed: true, limit: 1000, remaining: 999 };
  }

  const admin = (await createSupabaseAdminClient()) as any;
  if (!admin) {
    return { allowed: true, limit: null, remaining: null };
  }

  const { data: partnerRow } = await admin
    .from("partners")
    .select("config")
    .eq("id", viewer.partnerId)
    .maybeSingle();
  const rateLimit =
    Number((partnerRow?.config as Record<string, unknown> | undefined)?.rateLimitPerHour) || 1000;
  const windowStartedAt = new Date();
  windowStartedAt.setUTCMinutes(0, 0, 0);
  const windowKey = windowStartedAt.toISOString();

  const { data: rateRow } = await admin
    .from("api_rate_limits")
    .select("*")
    .eq("partner_id", viewer.partnerId)
    .eq("route_key", routeKey)
    .eq("window_started_at", windowKey)
    .maybeSingle();

  const currentCount = Number(rateRow?.request_count ?? 0);
  if (currentCount >= rateLimit) {
    return {
      allowed: false,
      limit: rateLimit,
      remaining: 0,
      retryAt: new Date(windowStartedAt.getTime() + 60 * 60 * 1000).toISOString(),
    };
  }

  return {
    allowed: true,
    limit: rateLimit,
    remaining: Math.max(rateLimit - currentCount - 1, 0),
    windowStartedAt: windowKey,
  };
}

export async function recordApiRequest(
  viewer: ViewerContext,
  routeKey: string,
) {
  if (!viewer.partnerId || viewer.authMethod !== "api_key" || !isSupabaseConfigured) {
    return;
  }

  const admin = (await createSupabaseAdminClient()) as any;
  if (!admin) {
    return;
  }

  const windowStartedAt = new Date();
  windowStartedAt.setUTCMinutes(0, 0, 0);
  const windowKey = windowStartedAt.toISOString();

  const { data: rateRow } = await admin
    .from("api_rate_limits")
    .select("*")
    .eq("partner_id", viewer.partnerId)
    .eq("route_key", routeKey)
    .eq("window_started_at", windowKey)
    .maybeSingle();

  if (!rateRow) {
    await admin.from("api_rate_limits").insert({
      partner_id: viewer.partnerId,
      route_key: routeKey,
      window_started_at: windowKey,
      request_count: 1,
      last_request_at: new Date().toISOString(),
    });
    return;
  }

  await admin
    .from("api_rate_limits")
    .update({
      request_count: Number(rateRow.request_count ?? 0) + 1,
      last_request_at: new Date().toISOString(),
    })
    .eq("id", rateRow.id);
}

export async function verifyApiKey(rawKey: string): Promise<ViewerContext | null> {
  if (!rawKey) {
    return null;
  }

  if (!isSupabaseConfigured) {
    const db = getMockDb();
    const match = db.apiKeys.find(
      (entry) => entry.status === "active" && entry.keyHash === digestValue(rawKey),
    );
    if (!match) {
      return null;
    }
    const partnerUsers = db.users.find(
      (user) =>
        user.partnerId === match.partnerId &&
        ["partner_admin", "operator"].includes(user.role),
    );
    if (!partnerUsers) {
      return null;
    }

    return {
      mode: "mock",
      authMethod: "api_key",
      userId: partnerUsers.id,
      partnerId: match.partnerId,
      role: partnerUsers.role,
      email: partnerUsers.email,
      fullName: partnerUsers.fullName,
    };
  }

  const admin = (await createSupabaseAdminClient()) as any;
  if (!admin) {
    return null;
  }

  const segments = rawKey.split(".");
  if (segments.length !== 3) {
    return null;
  }

  const prefix = segments[1];
  const hashed = digestValue(rawKey);
  const { data: keyRow } = await admin
    .from("api_keys")
    .select("*")
    .eq("prefix", prefix)
    .eq("status", "active")
    .maybeSingle();

  if (!keyRow) {
    return null;
  }

  const key = mapApiKeyRow(keyRow as Record<string, any>);
  if (key.keyHash !== hashed) {
    return null;
  }

  const { data: userRow } = await admin
    .from("users")
    .select("*")
    .eq("partner_id", key.partnerId)
    .in("role", ["partner_admin", "operator"])
    .limit(1)
    .maybeSingle();

  if (!userRow) {
    return null;
  }

  const user = mapUserRow(userRow as Record<string, any>);
  await admin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", key.id);

  return {
    mode: "supabase",
    authMethod: "api_key",
    userId: user.id,
    partnerId: user.partnerId,
    role: user.role,
    email: user.email,
    fullName: user.fullName,
  };
}
