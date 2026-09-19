import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerAuthUser } from "@/lib/auth";
import OrderSummaryCard from "@/components/orders/OrderSummaryCard";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Order Details | SS Creation Jewellery" };

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const authUser = getServerAuthUser()!;

  const order = await prisma.order.findUnique({
    where: { orderNumber: params.id },
    include: { items: true, payment: true },
  });

  if (!order || order.userId !== authUser.userId) notFound();

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-sm text-charcoal/60 hover:text-champagne-dark mb-6"
      >
        <ChevronLeft size={16} /> Back to Orders
      </Link>
      <OrderSummaryCard order={order} />
    </div>
  );
}
