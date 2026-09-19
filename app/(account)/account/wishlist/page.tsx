import { prisma } from "@/lib/prisma";
import { getServerAuthUser } from "@/lib/auth";
import WishlistClient from "@/components/wishlist/WishlistClient";

export const metadata = { title: "Your Wishlist | SS Creation Jewellery" };

export default async function WishlistPage() {
  // Auth already guaranteed by app/(account)/layout.tsx
  const authUser = getServerAuthUser()!;

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: authUser.userId },
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

  const items = (wishlist?.items ?? []).map((i) => ({
    id: i.id,
    product: {
      id: i.product.id,
      slug: i.product.slug,
      name: i.product.name,
      material: i.product.material,
      goldPurity: i.product.goldPurity,
      price: Number(i.product.price),
      originalPrice: Number(i.product.originalPrice),
      stockQuantity: i.product.stockQuantity,
      images: i.product.images,
      categorySlug: i.product.category.slug,
      gender: i.product.gender,
    },
  }));

  return (
    <div>
      <h1 className="text-2xl md:text-3xl mb-8">Your Wishlist</h1>
      <WishlistClient initialItems={items} />
    </div>
  );
}
