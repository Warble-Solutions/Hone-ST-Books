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
      "भगवद्गीता को एक सरल और रोचक कहानी के रूप में प्रस्तुत करती यह पुस्तक मूल संस्कृत श्लोकों का हिंदी अनुवाद है — बिना किसी जटिल भाष्य के। लेखक प्रसून कुंडू ने गीता के ७०१ श्लोकों को एक प्रवाहमय कथा में पिरोया है ताकि हर पाठक इस अमूल्य ज्ञान से जुड़ सके। पुस्तक में मूल संस्कृत पाठ भी सम्मिलित है। बिक्री की ५०% आय बालिका शिक्षा और वंचित बच्चों की शिक्षा के लिए समर्पित है।",
    price: 20000,
    coverImage: "/covers/bhagavad-gita-hindi.png",
    pdfFilename: "bhagavad-gita-hindi.pdf",
    language: "hi",
  },
  {
    slug: "bhagavad-gita-english",
    title: "Bhagavad Gita - A Story",
    titleHindi: null,
    description:
      "Read the Bhagavad Gita the way it was meant to be experienced — as a flowing story, not a textbook. Author Prasun Kundu translates all 701 shlokas into simple English sentences that stay true to the original Sanskrit, free from complex commentaries. Whether you are new to the Gita or revisiting it, this book makes its timeless wisdom accessible to all. Includes the complete original Sanskrit text for reference. 50% of proceeds fund education for underprivileged children.",
    price: 20000,
    coverImage: "/covers/bhagavad-gita-english.png",
    pdfFilename: "bhagavad-gita-english.pdf",
    language: "en",
  },
  {
    slug: "corporate-bhagavad-gita",
    title: "The Corporate Bhagavad Gita",
    titleHindi: null,
    description:
      "Discover the Arjuna in You. This in-depth exploration of the eighteenth chapter of the Bhagavad Gita bridges 5,000-year-old wisdom with modern corporate challenges — from ownership and leadership to communication, integrity and excellence in execution. Author Prasun Kundu draws parallels between Arjuna's battlefield dilemma and today's professional struggles, providing a personalised guidebook for navigating the battlefield of life with clarity and purpose.",
    price: 20000,
    coverImage: "/covers/corporate-bhagavad-gita.png",
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
