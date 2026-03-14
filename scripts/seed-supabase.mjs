import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

import { loadProjectEnv, requireAnyEnv, requireEnv } from "./lib/env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

loadProjectEnv(projectRoot);

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
requireAnyEnv([
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
]);
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const seedEmail = process.env.SEED_PARTNER_ADMIN_EMAIL ?? "ops@orbit.example";
const seedPassword = process.env.SEED_PARTNER_ADMIN_PASSWORD ?? "OrbitDemo123!";
const seedApiKeyName = process.env.SEED_PARTNER_API_KEY_NAME ?? "Orbit Sandbox SDK";
const seedApiKeyPermissions = (
  process.env.SEED_PARTNER_API_KEY_PERMISSIONS ??
  "accounts:read,transactions:read,transfers:write,webhooks:read"
)
  .split(",")
  .map((permission) => permission.trim())
  .filter(Boolean);
const seedRawApiKey =
  process.env.SEED_PARTNER_API_KEY ?? "baas.orbitdemo01.secret123";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function digestValue(value) {
  return createHash("sha256").update(value).digest("hex");
}

function parseSeedApiKey(rawKey) {
  const segments = rawKey.split(".");
  if (segments.length !== 3 || segments.some((segment) => !segment)) {
    throw new Error(
      "SEED_PARTNER_API_KEY must use the format baas.<prefix>.<secret>.",
    );
  }

  return {
    prefix: segments[1],
    rawKey,
  };
}

const seedApiKey = parseSeedApiKey(seedRawApiKey);
const seedIds = {
  partnerId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1001",
  operatingAccountId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1002",
  reserveAccountId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1003",
  payrollAccountId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1004",
  operatingBalanceId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1005",
  reserveBalanceId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1006",
  payrollBalanceId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1007",
  primaryApiKeyId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1008",
  readonlyApiKeyId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1009",
  inboundTransferId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1010",
  reserveTransferId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1011",
  payrollTransferId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1012",
  failedTransferId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1013",
  inboundTransactionId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1014",
  reserveTransactionId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1015",
  payrollTransactionId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1016",
  cardSpendTransactionId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1017",
  feeTransactionId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1018",
  reversedTransactionId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1019",
  primaryCardId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1020",
  travelCardId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1021",
  opsCardId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1060",
  vendorCardId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1061",
  marketingCardId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1062",
  backupCardId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1063",
  verifiedDocumentId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1022",
  reviewDocumentId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1023",
  rejectedDocumentId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1024",
  accountComplianceId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1025",
  transactionComplianceId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1026",
  userComplianceId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1027",
  highRiskFraudId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1028",
  resolvedFraudId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1029",
  achFeeId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1030",
  wireFeeId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1031",
  cardFeeId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1032",
  monthlyFeeId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1033",
  operatingLimitId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1034",
  reserveLimitId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1035",
  cardLimitId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1036",
  febStatementId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1037",
  marStatementId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1038",
  beneficiaryOneId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1039",
  beneficiaryTwoId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1040",
  primaryWebhookId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1041",
  opsWebhookId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1042",
  webhookEventOneId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1043",
  webhookEventTwoId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1044",
  webhookEventThreeId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1045",
  notificationOneId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1046",
  notificationTwoId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1047",
  notificationThreeId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1048",
  notificationFourId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1049",
  notificationFiveId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1050",
  apiUsageOneId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1051",
  apiUsageTwoId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1052",
  apiUsageThreeId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1053",
  apiUsageFourId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1054",
  apiUsageFiveId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1055",
  auditOneId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1056",
  auditTwoId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1057",
  auditThreeId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1058",
  auditFourId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1059",
  wireInTransactionId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1064",
  vendorPayoutTransactionId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1065",
  travelCardTransactionId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1066",
};

function relativeIso({
  days = 0,
  hours = 0,
  minutes = 0,
} = {}) {
  const offsetMs =
    (((days * 24 + hours) * 60 + minutes) * 60) * 1000;
  return new Date(Date.now() - offsetMs).toISOString();
}

async function runQuery(promise) {
  const { error } = await promise;
  if (error) {
    throw error;
  }
}

async function upsertRows(table, rows, onConflict = "id") {
  for (const row of rows) {
    await runQuery(supabase.from(table).upsert(row, { onConflict }));
  }
}

async function syncSeedUserAuthClaims(seedUserId) {
  const { error } = await supabase.auth.admin.updateUserById(seedUserId, {
    app_metadata: {
      partner_id: seedIds.partnerId,
      role: "partner_admin",
      kyc_status: "verified",
    },
  });

  if (error) {
    throw error;
  }
}

async function findOrCreateSeedUser() {
  const existingUsers = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    existingUsers.push(...data.users);
    totalPages = data.total ? Math.max(1, Math.ceil(data.total / 200)) : 1;
    page += 1;
  }

  const existingUser = existingUsers.find((user) => user.email === seedEmail);
  if (existingUser) {
    return existingUser;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: seedEmail,
    password: seedPassword,
    email_confirm: true,
    user_metadata: {
      full_name: "Orbit Admin",
      company_name: "Orbit Treasury",
    },
  });

  if (error || !data.user) {
    throw error ?? new Error("Unable to create seed auth user.");
  }

  return data.user;
}

async function upsertPartnerWorkspace(seedUserId) {
  const now = relativeIso();
  const primaryWebhookSecret = "whsec_seed_orbit_primary_secret";
  const opsWebhookSecret = "whsec_seed_orbit_ops_secret";
  const readonlyRawApiKey = "baas.orbitro01.readonly456";
  const partner = {
    id: seedIds.partnerId,
    name: "Orbit Treasury",
    api_key_hash: digestValue(seedApiKey.rawKey),
    tier: "enterprise",
    config: {
      sandbox_mode: true,
      rate_limit_per_minute: 120,
      allowed_features: [
        "accounts",
        "transfers",
        "cards",
        "webhooks",
        "kyc",
      ],
    },
    is_active: true,
  };

  const user = {
    id: seedUserId,
    partner_id: seedIds.partnerId,
    email: seedEmail,
    full_name: "Orbit Admin",
    role: "partner_admin",
    kyc_status: "verified",
    is_sandbox: true,
  };

  const accounts = [
    {
      id: seedIds.operatingAccountId,
      user_id: seedUserId,
      partner_id: seedIds.partnerId,
      account_number: "100000013579",
      routing_number: "011000015",
      type: "business",
      balance: 297900.12,
      currency: "USD",
      status: "active",
      overdraft_protection: true,
      is_sandbox: true,
    },
    {
      id: seedIds.reserveAccountId,
      user_id: seedUserId,
      partner_id: seedIds.partnerId,
      account_number: "100000013580",
      routing_number: "011000015",
      type: "savings",
      balance: 91500.45,
      currency: "USD",
      status: "active",
      overdraft_protection: false,
      is_sandbox: true,
    },
    {
      id: seedIds.payrollAccountId,
      user_id: seedUserId,
      partner_id: seedIds.partnerId,
      account_number: "100000013581",
      routing_number: "011000015",
      type: "checking",
      balance: 42480.77,
      currency: "USD",
      status: "active",
      overdraft_protection: true,
      is_sandbox: true,
    },
  ];

  const balances = [
    {
      id: seedIds.operatingBalanceId,
      account_id: seedIds.operatingAccountId,
      available: 285400.12,
      pending: 12500.0,
      currency: "USD",
      updated_at: relativeIso({ minutes: 4 }),
    },
    {
      id: seedIds.reserveBalanceId,
      account_id: seedIds.reserveAccountId,
      available: 90000.45,
      pending: 1500.0,
      currency: "USD",
      updated_at: relativeIso({ minutes: 18 }),
    },
    {
      id: seedIds.payrollBalanceId,
      account_id: seedIds.payrollAccountId,
      available: 40980.77,
      pending: 1500.0,
      currency: "USD",
      updated_at: relativeIso({ minutes: 9 }),
    },
  ];

  const apiKeys = [
    {
      id: seedIds.primaryApiKeyId,
      partner_id: seedIds.partnerId,
      name: seedApiKeyName,
      key_hash: digestValue(seedApiKey.rawKey),
      permissions: seedApiKeyPermissions,
      last_used_at: relativeIso({ minutes: 7 }),
      expires_at: null,
      is_active: true,
      created_at: relativeIso({ days: 24 }),
      metadata: {
        prefix: seedApiKey.prefix,
        seeded_from: process.env.SEED_PARTNER_API_KEY ? "env" : "default",
        seeded_by: "scripts/seed-supabase.mjs",
      },
    },
    {
      id: seedIds.readonlyApiKeyId,
      partner_id: seedIds.partnerId,
      name: "Orbit Read Only",
      key_hash: digestValue(readonlyRawApiKey),
      permissions: ["accounts:read", "transactions:read", "webhooks:read"],
      last_used_at: relativeIso({ hours: 2 }),
      expires_at: null,
      is_active: true,
      created_at: relativeIso({ days: 8 }),
      metadata: {
        prefix: readonlyRawApiKey.split(".")[1],
        seeded_from: "default",
        seeded_by: "scripts/seed-supabase.mjs",
      },
    },
  ];

  const feeSchedules = [
    {
      id: seedIds.achFeeId,
      partner_id: seedIds.partnerId,
      fee_type: "ach",
      fixed_amount: 0.35,
      percentage: 0,
      config: { settlement_window: "T+1" },
      effective_from: relativeIso({ days: 45 }),
    },
    {
      id: seedIds.wireFeeId,
      partner_id: seedIds.partnerId,
      fee_type: "wire",
      fixed_amount: 15,
      percentage: 0,
      config: { cutoff_hour_utc: 18 },
      effective_from: relativeIso({ days: 45 }),
    },
    {
      id: seedIds.cardFeeId,
      partner_id: seedIds.partnerId,
      fee_type: "card_issuance",
      fixed_amount: 3.5,
      percentage: 0,
      config: { card_type: "virtual" },
      effective_from: relativeIso({ days: 30 }),
    },
    {
      id: seedIds.monthlyFeeId,
      partner_id: seedIds.partnerId,
      fee_type: "monthly",
      fixed_amount: 299,
      percentage: 0,
      config: { tier: "enterprise" },
      effective_from: relativeIso({ days: 60 }),
    },
  ];

  const transfers = [
    {
      id: seedIds.inboundTransferId,
      from_account_id: seedIds.reserveAccountId,
      to_account_id: seedIds.operatingAccountId,
      amount: 50000,
      currency: "USD",
      type: "internal",
      status: "completed",
      initiated_at: relativeIso({ days: 2, hours: 3 }),
      completed_at: relativeIso({ days: 2, hours: 2, minutes: 42 }),
      metadata: {
        seeded: true,
        purpose: "liquidity_rebalance",
        initiated_by_user_id: seedUserId,
      },
    },
    {
      id: seedIds.reserveTransferId,
      from_account_id: seedIds.operatingAccountId,
      to_account_id: seedIds.reserveAccountId,
      amount: 12000,
      currency: "USD",
      type: "ach",
      status: "processing",
      initiated_at: relativeIso({ hours: 12 }),
      completed_at: null,
      metadata: {
        seeded: true,
        purpose: "reserve_top_up",
        initiated_by_user_id: seedUserId,
      },
    },
    {
      id: seedIds.payrollTransferId,
      from_account_id: seedIds.operatingAccountId,
      to_account_id: seedIds.payrollAccountId,
      amount: 8450.5,
      currency: "USD",
      type: "internal",
      status: "completed",
      initiated_at: relativeIso({ days: 1, hours: 4 }),
      completed_at: relativeIso({ days: 1, hours: 3, minutes: 55 }),
      metadata: {
        seeded: true,
        purpose: "weekly_payroll_prefund",
        initiated_by_user_id: seedUserId,
      },
    },
    {
      id: seedIds.failedTransferId,
      from_account_id: seedIds.operatingAccountId,
      to_account_id: seedIds.reserveAccountId,
      amount: 250000,
      currency: "USD",
      type: "wire",
      status: "failed",
      initiated_at: relativeIso({ hours: 6 }),
      completed_at: relativeIso({ hours: 5, minutes: 50 }),
      metadata: {
        seeded: true,
        purpose: "same_day_wire_attempt",
        failure_reason: "beneficiary_screening_hold",
        initiated_by_user_id: seedUserId,
      },
    },
  ];

  const transactions = [
    {
      id: seedIds.inboundTransactionId,
      account_id: seedIds.operatingAccountId,
      type: "credit",
      amount: 50000,
      currency: "USD",
      status: "completed",
      description: "Reserve liquidity moved into operating",
      metadata: {
        seeded: true,
        transfer_id: seedIds.inboundTransferId,
        counterparty: "Orbit Internal Treasury",
        category: "treasury",
      },
      is_sandbox: true,
      created_at: relativeIso({ days: 2, hours: 2, minutes: 42 }),
    },
    {
      id: seedIds.reserveTransactionId,
      account_id: seedIds.reserveAccountId,
      type: "debit",
      amount: 12000,
      currency: "USD",
      status: "pending",
      description: "ACH reserve contribution in flight",
      metadata: {
        seeded: true,
        transfer_id: seedIds.reserveTransferId,
        counterparty: "Orbit Reserve",
        category: "reserve_management",
      },
      is_sandbox: true,
      created_at: relativeIso({ hours: 12 }),
    },
    {
      id: seedIds.payrollTransactionId,
      account_id: seedIds.payrollAccountId,
      type: "credit",
      amount: 8450.5,
      currency: "USD",
      status: "completed",
      description: "Payroll float prefund",
      metadata: {
        seeded: true,
        transfer_id: seedIds.payrollTransferId,
        counterparty: "Orbit Operating",
        category: "payroll",
      },
      is_sandbox: true,
      created_at: relativeIso({ days: 1, hours: 3, minutes: 55 }),
    },
    {
      id: seedIds.cardSpendTransactionId,
      account_id: seedIds.operatingAccountId,
      type: "debit",
      amount: 1820.45,
      currency: "USD",
      status: "completed",
      description: "Cloud infrastructure spend",
      metadata: {
        seeded: true,
        card_id: seedIds.primaryCardId,
        merchant: "AWS Marketplace",
        category: "software",
      },
      is_sandbox: true,
      created_at: relativeIso({ hours: 20 }),
    },
    {
      id: seedIds.feeTransactionId,
      account_id: seedIds.operatingAccountId,
      type: "fee",
      amount: 299,
      currency: "USD",
      status: "completed",
      description: "Enterprise platform fee",
      metadata: {
        seeded: true,
        fee_schedule_id: seedIds.monthlyFeeId,
        billing_period: "2026-03",
      },
      is_sandbox: true,
      created_at: relativeIso({ days: 14 }),
    },
    {
      id: seedIds.reversedTransactionId,
      account_id: seedIds.operatingAccountId,
      type: "reversal",
      amount: 245.32,
      currency: "USD",
      status: "reversed",
      description: "Vendor duplicate charge reversed",
      metadata: {
        seeded: true,
        merchant: "Acme Travel",
        category: "travel",
      },
      is_sandbox: true,
      created_at: relativeIso({ days: 5 }),
    },
    {
      id: seedIds.wireInTransactionId,
      account_id: seedIds.operatingAccountId,
      type: "credit",
      amount: 78250,
      currency: "USD",
      status: "completed",
      description: "Investor capital wire received",
      metadata: {
        seeded: true,
        counterparty: "North River Ventures",
        category: "capital_inflow",
      },
      is_sandbox: true,
      created_at: relativeIso({ days: 9 }),
    },
    {
      id: seedIds.vendorPayoutTransactionId,
      account_id: seedIds.operatingAccountId,
      type: "debit",
      amount: 6240.8,
      currency: "USD",
      status: "completed",
      description: "Core banking vendor payout",
      metadata: {
        seeded: true,
        counterparty: "Atlas Core Systems",
        category: "vendor_payout",
      },
      is_sandbox: true,
      created_at: relativeIso({ days: 4, hours: 6 }),
    },
    {
      id: seedIds.travelCardTransactionId,
      account_id: seedIds.operatingAccountId,
      type: "debit",
      amount: 412.67,
      currency: "USD",
      status: "completed",
      description: "Executive travel booking",
      metadata: {
        seeded: true,
        card_id: seedIds.travelCardId,
        merchant: "SkyJet Travel",
        counterparty: "SkyJet Travel",
        category: "travel",
      },
      is_sandbox: true,
      created_at: relativeIso({ days: 3, hours: 8 }),
    },
  ];

  const cards = [
    {
      id: seedIds.primaryCardId,
      account_id: seedIds.operatingAccountId,
      card_number_last4: "9481",
      card_token: "orbit-seed-card-token-primary",
      type: "virtual",
      status: "active",
      spending_limits: {
        daily_limit: 5000,
        per_transaction_limit: 2500,
        blocked_merchant_categories: [],
      },
      expiry_month: 12,
      expiry_year: 2030,
      created_at: relativeIso({ days: 21 }),
    },
    {
      id: seedIds.travelCardId,
      account_id: seedIds.operatingAccountId,
      card_number_last4: "2257",
      card_token: "orbit-seed-card-token-travel",
      type: "virtual",
      status: "frozen",
      spending_limits: {
        daily_limit: 1500,
        per_transaction_limit: 800,
        blocked_merchant_categories: ["gambling", "cash_advance"],
      },
      expiry_month: 7,
      expiry_year: 2029,
      created_at: relativeIso({ days: 11 }),
    },
    {
      id: seedIds.opsCardId,
      account_id: seedIds.operatingAccountId,
      card_number_last4: "7714",
      card_token: "orbit-seed-card-token-ops",
      type: "virtual",
      status: "active",
      spending_limits: {
        daily_limit: 2000,
        per_transaction_limit: 1000,
        blocked_merchant_categories: ["gambling", "cash_advance"],
      },
      expiry_month: 9,
      expiry_year: 2029,
      created_at: relativeIso({ days: 9 }),
    },
    {
      id: seedIds.vendorCardId,
      account_id: seedIds.operatingAccountId,
      card_number_last4: "4832",
      card_token: "orbit-seed-card-token-vendor",
      type: "virtual",
      status: "active",
      spending_limits: {
        daily_limit: 7500,
        per_transaction_limit: 5000,
        blocked_merchant_categories: [],
      },
      expiry_month: 4,
      expiry_year: 2031,
      created_at: relativeIso({ days: 7 }),
    },
    {
      id: seedIds.marketingCardId,
      account_id: seedIds.operatingAccountId,
      card_number_last4: "1195",
      card_token: "orbit-seed-card-token-marketing",
      type: "virtual",
      status: "cancelled",
      spending_limits: {
        daily_limit: 3000,
        per_transaction_limit: 1500,
        blocked_merchant_categories: ["cash_advance"],
      },
      expiry_month: 2,
      expiry_year: 2028,
      created_at: relativeIso({ days: 42 }),
    },
    {
      id: seedIds.backupCardId,
      account_id: seedIds.payrollAccountId,
      card_number_last4: "6608",
      card_token: "orbit-seed-card-token-backup",
      type: "virtual",
      status: "active",
      spending_limits: {
        daily_limit: 1200,
        per_transaction_limit: 600,
        blocked_merchant_categories: [],
      },
      expiry_month: 6,
      expiry_year: 2030,
      created_at: relativeIso({ days: 5 }),
    },
  ];

  const limits = [
    {
      id: seedIds.operatingLimitId,
      entity_type: "account",
      entity_id: seedIds.operatingAccountId,
      daily_limit: 150000,
      monthly_limit: 1500000,
      per_transaction_limit: 50000,
      allowed_merchant_categories: [],
      blocked_merchant_categories: [],
      updated_at: relativeIso({ hours: 9 }),
    },
    {
      id: seedIds.reserveLimitId,
      entity_type: "account",
      entity_id: seedIds.reserveAccountId,
      daily_limit: 250000,
      monthly_limit: 3000000,
      per_transaction_limit: 150000,
      allowed_merchant_categories: [],
      blocked_merchant_categories: [],
      updated_at: relativeIso({ days: 3 }),
    },
    {
      id: seedIds.cardLimitId,
      entity_type: "card",
      entity_id: seedIds.primaryCardId,
      daily_limit: 5000,
      monthly_limit: 50000,
      per_transaction_limit: 2500,
      allowed_merchant_categories: ["software", "travel", "office_supplies"],
      blocked_merchant_categories: ["gambling"],
      updated_at: relativeIso({ hours: 20 }),
    },
  ];

  const beneficiaries = [
    {
      id: seedIds.beneficiaryOneId,
      user_id: seedUserId,
      name: "Northstar Payroll Services",
      routing_number: "026009593",
      account_number_hash: digestValue("000123450987"),
      bank_name: "Bank of America",
      created_at: relativeIso({ days: 32 }),
    },
    {
      id: seedIds.beneficiaryTwoId,
      user_id: seedUserId,
      name: "Atlas Cloud Hosting",
      routing_number: "021000021",
      account_number_hash: digestValue("998877665544"),
      bank_name: "JPMorgan Chase",
      created_at: relativeIso({ days: 15 }),
    },
  ];

  const documents = [
    {
      id: seedIds.verifiedDocumentId,
      user_id: seedUserId,
      doc_type: "passport",
      status: "verified",
      storage_path: null,
      rejection_reason: null,
      submitted_at: relativeIso({ days: 40 }),
      verified_at: relativeIso({ days: 38 }),
    },
    {
      id: seedIds.reviewDocumentId,
      user_id: seedUserId,
      doc_type: "utility_bill",
      status: "under_review",
      storage_path: null,
      rejection_reason: null,
      submitted_at: relativeIso({ days: 1, hours: 6 }),
      verified_at: null,
    },
    {
      id: seedIds.rejectedDocumentId,
      user_id: seedUserId,
      doc_type: "business_registration",
      status: "rejected",
      storage_path: null,
      rejection_reason: "Document scan was incomplete.",
      submitted_at: relativeIso({ days: 12 }),
      verified_at: null,
    },
  ];

  const complianceRecords = [
    {
      id: seedIds.accountComplianceId,
      entity_type: "account",
      entity_id: seedIds.operatingAccountId,
      action: "periodic_account_review",
      performed_by: seedUserId,
      notes: "Operational account review completed with no action required.",
      metadata: { seeded: true, disposition: "clear", risk_score: 12 },
      created_at: relativeIso({ days: 7 }),
    },
    {
      id: seedIds.transactionComplianceId,
      entity_type: "transaction",
      entity_id: seedIds.failedTransferId,
      action: "wire_screening_escalation",
      performed_by: seedUserId,
      notes: "Wire transfer failed due to beneficiary screening escalation.",
      metadata: { seeded: true, disposition: "monitor", risk_score: 71 },
      created_at: relativeIso({ hours: 5, minutes: 45 }),
    },
    {
      id: seedIds.userComplianceId,
      entity_type: "user",
      entity_id: seedUserId,
      action: "kyc_refresh_requested",
      performed_by: seedUserId,
      notes: "Address confirmation requested after recent profile change.",
      metadata: { seeded: true, disposition: "monitor", risk_score: 41 },
      created_at: relativeIso({ days: 1, hours: 5 }),
    },
  ];

  const fraudAlerts = [
    {
      id: seedIds.highRiskFraudId,
      account_id: seedIds.operatingAccountId,
      transaction_id: seedIds.cardSpendTransactionId,
      risk_score: 86.5,
      reason: "Card velocity spike detected across cloud vendors.",
      status: "investigating",
      created_at: relativeIso({ hours: 18 }),
      resolved_at: null,
    },
    {
      id: seedIds.resolvedFraudId,
      account_id: seedIds.operatingAccountId,
      transaction_id: seedIds.reversedTransactionId,
      risk_score: 43.2,
      reason: "Duplicate vendor authorization reversed automatically.",
      status: "resolved",
      created_at: relativeIso({ days: 5 }),
      resolved_at: relativeIso({ days: 4, hours: 20 }),
    },
  ];

  const webhooks = [
    {
      id: seedIds.primaryWebhookId,
      partner_id: seedIds.partnerId,
      url: "https://example-partner.test/webhooks/banking",
      events: ["transfer.settled", "card.issued", "kyc.updated"],
      secret_hash: digestValue(primaryWebhookSecret),
      is_active: true,
      last_triggered_at: relativeIso({ minutes: 25 }),
      created_at: relativeIso({ days: 19 }),
    },
    {
      id: seedIds.opsWebhookId,
      partner_id: seedIds.partnerId,
      url: "https://ops.orbit.example/hooks/compliance",
      events: ["fraud.alerted", "kyc.updated"],
      secret_hash: digestValue(opsWebhookSecret),
      is_active: true,
      last_triggered_at: relativeIso({ hours: 7 }),
      created_at: relativeIso({ days: 10 }),
    },
  ];

  const webhookEvents = [
    {
      id: seedIds.webhookEventOneId,
      webhook_id: seedIds.primaryWebhookId,
      event_type: "transfer.settled",
      payload: {
        transfer_id: seedIds.payrollTransferId,
        amount: 8450.5,
        currency: "USD",
      },
      response_status: 200,
      attempts: 1,
      delivered_at: relativeIso({ days: 1, hours: 3, minutes: 54 }),
      created_at: relativeIso({ days: 1, hours: 3, minutes: 55 }),
    },
    {
      id: seedIds.webhookEventTwoId,
      webhook_id: seedIds.opsWebhookId,
      event_type: "fraud.alerted",
      payload: {
        fraud_alert_id: seedIds.highRiskFraudId,
        risk_score: 86.5,
      },
      response_status: 202,
      attempts: 2,
      delivered_at: relativeIso({ hours: 18, minutes: 10 }),
      created_at: relativeIso({ hours: 18, minutes: 12 }),
    },
    {
      id: seedIds.webhookEventThreeId,
      webhook_id: seedIds.primaryWebhookId,
      event_type: "kyc.updated",
      payload: {
        document_id: seedIds.reviewDocumentId,
        status: "under_review",
      },
      response_status: 200,
      attempts: 1,
      delivered_at: relativeIso({ days: 1, hours: 5, minutes: 50 }),
      created_at: relativeIso({ days: 1, hours: 5, minutes: 51 }),
    },
  ];

  const notifications = [
    {
      id: seedIds.notificationOneId,
      user_id: seedUserId,
      type: "transfer",
      title: "Payroll prefund settled",
      message: "Internal transfer to the payroll account settled successfully.",
      read: false,
      metadata: { transfer_id: seedIds.payrollTransferId, seeded: true },
      created_at: relativeIso({ days: 1, hours: 3, minutes: 54 }),
    },
    {
      id: seedIds.notificationTwoId,
      user_id: seedUserId,
      type: "fraud_alert",
      title: "Card velocity review opened",
      message: "A high-risk fraud alert requires investigation on the operating account.",
      read: false,
      metadata: { fraud_alert_id: seedIds.highRiskFraudId, seeded: true },
      created_at: relativeIso({ hours: 18 }),
    },
    {
      id: seedIds.notificationThreeId,
      user_id: seedUserId,
      type: "kyc_update",
      title: "Utility bill under review",
      message: "The recently uploaded proof of address is awaiting compliance review.",
      read: false,
      metadata: { document_id: seedIds.reviewDocumentId, seeded: true },
      created_at: relativeIso({ days: 1, hours: 6 }),
    },
    {
      id: seedIds.notificationFourId,
      user_id: seedUserId,
      type: "card_freeze",
      title: "Travel card frozen",
      message: "The travel virtual card was frozen after a merchant risk rule matched.",
      read: true,
      metadata: { card_id: seedIds.travelCardId, seeded: true },
      created_at: relativeIso({ days: 3 }),
    },
    {
      id: seedIds.notificationFiveId,
      user_id: seedUserId,
      type: "transaction",
      title: "Monthly platform fee posted",
      message: "March enterprise platform fee was posted to the operating account.",
      read: true,
      metadata: { transaction_id: seedIds.feeTransactionId, seeded: true },
      created_at: relativeIso({ days: 14 }),
    },
  ];

  const statements = [
    {
      id: seedIds.febStatementId,
      account_id: seedIds.operatingAccountId,
      period_start: "2026-02-01T00:00:00.000Z",
      period_end: "2026-02-28T23:59:59.000Z",
      storage_path: "statements/orbit/2026-02-operating.pdf",
      generated_at: "2026-03-01T04:00:00.000Z",
    },
    {
      id: seedIds.marStatementId,
      account_id: seedIds.operatingAccountId,
      period_start: "2026-03-01T00:00:00.000Z",
      period_end: "2026-03-31T23:59:59.000Z",
      storage_path: "statements/orbit/2026-03-operating.pdf",
      generated_at: relativeIso({ hours: 2 }),
    },
  ];

  const apiUsage = [
    {
      id: seedIds.apiUsageOneId,
      partner_id: seedIds.partnerId,
      endpoint: "/api/accounts",
      method: "GET",
      response_status: 200,
      response_time_ms: 84,
      created_at: relativeIso({ minutes: 11 }),
    },
    {
      id: seedIds.apiUsageTwoId,
      partner_id: seedIds.partnerId,
      endpoint: "/api/transfers",
      method: "POST",
      response_status: 201,
      response_time_ms: 143,
      created_at: relativeIso({ minutes: 34 }),
    },
    {
      id: seedIds.apiUsageThreeId,
      partner_id: seedIds.partnerId,
      endpoint: "/api/cards",
      method: "POST",
      response_status: 201,
      response_time_ms: 167,
      created_at: relativeIso({ hours: 4 }),
    },
    {
      id: seedIds.apiUsageFourId,
      partner_id: seedIds.partnerId,
      endpoint: "/api/kyc",
      method: "POST",
      response_status: 202,
      response_time_ms: 224,
      created_at: relativeIso({ days: 1 }),
    },
    {
      id: seedIds.apiUsageFiveId,
      partner_id: seedIds.partnerId,
      endpoint: "/api/analytics",
      method: "GET",
      response_status: 200,
      response_time_ms: 62,
      created_at: relativeIso({ minutes: 3 }),
    },
  ];

  const auditLog = [
    {
      id: seedIds.auditOneId,
      table_name: "transfers",
      record_id: seedIds.payrollTransferId,
      operation: "INSERT",
      old_data: null,
      new_data: { status: "completed", amount: 8450.5 },
      performed_by: seedUserId,
      ip_address: "10.10.0.14",
      created_at: relativeIso({ days: 1, hours: 3, minutes: 55 }),
    },
    {
      id: seedIds.auditTwoId,
      table_name: "cards",
      record_id: seedIds.travelCardId,
      operation: "UPDATE",
      old_data: { status: "active" },
      new_data: { status: "frozen" },
      performed_by: seedUserId,
      ip_address: "10.10.0.21",
      created_at: relativeIso({ days: 3 }),
    },
    {
      id: seedIds.auditThreeId,
      table_name: "kyc_documents",
      record_id: seedIds.reviewDocumentId,
      operation: "INSERT",
      old_data: null,
      new_data: { status: "under_review", doc_type: "utility_bill" },
      performed_by: seedUserId,
      ip_address: "10.10.0.18",
      created_at: relativeIso({ days: 1, hours: 6 }),
    },
    {
      id: seedIds.auditFourId,
      table_name: "fraud_alerts",
      record_id: seedIds.highRiskFraudId,
      operation: "INSERT",
      old_data: null,
      new_data: { status: "investigating", risk_score: 86.5 },
      performed_by: seedUserId,
      ip_address: "10.10.0.29",
      created_at: relativeIso({ hours: 18 }),
    },
  ];

  await runQuery(supabase.from("partners").upsert(partner, { onConflict: "id" }));
  await runQuery(supabase.from("users").upsert(user, { onConflict: "id" }));
  await upsertRows("accounts", accounts);
  await upsertRows("balances", balances, "account_id");
  await upsertRows("api_keys", apiKeys, "key_hash");
  await upsertRows("fee_schedules", feeSchedules);
  await upsertRows("transfers", transfers);
  await upsertRows("transactions", transactions);
  await upsertRows("cards", cards);
  await upsertRows("limits", limits);
  await upsertRows("beneficiaries", beneficiaries);
  await upsertRows("kyc_documents", documents);
  await upsertRows("compliance_records", complianceRecords);
  await upsertRows("fraud_alerts", fraudAlerts);
  await upsertRows("webhooks", webhooks);
  await upsertRows("webhook_events", webhookEvents);
  await upsertRows("notifications", notifications);
  await upsertRows("statements", statements);
  await upsertRows("api_usage", apiUsage);
  await upsertRows("audit_log", auditLog);
}

async function main() {
  const seedUser = await findOrCreateSeedUser();
  await syncSeedUserAuthClaims(seedUser.id);
  await upsertPartnerWorkspace(seedUser.id);

  console.log("Supabase seed complete.");
  console.log(`Seed auth user: ${seedEmail}`);
  console.log(`Seed auth password: ${seedPassword}`);
  console.log(`Seed API key: ${seedRawApiKey}`);
}

main().catch((error) => {
  console.error("Supabase seed failed.");
  console.error(error);
  process.exit(1);
});
