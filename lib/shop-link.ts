export function shopLink(params: Record<string, string | number | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") usp.set(k, String(v));
  }
  const qs = usp.toString();
  return `/shop${qs ? `?${qs}` : ""}`;
}
