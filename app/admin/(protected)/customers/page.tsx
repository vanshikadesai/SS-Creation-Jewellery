import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR, formatDate } from "@/lib/format";

export const metadata = { title: "Customers | Admin | SS Creation Jewellery" };
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const q = searchParams.q?.trim();

  const users = await prisma.user.findMany({
    where: {
      role: { name: "CUSTOMER" },
      ...(q
        ? {
            OR: [
              { fullName: { contains: q } },
              { email: { contains: q } },
              { mobile: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      mobile: true,
      status: true,
      createdAt: true,
      orders: { select: { totalAmount: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl md:text-3xl mb-6">Customers</h1>

      <form className="mb-6" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name, email or mobile…"
          className="w-full max-w-sm border border-border px-3 py-2.5 text-sm"
        />
      </form>

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide2 text-charcoal/50">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Mobile</th>
              <th className="p-4">Registered</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Total Spent</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-charcoal/50">
                  No customers found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF7F0]">
                  <td className="p-4">
                    <Link href={`/admin/customers/${u.id}`} className="font-medium hover:text-champagne-dark">
                      {u.fullName}
                    </Link>
                  </td>
                  <td className="p-4 text-charcoal/70">{u.email}</td>
                  <td className="p-4 text-charcoal/70">{u.mobile}</td>
                  <td className="p-4 text-charcoal/50 text-xs">{formatDate(u.createdAt)}</td>
                  <td className="p-4">{u.orders.length}</td>
                  <td className="p-4">
                    {formatINR(u.orders.reduce((s, o) => s + Number(o.totalAmount), 0))}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs uppercase tracking-wide2 px-2 py-1 ${
                        u.status === "ACTIVE" ? "bg-emerald/10 text-emerald" : "bg-rosedust/10 text-rosedust"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
