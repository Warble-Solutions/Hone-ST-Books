import "dotenv/config";
import { PrismaClient } from "@prisma/client";

async function main() {
  const email = process.argv[2] || "tusharchauhan3825@gmail.com";
  
  const res = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    }
  );

  const users = await res.json();

  if (!Array.isArray(users) || users.length === 0) {
    console.log("User not found in Clerk:", JSON.stringify(users, null, 2));
    return;
  }

  const clerkUser = users[0];
  console.log(`Clerk ID: ${clerkUser.id}`);

  const prisma = new PrismaClient();

  await prisma.user.updateMany({
    where: { email },
    data: { clerkId: clerkUser.id },
  });

  console.log(`✅ Updated DB user clerkId to: ${clerkUser.id}`);
  await prisma.$disconnect();
}

main();
