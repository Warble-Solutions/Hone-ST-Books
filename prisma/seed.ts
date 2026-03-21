import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Book data
const BOOKS_SEED = [
  {
    slug: "bhagavad-gita-hindi",
    title: "Bhagavad Gita - A Story",
    titleHindi: "भगवद्गीता - एक कहानी",
    description:
      "Discover the timeless wisdom of the Bhagavad Gita through an engaging narrative in Hindi. This unique retelling brings ancient teachings to life, making them accessible and relevant for modern readers.",
    price: 19900,
    coverImage: "/covers/bhagavad-gita-hindi.jpg",
    pdfFilename: "bhagavad-gita-hindi.pdf",
    language: "hi",
  },
  {
    slug: "bhagavad-gita-english",
    title: "Bhagavad Gita - A Story",
    titleHindi: null,
    description:
      "Experience the profound teachings of the Bhagavad Gita reimagined as a captivating story in English. A fresh perspective on ancient wisdom that speaks to the challenges of contemporary life.",
    price: 19900,
    coverImage: "/covers/bhagavad-gita-english.jpg",
    pdfFilename: "bhagavad-gita-english.pdf",
    language: "en",
  },
  {
    slug: "corporate-bhagavad-gita",
    title: "The Corporate Bhagavad Gita",
    titleHindi: null,
    description:
      "Bridge ancient wisdom and modern business with The Corporate Bhagavad Gita. Learn how timeless teachings from the Gita can transform your leadership style, decision-making, and professional growth.",
    price: 19900,
    coverImage: "/covers/corporate-bhagavad-gita.jpg",
    pdfFilename: "corporate-bhagavad-gita.pdf",
    language: "en",
  },
];

// Parse legacy SQL to extract users
function parseLegacyUsers(sqlContent: string) {
  const users: Array<{
    email: string;
    name: string;
    phone: string;
    purchasedHindi: boolean;
    purchasedEnglish: boolean;
    purchasedCorporate: boolean;
  }> = [];

  // Match INSERT INTO `users` ... VALUES (...)
  const insertRegex =
    /INSERT INTO `users`.*?VALUES\s*([\s\S]*?)(?=;\s*(?:INSERT|--|CREATE|ALTER|$))/gi;
  let match;

  while ((match = insertRegex.exec(sqlContent)) !== null) {
    const valuesBlock = match[1];
    // Match individual row tuples
    const rowRegex =
      /\((\d+),\s*'([^']*)',\s*'([^']*)',\s*(?:NULL|'[^']*'),\s*'[^']*',\s*(?:NULL|'[^']*'),\s*(?:NULL|'[^']*'),\s*(?:NULL|'[^']*'),\s*'([^']*)',\s*(\d+),\s*(\d+),\s*(\d+)\)/g;
    let rowMatch;

    while ((rowMatch = rowRegex.exec(valuesBlock)) !== null) {
      users.push({
        name: rowMatch[2],
        email: rowMatch[3].toLowerCase(),
        phone: rowMatch[4],
        purchasedHindi: rowMatch[5] === "1",
        purchasedEnglish: rowMatch[6] === "1",
        purchasedCorporate: rowMatch[7] === "1",
      });
    }
  }

  return users;
}

async function main() {
  console.log("🌱 Starting seed...");

  // Seed books
  console.log("📚 Seeding books...");
  for (const book of BOOKS_SEED) {
    await prisma.book.upsert({
      where: { slug: book.slug },
      create: book,
      update: book,
    });
  }
  console.log(`   ✅ ${BOOKS_SEED.length} books seeded`);

  // Seed legacy users from SQL dump
  const sqlPath = path.join(
    process.cwd(),
    "..",
    "u391665738_honestsolution.sql"
  );

  if (fs.existsSync(sqlPath)) {
    console.log("👥 Parsing legacy SQL dump...");
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");
    const legacyUsers = parseLegacyUsers(sqlContent);

    console.log(`   Found ${legacyUsers.length} legacy users`);

    let migrated = 0;
    let withPurchases = 0;

    for (const user of legacyUsers) {
      const hasPurchase =
        user.purchasedHindi ||
        user.purchasedEnglish ||
        user.purchasedCorporate;

      if (hasPurchase) {
        withPurchases++;
      }

      await prisma.legacyUser.upsert({
        where: { email: user.email },
        create: {
          email: user.email,
          name: user.name,
          phone: user.phone,
          purchasedHindi: user.purchasedHindi,
          purchasedEnglish: user.purchasedEnglish,
          purchasedCorporate: user.purchasedCorporate,
        },
        update: {
          name: user.name,
          phone: user.phone,
          purchasedHindi: user.purchasedHindi,
          purchasedEnglish: user.purchasedEnglish,
          purchasedCorporate: user.purchasedCorporate,
        },
      });
      migrated++;
    }

    console.log(`   ✅ ${migrated} legacy users seeded`);
    console.log(`   📖 ${withPurchases} users with purchases`);
  } else {
    console.log(
      "⚠️  Legacy SQL file not found at:",
      sqlPath
    );
    console.log("   Skipping legacy user migration");
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
