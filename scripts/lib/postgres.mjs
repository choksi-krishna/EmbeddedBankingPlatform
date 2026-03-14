export function parseDatabaseUrl(connectionString) {
  const url = new URL(connectionString);

  return {
    host: url.hostname,
    port: url.port || "5432",
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "") || "postgres",
    sslmode: url.searchParams.get("sslmode") || undefined,
  };
}
