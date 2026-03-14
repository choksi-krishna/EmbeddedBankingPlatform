export type RuntimeMode = "mock" | "supabase";
export type TenantRole =
  | "platform_admin"
  | "partner_admin"
  | "operator"
  | "viewer";
export type UserStatus = "active" | "invited" | "suspended";
export type PartnerStatus = "active" | "onboarding" | "suspended";
export type AccountType = "operating" | "wallet" | "reserve";
export type AccountStatus = "active" | "pending" | "frozen";
export type TransferRail = "ach" | "book";
export type TransferStatus = "pending" | "processing" | "settled" | "failed";
export type TransactionKind =
  | "deposit"
  | "withdrawal"
  | "transfer"
  | "card_authorization"
  | "card_settlement"
  | "fee";
export type TransactionDirection = "credit" | "debit";
export type CardStatus = "active" | "frozen" | "cancelled";
export type KycStatus = "pending" | "approved" | "rejected" | "needs_review";
export type ComplianceStatus = "clear" | "monitor" | "restricted";
export type ApiKeyStatus = "active" | "revoked";
export type WebhookStatus = "active" | "paused";
export type NotificationSeverity = "info" | "warning" | "critical";

export interface Partner {
  id: string;
  name: string;
  slug: string;
  status: PartnerStatus;
  tier: "starter" | "growth" | "enterprise";
  createdAt: string;
  settlementAccountId?: string | null;
  settings: {
    allowedWebhookEvents: string[];
    region: string;
    riskProfile: string;
  };
}

export interface User {
  id: string;
  partnerId: string | null;
  email: string;
  fullName: string;
  role: TenantRole;
  status: UserStatus;
  createdAt: string;
  lastSignInAt?: string | null;
}

export interface Account {
  id: string;
  partnerId: string;
  userId: string;
  accountNumber: string;
  routingNumber: string;
  type: AccountType;
  status: AccountStatus;
  nickname: string;
  currency: string;
  createdAt: string;
}

export interface Balance {
  id: string;
  partnerId: string;
  accountId: string;
  available: number;
  pending: number;
  ledger: number;
  currency: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  partnerId: string;
  accountId: string;
  transferId?: string | null;
  direction: TransactionDirection;
  kind: TransactionKind;
  amount: number;
  currency: string;
  status: TransferStatus;
  description: string;
  counterparty: string;
  metadata: Record<string, string>;
  createdAt: string;
  postedAt: string;
}

export interface Transfer {
  id: string;
  partnerId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  rail: TransferRail;
  status: TransferStatus;
  externalReference?: string | null;
  initiatedByUserId: string;
  createdAt: string;
  settledAt?: string | null;
}

export interface Card {
  id: string;
  partnerId: string;
  userId: string;
  accountId: string;
  cardholderName: string;
  brand: "Visa" | "Mastercard";
  last4: string;
  type: "virtual";
  status: CardStatus;
  spendingLimit: number;
  createdAt: string;
  metadata: Record<string, string>;
}

export interface KycDocument {
  id: string;
  partnerId: string;
  userId: string;
  documentType: "passport" | "drivers_license" | "business_registration";
  fileName: string;
  storagePath: string | null;
  status: KycStatus;
  notes?: string | null;
  uploadedAt: string;
  reviewedAt?: string | null;
  reviewerUserId?: string | null;
}

export interface ComplianceRecord {
  id: string;
  partnerId: string;
  userId?: string | null;
  accountId?: string | null;
  type: "kyc" | "aml" | "transaction_monitoring";
  status: ComplianceStatus;
  riskScore: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  partnerId: string;
  name: string;
  prefix: string;
  keyHash: string;
  permissions: string[];
  status: ApiKeyStatus;
  createdAt: string;
  lastUsedAt?: string | null;
}

export interface Webhook {
  id: string;
  partnerId: string;
  url: string;
  signingSecret: string;
  events: string[];
  status: WebhookStatus;
  createdAt: string;
  lastDeliveryAt?: string | null;
}

export interface Notification {
  id: string;
  partnerId: string;
  type: string;
  title: string;
  body: string;
  severity: NotificationSeverity;
  createdAt: string;
  readAt?: string | null;
}

export interface ViewerContext {
  mode: RuntimeMode;
  authMethod: "session" | "api_key" | "mock";
  userId: string | null;
  partnerId: string | null;
  role: TenantRole;
  email: string;
  fullName: string;
}

export interface AccountWithBalance {
  account: Account;
  balance: Balance | null;
  owner: User | null;
}

export interface TransferPayload {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  rail: TransferRail;
  externalReference?: string;
}

export interface CreateAccountPayload {
  userId: string;
  nickname: string;
  type: AccountType;
  currency: string;
}

export interface IssueCardPayload {
  userId: string;
  accountId: string;
  cardholderName: string;
  spendingLimit: number;
}

export interface KycUploadPayload {
  userId: string;
  documentType: KycDocument["documentType"];
  fileName: string;
  notes?: string;
  fileBytes?: ArrayBuffer;
}

export interface InviteUserPayload {
  email: string;
  fullName: string;
  role: Exclude<TenantRole, "platform_admin">;
}

export interface RegisterWebhookPayload {
  url: string;
  events: string[];
}

export interface AnalyticsSnapshot {
  totalBalance: number;
  monthlyTransferVolume: number;
  activeAccounts: number;
  activeCards: number;
  pendingKyc: number;
  flaggedCompliance: number;
  netFlow: number;
}

export interface DashboardSnapshot {
  partner: Partner | null;
  users: User[];
  accounts: AccountWithBalance[];
  transactions: Transaction[];
  transfers: Transfer[];
  cards: Card[];
  documents: KycDocument[];
  compliance: ComplianceRecord[];
  apiKeys: Array<Omit<ApiKey, "keyHash">>;
  webhooks: Omit<Webhook, "signingSecret">[];
  notifications: Notification[];
  analytics: AnalyticsSnapshot;
}
