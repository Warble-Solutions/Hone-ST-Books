/**
 * Grant all book purchases to a user by email (for testing).
 *
 * Usage:
 *   npx tsx scripts/grant-access.ts user@example.com
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npx tsx scripts/grant-access.ts <email>");
    process.exit(1);
  }

  console.log(`🔍 Looking up user: ${email}\n`);

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log("  User not found in DB. They need to sign up via Clerk first.");
    console.log("  Sign up at the site, then run this script again.");
    process.exit(1);
  }

  console.log(`  ✅ Found user: ${user.name || user.email} (${user.id})\n`);

  // Get all books
  const books = await prisma.book.findMany();
  console.log(`📚 Granting access to ${books.length} books:\n`);

  for (const book of books) {
    const existing = await prisma.purchase.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: book.id,
        },
      },
    });

    if (existing) {
      console.log(`  ⏭️  ${book.title} — already owned`);
      continue;
    }

    await prisma.purchase.create({
      data: {
        userId: user.id,
        bookId: book.id,
      },
    });

    console.log(`  ✅ ${book.title} — access granted`);
  }

  console.log("\n🎉 Done! User can now read all books.");
}

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
