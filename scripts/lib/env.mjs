import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function parseEnvFile(filePath) {
  const values = {};
  const content = readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }

    const [key, ...rest] = line.split("=");
    const value = rest.join("=").trim();
    values[key.trim()] = value.replace(/^['"]|['"]$/g, "");
  }

  return values;
}

export function loadProjectEnv(projectRoot) {
  const envFiles = [".env", ".env.local"];

  for (const fileName of envFiles) {
    const filePath = path.join(projectRoot, fileName);
    if (!existsSync(filePath)) {
      continue;
    }

    const parsed = parseEnvFile(filePath);
    for (const [key, value] of Object.entries(parsed)) {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function requireAnyEnv(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }

  throw new Error(
    `Missing required environment variable. Set one of: ${names.join(", ")}`,
  );
}
