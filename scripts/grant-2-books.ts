import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "mayankmras20@gmail.com";
  
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, clerkId: `demo_${Date.now()}`, name: "Mayank" },
    });
    console.log("Created user:", user.id);
  }

  const books = await prisma.book.findMany();
  // Pick Hindi and Corporate editions
  const picks = [books[0], books[2]];

  for (const book of picks) {
    const existing = await prisma.purchase.findUnique({
      where: { userId_bookId: { userId: user.id, bookId: book.id } },
    });
    if (existing) {
      console.log(`Already owns: ${book.title}`);
      continue;
    }
    await prisma.purchase.create({ data: { userId: user.id, bookId: book.id } });
    console.log(`Granted: ${book.title}`);
  }

  await prisma.$disconnect();
}

main();
