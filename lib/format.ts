// Shared display formatters — kept in one place so every Phase 2 page
// renders prices/dates identically to the Phase 1 homepage.

// Prisma Decimal fields arrive as decimal.js instances on the server.
// Rather than lean on ambiguous Number(obj) coercion, convert explicitly
// via toString() so behavior doesn't depend on decimal.js internals.
export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof (value as { toString?: () => string }).toString === "function") {
    return Number((value as { toString: () => string }).toString());
  }
  return Number(value);
}

export function formatINR(amount: unknown): string {
  const n = toNumber(amount);
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
