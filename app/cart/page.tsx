import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth";
import { getCartForUser } from "@/lib/cart";
import CartClient from "@/components/cart/CartClient";
import FacetMark from "@/components/FacetMark";

export const metadata = { title: "Your Cart | SS Creation Jewellery" };

export default async function CartPage() {
  const authUser = getServerAuthUser();
  if (!authUser) redirect("/login?redirect=/cart");

  const { items, summary } = await getCartForUser(authUser.userId);

  const initialItems = items.map((i) => ({
    id: i.id,
    quantity: i.quantity,
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
    <div className="max-w-content mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-10">
        <FacetMark className="w-10 h-6 mx-auto mb-4" />
        <p className="eyebrow mb-2">Bag</p>
        <h1 className="text-3xl md:text-4xl">Your Cart</h1>
      </div>
      <CartClient initialItems={initialItems} initialSummary={summary} />
    </div>
  );
}
