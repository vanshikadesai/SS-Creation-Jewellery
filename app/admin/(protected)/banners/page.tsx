import { prisma } from "@/lib/prisma";
import BannersClient from "@/components/admin/BannersClient";

export const metadata = { title: "Banners | Admin | SS Creation Jewellery" };
export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <h1 className="text-2xl md:text-3xl mb-6">Homepage Banners</h1>
      <BannersClient
        initialBanners={banners.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          imageUrl: b.imageUrl,
          linkUrl: b.linkUrl,
          displayOrder: b.displayOrder,
          isActive: b.isActive,
        }))}
      />
    </div>
  );
}
