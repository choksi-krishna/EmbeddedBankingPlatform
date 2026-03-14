import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

import { loadProjectEnv, requireEnv } from "./lib/env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

loadProjectEnv(projectRoot);

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const seedEmail = process.env.SEED_PARTNER_ADMIN_EMAIL ?? "ops@orbit.example";
const seedPassword = process.env.SEED_PARTNER_ADMIN_PASSWORD ?? "OrbitDemo123!";
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
  const partner = {
    id: "partner-orbit",
    name: "Orbit Treasury",
    slug: "orbit-treasury",
    status: "active",
    tier: "enterprise",
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
  };

  const user = {
    id: seedUserId,
    partner_id: "partner-orbit",
    email: seedEmail,
    full_name: "Orbit Admin",
    role: "partner_admin",
    status: "active",
  };

  const account = {
    id: "acct-orbit-operating",
    partner_id: "partner-orbit",
    user_id: seedUserId,
    account_number: "100000013579",
    routing_number: "011000015",
    type: "operating",
    status: "active",
    nickname: "Primary Operating",
    currency: "USD",
  };

  const balance = {
    id: "bal-orbit-operating",
    partner_id: "partner-orbit",
    account_id: "acct-orbit-operating",
    available: 285400.12,
    pending: 12500,
    ledger: 297900.12,
    currency: "USD",
  };

  const apiKey = {
    id: "api-6001",
    partner_id: "partner-orbit",
    name: "Orbit Sandbox SDK",
    prefix: "orbitdemo01",
    key_hash: digestValue(seedRawApiKey),
    permissions: [
      "accounts:read",
      "transactions:read",
      "transfers:write",
      "webhooks:read",
    ],
    status: "active",
  };

  const notification = {
    id: "notif-7001",
    partner_id: "partner-orbit",
    type: "platform",
    title: "Seed data loaded",
    body: "Supabase seed data has been provisioned for the Orbit Treasury workspace.",
    severity: "info",
  };

  const webhook = {
    id: "wh-8001",
    partner_id: "partner-orbit",
    url: "https://example-partner.test/webhooks/banking",
    signing_secret: "whsec_seed_orbit_demo_secret",
    events: ["transfer.settled", "card.issued", "kyc.updated"],
    status: "active",
  };

  const complianceRecord = {
    id: "comp-9001",
    partner_id: "partner-orbit",
    user_id: seedUserId,
    account_id: "acct-orbit-operating",
    type: "transaction_monitoring",
    status: "clear",
    risk_score: 12,
    notes: "Seeded baseline monitoring state.",
  };

  const transfer = {
    id: "tr-1001",
    partner_id: "partner-orbit",
    source_account_id: "acct-orbit-operating",
    destination_account_id: "acct-orbit-operating",
    amount: 0.01,
    currency: "USD",
    rail: "book",
    status: "settled",
    external_reference: "seed-internal-transfer",
    initiated_by_user_id: seedUserId,
    settled_at: new Date().toISOString(),
  };

  const transaction = {
    id: "txn-2001",
    partner_id: "partner-orbit",
    account_id: "acct-orbit-operating",
    transfer_id: "tr-1001",
    direction: "credit",
    kind: "deposit",
    amount: 0.01,
    currency: "USD",
    status: "settled",
    description: "Initial seed deposit marker",
    counterparty: "EmbeddyFi Seed",
    metadata: { seeded: "true", rail: "book" },
  };

  const card = {
    id: "card-3001",
    partner_id: "partner-orbit",
    user_id: seedUserId,
    account_id: "acct-orbit-operating",
    cardholder_name: "Orbit Admin",
    brand: "Visa",
    last4: "9481",
    type: "virtual",
    status: "active",
    spending_limit: 5000,
    metadata: { seeded: "true", issuer: "EmbeddyFi Sandbox" },
  };

  const document = {
    id: "kyc-4001",
    partner_id: "partner-orbit",
    user_id: seedUserId,
    document_type: "passport",
    file_name: "orbit-admin-passport.pdf",
    storage_path: null,
    status: "approved",
    notes: "Seeded KYC document placeholder.",
    reviewed_at: new Date().toISOString(),
    reviewer_user_id: seedUserId,
  };

  await runQuery(supabase.from("partners").upsert(partner, { onConflict: "id" }));
  await runQuery(supabase.from("users").upsert(user, { onConflict: "id" }));
  await runQuery(supabase.from("accounts").upsert(account, { onConflict: "id" }));
  await runQuery(
    supabase
      .from("partners")
      .update({ settlement_account_id: account.id })
      .eq("id", partner.id),
  );
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
