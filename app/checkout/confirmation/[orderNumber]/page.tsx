import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import OrderSummaryCard from "@/components/orders/OrderSummaryCard";
import FacetMark from "@/components/FacetMark";
import { CheckCircle2 } from "lucide-react";

export const metadata = { title: "Order Confirmed | SS Creation Jewellery" };

export default async function ConfirmationPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const authUser = getServerAuthUser();
  if (!authUser) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: true, payment: true },
  });

  if (!order || order.userId !== authUser.userId) notFound();

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-10">
        <FacetMark className="w-10 h-6 mx-auto mb-4" />
        <CheckCircle2 className="mx-auto text-emerald mb-4" size={40} />
        <h1 className="text-3xl md:text-4xl mb-2">Thank You, {order.customerName.split(" ")[0]}</h1>
        <p className="text-charcoal/60">
          Your order has been confirmed. A summary is below for your records.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <OrderSummaryCard order={order} />

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link href="/account/orders" className="btn-outline">
            View Your Orders
          </Link>
          <Link href="/shop" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
