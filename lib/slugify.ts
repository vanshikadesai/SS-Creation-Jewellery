export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Appends -2, -3, ... until `candidate` isn't in `existing`. Used whenever
 * an admin form derives a slug/SKU from a name and needs it guaranteed
 * unique before hitting the database's unique constraint.
 */
export function uniqueSlug(base: string, existing: Set<string>): string {
  const root = slugify(base) || "item";
  if (!existing.has(root)) return root;
  let i = 2;
  while (existing.has(`${root}-${i}`)) i++;
  return `${root}-${i}`;
}
