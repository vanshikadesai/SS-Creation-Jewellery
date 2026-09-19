import { prisma } from "@/lib/prisma";
import { getServerAuthUser } from "@/lib/auth";
import AddressesClient from "@/components/account/AddressesClient";

export const metadata = { title: "Your Addresses | SS Creation Jewellery" };

export default async function AddressesPage() {
  const authUser = getServerAuthUser()!;
  const addresses = await prisma.address.findMany({
    where: { userId: authUser.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return <AddressesClient initialAddresses={addresses} />;
}
