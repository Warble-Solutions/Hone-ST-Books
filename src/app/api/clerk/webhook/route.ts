import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id: clerkId, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses?.[0]?.email_address;

    if (!email) {
      return NextResponse.json({ status: "no email, skipped" });
    }

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    // Upsert user
    const user = await prisma.user.upsert({
      where: { clerkId },
      create: {
        clerkId,
        email,
        name,
      },
      update: {
        email,
        name,
      },
    });

    // For new users, check legacy user migration
    if (eventType === "user.created") {
      const legacyUser = await prisma.legacyUser.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (legacyUser && !legacyUser.migratedAt) {
        // Migrate purchases
        const bookSlugs: string[] = [];
        if (legacyUser.purchasedHindi) bookSlugs.push("bhagavad-gita-hindi");
        if (legacyUser.purchasedEnglish)
          bookSlugs.push("bhagavad-gita-english");
        if (legacyUser.purchasedCorporate)
          bookSlugs.push("corporate-bhagavad-gita");

        if (bookSlugs.length > 0) {
          const books = await prisma.book.findMany({
            where: { slug: { in: bookSlugs } },
          });

          // Create purchases for migrated books
          await prisma.$transaction([
            ...books.map((book) =>
              prisma.purchase.upsert({
                where: {
                  userId_bookId: {
                    userId: user.id,
                    bookId: book.id,
                  },
                },
                create: {
                  userId: user.id,
                  bookId: book.id,
                  source: "MIGRATED",
                },
                update: {},
              })
            ),
            prisma.legacyUser.update({
              where: { id: legacyUser.id },
              data: { migratedAt: new Date() },
            }),
          ]);

          console.log(
            `Migrated ${books.length} purchases for user ${email}`
          );
        }
      }
    }
  }

  if (eventType === "user.deleted") {
    const { id: clerkId } = evt.data;
    if (clerkId) {
      // Soft handling - don't delete purchases, just unlink
      await prisma.user
        .delete({ where: { clerkId } })
        .catch(() => console.log("User not found for deletion"));
    }
  }

  return NextResponse.json({ status: "success" });
}
