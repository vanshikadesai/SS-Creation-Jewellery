import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerAuthUser } from "@/lib/auth";
import { getCartForUser } from "@/lib/cart";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import FacetMark from "@/components/FacetMark";

export const metadata = { title: "Checkout | SS Creation Jewellery" };

export default async function CheckoutPage() {
  const authUser = getServerAuthUser();
  if (!authUser) redirect("/login?redirect=/checkout");

  const { items, summary } = await getCartForUser(authUser.userId);
  if (items.length === 0) redirect("/cart");

  const addresses = await prisma.address.findMany({
    where: { userId: authUser.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-10">
        <FacetMark className="w-10 h-6 mx-auto mb-4" />
        <p className="eyebrow mb-2">Checkout</p>
        <h1 className="text-3xl md:text-4xl">Complete Your Order</h1>
      </div>
      <CheckoutClient
        initialAddresses={addresses}
        summary={summary}
        itemCount={items.reduce((n, i) => n + i.quantity, 0)}
      />
    </div>
  );
}
