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
  accountId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1002",
  balanceId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1003",
  apiKeyId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1004",
  notificationId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1005",
  webhookId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1006",
  complianceId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1007",
  transferId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1008",
  transactionId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1009",
  cardId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1010",
  documentId: "7f4e7f65-2f7b-4e98-a13f-8d4f2d7a1011",
};

async function runQuery(promise) {
  const { error } = await promise;
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
  const now = new Date().toISOString();
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

  const account = {
    id: seedIds.accountId,
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
  };

  const balance = {
    id: seedIds.balanceId,
    account_id: seedIds.accountId,
    available: 285400.12,
    pending: 12500.0,
    currency: "USD",
    updated_at: now,
  };

  const apiKey = {
    id: seedIds.apiKeyId,
    partner_id: seedIds.partnerId,
    name: seedApiKeyName,
    key_hash: digestValue(seedApiKey.rawKey),
    permissions: seedApiKeyPermissions,
    last_used_at: null,
    expires_at: null,
    is_active: true,
    created_at: now,
    metadata: {
      prefix: seedApiKey.prefix,
      seeded_from: process.env.SEED_PARTNER_API_KEY ? "env" : "default",
      seeded_by: "scripts/seed-supabase.mjs",
    },
  };

  const notification = {
    id: seedIds.notificationId,
    user_id: seedUserId,
    type: "transfer",
    title: "Seed data loaded",
    message:
      "Supabase seed data has been provisioned for the Orbit Treasury workspace.",
    read: false,
    metadata: { seeded: true },
    created_at: now,
  };

  const webhook = {
    id: seedIds.webhookId,
    partner_id: seedIds.partnerId,
    url: "https://example-partner.test/webhooks/banking",
    events: ["transfer.settled", "card.issued", "kyc.updated"],
    secret_hash: digestValue("whsec_seed_orbit_demo_secret"),
    is_active: true,
    last_triggered_at: null,
    created_at: now,
  };

  const complianceRecord = {
    id: seedIds.complianceId,
    entity_type: "account",
    entity_id: seedIds.accountId,
    action: "transaction_monitoring_clear",
    performed_by: seedUserId,
    notes: "Seeded baseline monitoring state.",
    metadata: { seeded: true, risk_score: 12 },
    created_at: now,
  };

  const transfer = {
    id: seedIds.transferId,
    from_account_id: seedIds.accountId,
    to_account_id: seedIds.accountId,
    amount: 0.01,
    currency: "USD",
    type: "internal",
    status: "completed",
    initiated_at: now,
    completed_at: now,
    metadata: {
      seeded: true,
      external_reference: "seed-internal-transfer",
      initiated_by_user_id: seedUserId,
    },
  };

  const transaction = {
    id: seedIds.transactionId,
    account_id: seedIds.accountId,
    type: "credit",
    amount: 0.01,
    currency: "USD",
    status: "completed",
    description: "Initial seed deposit marker",
    metadata: {
      seeded: true,
      transfer_id: seedIds.transferId,
      rail: "internal",
      counterparty: "EmbeddyFi Seed",
    },
    is_sandbox: true,
    created_at: now,
  };

  const card = {
    id: seedIds.cardId,
    account_id: seedIds.accountId,
    card_number_last4: "9481",
    card_token: "orbit-seed-card-token",
    type: "virtual",
    status: "active",
    spending_limits: {
      daily_limit: 5000,
      per_transaction_limit: 2500,
      blocked_merchant_categories: [],
    },
    expiry_month: 12,
    expiry_year: 2030,
    created_at: now,
  };

  const document = {
    id: seedIds.documentId,
    user_id: seedUserId,
    doc_type: "passport",
    status: "verified",
    storage_path: null,
    rejection_reason: null,
    submitted_at: now,
    verified_at: now,
  };

  await runQuery(supabase.from("partners").upsert(partner, { onConflict: "id" }));
  await runQuery(supabase.from("users").upsert(user, { onConflict: "id" }));
  await runQuery(supabase.from("accounts").upsert(account, { onConflict: "id" }));
  await runQuery(supabase.from("balances").upsert(balance, { onConflict: "id" }));
  await runQuery(supabase.from("api_keys").upsert(apiKey, { onConflict: "id" }));
  await runQuery(
    supabase.from("notifications").upsert(notification, { onConflict: "id" }),
  );
  await runQuery(supabase.from("webhooks").upsert(webhook, { onConflict: "id" }));
  await runQuery(
    supabase
      .from("compliance_records")
      .upsert(complianceRecord, { onConflict: "id" }),
  );
  await runQuery(supabase.from("transfers").upsert(transfer, { onConflict: "id" }));
  await runQuery(
    supabase.from("transactions").upsert(transaction, { onConflict: "id" }),
  );
  await runQuery(supabase.from("cards").upsert(card, { onConflict: "id" }));
  await runQuery(
    supabase.from("kyc_documents").upsert(document, { onConflict: "id" }),
  );
}

async function main() {
  const seedUser = await findOrCreateSeedUser();
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
