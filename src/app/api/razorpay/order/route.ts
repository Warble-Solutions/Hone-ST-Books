import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookIds } = await req.json();
    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return NextResponse.json(
        { error: "No books selected" },
        { status: 400 }
      );
    }

    // Get user from DB
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get books and calculate total
    const books = await prisma.book.findMany({
      where: { slug: { in: bookIds }, isActive: true },
    });

    if (books.length === 0) {
      return NextResponse.json(
        { error: "No valid books found" },
        { status: 400 }
      );
    }

    // Check if user already purchased any of these books
    const existingPurchases = await prisma.purchase.findMany({
      where: {
        userId: user.id,
        bookId: { in: books.map((b) => b.id) },
      },
    });

    const alreadyPurchasedIds = new Set(
      existingPurchases.map((p) => p.bookId)
    );
    const booksToPurchase = books.filter(
      (b) => !alreadyPurchasedIds.has(b.id)
    );

    if (booksToPurchase.length === 0) {
      return NextResponse.json(
        { error: "You already own all selected books" },
        { status: 400 }
      );
    }

    const totalAmount = booksToPurchase.reduce((sum, b) => sum + b.price, 0);

    // Create Razorpay order
    const razorpayOrder = await getRazorpay().orders.create({
      amount: totalAmount,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        userId: user.id,
        bookIds: booksToPurchase.map((b) => b.id).join(","),
      },
    });

    // Create order in DB
    await prisma.order.create({
      data: {
        userId: user.id,
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmount,
        currency: "INR",
        status: "CREATED",
        items: {
          create: booksToPurchase.map((b) => ({
            bookId: b.id,
            price: b.price,
          })),
        },
      },
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: totalAmount,
      currency: "INR",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
