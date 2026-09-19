import { prisma } from "@/lib/prisma";

export async function getCartForUser(userId: number) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
              category: { select: { slug: true } },
            },
          },
        },
      },
    },
  });

  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0
  );
  const discount = items.reduce(
    (sum, i) =>
      sum + (Number(i.product.originalPrice) - Number(i.product.price)) * i.quantity,
    0
  );
  const shipping = subtotal > 50000 || subtotal === 0 ? 0 : 500;
  // Labelled "GST" in the UI (checkout/cart summaries) — a flat 3% is
  // used as a placeholder rate consistent with typical GST on gold
  // jewellery in India; swap this for real slab-based GST logic if/when
  // that's finalised. Kept as `tax` internally so nothing that already
  // reads this field needs to change.
  const tax = Math.round(subtotal * 0.03);
  const total = subtotal + shipping + tax;

  return { items, summary: { subtotal, discount, shipping, tax, gstLabel: "GST (3%)", total } };
}
