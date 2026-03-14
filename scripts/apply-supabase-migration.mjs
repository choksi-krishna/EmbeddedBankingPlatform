import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadProjectEnv, requireEnv } from "./lib/env.mjs";
import { parseDatabaseUrl } from "./lib/postgres.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

loadProjectEnv(projectRoot);

const databaseUrl = requireEnv("DATABASE_URL");
const migrationsDir = path.join(projectRoot, "supabase", "migrations");
const migrationPaths = fs
  .readdirSync(migrationsDir)
  .filter((file) => /^\d{3}_.+\.sql$/.test(file))
  .sort((left, right) => left.localeCompare(right))
  .map((file) => path.join(migrationsDir, file));
const connection = parseDatabaseUrl(databaseUrl);

const env = {
  ...process.env,
  PGPASSWORD: connection.password,
};

if (connection.sslmode) {
  env.PGSSLMODE = connection.sslmode;
}

for (const migrationPath of migrationPaths) {
  const result = spawnSync(
    "psql",
    [
      "-v",
      "ON_ERROR_STOP=1",
      "-h",
      connection.host,
      "-p",
      connection.port,
      "-U",
      connection.user,
      "-d",
      connection.database,
      "-f",
      migrationPath,
    ],
    {
      cwd: projectRoot,
      env,
      stdio: "inherit",
    },
  );

  if (result.error) {
    throw result.error;
  }

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}
