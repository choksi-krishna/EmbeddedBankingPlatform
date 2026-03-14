export function formatCurrency(amount: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function parseCents(amount: number | string) {
  const normalized = typeof amount === "string" ? Number(amount) : amount;
  return Math.round(normalized * 100);
}
