import { Prisma, Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface ProductQueryParams {
  q?: string | null;
  category?: string | null;
  collection?: string | null;
  material?: string | null;
  goldPurity?: string | null;
  hasDiamond?: string | null;
  gender?: string | null;
  occasion?: string | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  inStock?: string | null;
  featured?: string | null;
  newArrival?: string | null;
  bestSeller?: string | null;
  sort?: string | null;
  page?: string | null;
  pageSize?: string | null;
}

const GENDER_VALUES = new Set(["WOMEN", "MEN", "UNISEX", "KIDS"]);

export function buildProductWhere(sp: ProductQueryParams): Prisma.ProductWhereInput {
  const q = sp.q?.trim();
  const gender = sp.gender && GENDER_VALUES.has(sp.gender) ? sp.gender : undefined;

  return {
    status: "ACTIVE",
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { sku: { contains: q } },
            { category: { name: { contains: q } } },
            { collection: { name: { contains: q } } },
          ],
        }
      : {}),
    ...(sp.category ? { category: { slug: sp.category } } : {}),
    ...(sp.collection ? { collection: { slug: sp.collection } } : {}),
    ...(sp.material ? { material: { contains: sp.material } } : {}),
    ...(sp.goldPurity ? { goldPurity: sp.goldPurity } : {}),
    ...(sp.hasDiamond === "true" ? { diamondWeightCt: { gt: 0 } } : {}),
    ...(gender ? { gender: gender as Gender } : {}),
    ...(sp.occasion ? { occasion: { contains: sp.occasion } } : {}),
    ...(sp.inStock === "true" ? { stockQuantity: { gt: 0 } } : {}),
    ...(sp.featured === "true" ? { isFeatured: true } : {}),
    ...(sp.newArrival === "true" ? { isNewArrival: true } : {}),
    ...(sp.bestSeller === "true" ? { isBestSeller: true } : {}),
    ...(sp.minPrice || sp.maxPrice
      ? {
          price: {
            ...(sp.minPrice ? { gte: Number(sp.minPrice) } : {}),
            ...(sp.maxPrice ? { lte: Number(sp.maxPrice) } : {}),
          },
        }
      : {}),
  };
}

export function buildProductOrderBy(
  sort?: string | null
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_low":
      return { price: "asc" };
    case "price_high":
      return { price: "desc" };
    case "newest":
      return { createdAt: "desc" };
    case "popular":
    case "best_selling":
      return { isBestSeller: "desc" };
    default:
      return { isFeatured: "desc" };
  }
}

export async function queryProducts(sp: ProductQueryParams) {
  const where = buildProductWhere(sp);
  const orderBy = buildProductOrderBy(sp.sort);
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const pageSize = Math.min(48, Math.max(1, Number(sp.pageSize ?? 12) || 12));

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        category: true,
        collection: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

// ==========================================================
// ADMIN PRODUCT LISTING
// ==========================================================
// Mirrors queryProducts() above but is for /admin/products: every status
// (ACTIVE/DRAFT/ARCHIVED) is visible to the admin, not just ACTIVE, and
// it supports the admin table's own filters (status, low stock).

export interface AdminProductQueryParams {
  q?: string | null;
  category?: string | null;
  collection?: string | null;
  status?: string | null; // ACTIVE | DRAFT | ARCHIVED
  stock?: string | null; // "in" | "out" | "low"
  sort?: string | null;
  page?: string | null;
  pageSize?: string | null;
}

export async function queryAdminProducts(sp: AdminProductQueryParams) {
  const q = sp.q?.trim();
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(sp.pageSize ?? 20) || 20));

  const where: Prisma.ProductWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { sku: { contains: q } },
            { category: { name: { contains: q } } },
            { collection: { name: { contains: q } } },
          ],
        }
      : {}),
    ...(sp.category ? { category: { slug: sp.category } } : {}),
    ...(sp.collection ? { collection: { slug: sp.collection } } : {}),
    ...(sp.status ? { status: sp.status } : {}),
    ...(sp.stock === "out" ? { stockQuantity: { lte: 0 } } : {}),
    ...(sp.stock === "in" ? { stockQuantity: { gt: 0 } } : {}),
  };

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sp.sort === "price_low") orderBy = { price: "asc" };
  if (sp.sort === "price_high") orderBy = { price: "desc" };
  if (sp.sort === "name") orderBy = { name: "asc" };
  if (sp.sort === "stock_low") orderBy = { stockQuantity: "asc" };

  const [itemsRaw, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        category: true,
        collection: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  // "low" stock (0 < qty <= threshold) can't be expressed as a plain
  // Prisma where clause since it compares two columns on the same row,
  // so it's filtered in-memory after the page is fetched. Given admin
  // catalogs here are small, this keeps the query simple and correct.
  const items =
    sp.stock === "low"
      ? itemsRaw.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold)
      : itemsRaw;

  return {
    items,
    pagination: {
      page,
      pageSize,
      total: sp.stock === "low" ? items.length : total,
      totalPages: Math.max(1, Math.ceil((sp.stock === "low" ? items.length : total) / pageSize)),
    },
  };
}

// ==========================================================
// ADMIN DASHBOARD STATS
// ==========================================================

export async function getDashboardStats() {
  const [
    totalCustomers,
    totalProducts,
    totalOrders,
    revenueAgg,
    pendingOrders,
    confirmedOrders,
    deliveredOrders,
    cancelledOrders,
    lowStockProducts,
    recentOrders,
    recentCustomers,
    recentProducts,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { name: "CUSTOMER" } } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { orderStatus: { notIn: ["CANCELLED", "RETURNED"] } },
    }),
    prisma.order.count({ where: { orderStatus: "PENDING" } }),
    prisma.order.count({ where: { orderStatus: "CONFIRMED" } }),
    prisma.order.count({ where: { orderStatus: "DELIVERED" } }),
    prisma.order.count({ where: { orderStatus: "CANCELLED" } }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, category: true },
      orderBy: { stockQuantity: "asc" },
      take: 50,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { items: true },
    }),
    prisma.user.findMany({
      where: { role: { name: "CUSTOMER" } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, category: true },
    }),
  ]);

  const lowStock = lowStockProducts.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold
  );

  return {
    totalCustomers,
    totalProducts,
    totalOrders,
    totalRevenue: Number(revenueAgg._sum.totalAmount ?? 0),
    pendingOrders,
    confirmedOrders,
    deliveredOrders,
    cancelledOrders,
    lowStockProducts: lowStock,
    lowStockCount: lowStock.length,
    recentOrders,
    recentCustomers,
    recentProducts,
  };
}

// Filter-sidebar option lists, derived from real data already in MySQL —
// never hardcoded, so the Shop page only ever offers filters that
// actually match products in the database.
export async function getFilterOptions() {
  const [categories, collections, materials, goldPurities, occasions] =
    await Promise.all([
      prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      prisma.collection.findMany({ orderBy: { name: "asc" } }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        distinct: ["material"],
        select: { material: true },
        orderBy: { material: "asc" },
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", goldPurity: { not: null } },
        distinct: ["goldPurity"],
        select: { goldPurity: true },
        orderBy: { goldPurity: "asc" },
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", occasion: { not: null } },
        distinct: ["occasion"],
        select: { occasion: true },
        orderBy: { occasion: "asc" },
      }),
    ]);

  return {
    categories,
    collections,
    materials: materials.map((m) => m.material).filter(Boolean),
    goldPurities: goldPurities.map((g) => g.goldPurity as string).filter(Boolean),
    occasions: occasions.map((o) => o.occasion as string).filter(Boolean),
  };
}
