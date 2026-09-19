// Run with: npm run seed  (this shells out to `tsx prisma/seed.ts`,
// already wired up in package.json's "prisma.seed" field, which is what
// `npx prisma db seed` / `npx prisma migrate dev` invoke automatically).
//
// This script is intentionally scoped to ONLY roles + the admin account.
// It does not touch products/categories/collections — if you already
// maintain separate seed data for those, keep that logic where it is and
// just make sure this file's `main()` runs as part of it (or keep them
// as two separate seed files you run back to back).

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth-core";

const prisma = new PrismaClient();

async function main() {
  // 1. Roles — both are required for the app's login/register flow to
  // work at all (User.roleId is a required foreign key to Role).
  const [, adminRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: "CUSTOMER" },
      update: {},
      create: { name: "CUSTOMER" },
    }),
    prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN" },
    }),
  ]);

  // 2. Admin account — sourced from .env, never hardcoded, so the real
  // password never lives in source control.
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminMobile = process.env.ADMIN_MOBILE || "9999999999";
  const adminName = process.env.ADMIN_NAME || "SS Creation Admin";

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in your .env file before seeding. " +
        "See .env.example for the expected variables."
    );
  }
  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  // Same hashPassword() the app uses at registration/login — not a
  // separately-implemented hash, so there's no risk of the seeded hash
  // being generated differently than what verifyPassword() expects.
  const passwordHash = await hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      // Re-running the seed (e.g. after rotating ADMIN_PASSWORD in .env)
      // updates the hash and guarantees the account is ADMIN + ACTIVE,
      // without touching fullName/mobile you may have customized since.
      passwordHash,
      roleId: adminRole.id,
      status: "ACTIVE",
    },
    create: {
      fullName: adminName,
      email: adminEmail,
      mobile: adminMobile,
      passwordHash,
      roleId: adminRole.id,
      status: "ACTIVE",
    },
  });

  console.log(`✔ Admin account ready: ${admin.email} (role: ADMIN, id: ${admin.id})`);
}

main()
  .catch((err) => {
    console.error("✖ Seed failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
