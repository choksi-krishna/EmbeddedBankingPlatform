export type UserRole = "user" | "partner_admin" | "super_admin";
export type KycStatus =
  | "pending"
  | "submitted"
  | "under_review"
  | "verified"
  | "rejected";
export type AccountType = "checking" | "savings" | "business";
export type AccountStatus = "active" | "frozen" | "closed";
export type TransactionType = "debit" | "credit" | "fee" | "reversal";
export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "reversed";
export type TransferType = "ach" | "wire" | "internal" | "direct_deposit";
export type TransferStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";
export type CardType = "virtual" | "physical";
export type CardStatus = "active" | "frozen" | "cancelled";
export type FraudAlertStatus =
  | "open"
  | "investigating"
  | "resolved"
  | "false_positive";
export type PartnerTier = "starter" | "growth" | "enterprise";
export type FeeType =
  | "ach"
  | "wire"
  | "card_issuance"
  | "monthly"
  | "per_transaction"
  | "interchange_share";

export interface Partner {
  id: string;
  name: string;
  api_key_hash: string | null;
  tier: PartnerTier;
  config: {
    sandbox_mode: boolean;
    rate_limit_per_minute: number;
    allowed_features: string[];
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  partner_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  kyc_status: KycStatus;
  is_sandbox: boolean;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  partner_id: string;
  account_number: string;
  routing_number: string;
  type: AccountType;
  balance: number;
  currency: string;
  status: AccountStatus;
  overdraft_protection: boolean;
  is_sandbox: boolean;
  created_at: string;
  updated_at: string;
}

export interface Balance {
  id: string;
  account_id: string;
  available: number;
  pending: number;
  currency: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Transfer {
  id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  currency: string;
  type: TransferType;
  status: TransferStatus;
  initiated_at: string;
  completed_at: string | null;
  metadata: Record<string, unknown>;
}

export interface Card {
  id: string;
  account_id: string;
  card_number_last4: string;
  card_token: string;
  type: CardType;
  status: CardStatus;
  spending_limits: {
    daily_limit: number | null;
    per_transaction_limit: number | null;
    blocked_merchant_categories: string[];
  };
  expiry_month: number;
  expiry_year: number;
  created_at: string;
}

export interface KycDocument {
  id: string;
  user_id: string;
  doc_type:
    | "passport"
    | "drivers_license"
    | "national_id"
    | "utility_bill"
    | "business_registration";
  status: KycStatus;
  storage_path: string | null;
  rejection_reason: string | null;
  submitted_at: string;
  verified_at: string | null;
}

export interface ComplianceRecord {
  id: string;
  entity_type: "user" | "account" | "transaction";
  entity_id: string;
  action: string;
  performed_by: string;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ApiKey {
  id: string;
  partner_id: string;
  name: string;
  key_hash: string;
  permissions: string[];
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Webhook {
  id: string;
  partner_id: string;
  url: string;
  events: string[];
  secret_hash: string;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  response_status: number | null;
  attempts: number;
  delivered_at: string | null;
  created_at: string;
}

export interface FraudAlert {
  id: string;
  account_id: string;
  transaction_id: string;
  risk_score: number;
  reason: string;
  status: FraudAlertStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface FeeSchedule {
  id: string;
  partner_id: string;
  fee_type: FeeType;
  fixed_amount: number;
  percentage: number;
  config: Record<string, unknown>;
  effective_from: string;
}

export interface Limit {
  id: string;
  entity_type: "card" | "account";
  entity_id: string;
  daily_limit: number | null;
  monthly_limit: number | null;
  per_transaction_limit: number | null;
  allowed_merchant_categories: string[];
  blocked_merchant_categories: string[];
  updated_at: string;
}

export interface Statement {
  id: string;
  account_id: string;
  period_start: string;
  period_end: string;
  storage_path: string | null;
  generated_at: string;
}

export interface Beneficiary {
  id: string;
  user_id: string;
  name: string;
  routing_number: string;
  account_number_hash: string;
  bank_name: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type:
    | "transaction"
    | "kyc_update"
    | "fraud_alert"
    | "card_freeze"
    | "transfer";
  title: string;
  message: string;
  read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  performed_by: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface ApiUsage {
  id: string;
  partner_id: string;
  endpoint: string;
  method: string;
  response_status: number;
  response_time_ms: number;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface CustomClaims {
  role: UserRole;
  partner_id: string;
  is_sandbox: boolean;
}
