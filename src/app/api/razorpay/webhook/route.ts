import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid Razorpay webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      // Find the order
      const order = await prisma.order.findUnique({
        where: { razorpayOrderId },
        include: {
          items: { include: { book: true } },
          user: true,
        },
      });

      if (!order) {
        console.error("Order not found for:", razorpayOrderId);
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      if (order.status === "PAID") {
        // Already processed, idempotent
        return NextResponse.json({ status: "already_processed" });
      }

      // Update order status and create purchases
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            razorpayPaymentId: payment.id,
          },
        }),
        ...order.items.map((item) =>
          prisma.purchase.upsert({
            where: {
              userId_bookId: {
                userId: order.userId,
                bookId: item.bookId,
              },
            },
            create: {
              userId: order.userId,
              bookId: item.bookId,
              orderId: order.id,
              source: "RAZORPAY",
            },
            update: {},
          })
        ),
      ]);

      // Send confirmation email
      try {
        const bookTitles = order.items.map((item) => item.book.title);
        await getResend().emails.send({
          from: "Hone ST Books <noreply@honestbooks.com>",
          to: order.user.email,
          subject: `Purchase Confirmed — ${bookTitles.join(", ")}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #FF7A2E;">Thank you for your purchase!</h1>
              <p>Hi ${order.user.name || "Reader"},</p>
              <p>Your payment of <strong>₹${(order.amount / 100).toFixed(2)}</strong> has been confirmed.</p>
              <h3>Books purchased:</h3>
              <ul>
                ${bookTitles.map((t) => `<li>${t}</li>`).join("")}
              </ul>
              <p>You can start reading your books right away in your library:</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/library" 
                 style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #FF7A2E, #2491BF); color: white; text-decoration: none; border-radius: 50px; font-weight: bold;">
                Go to My Library →
              </a>
              <p style="margin-top: 20px; color: #9CA3AF; font-size: 14px;">
                Order ID: ${order.razorpayOrderId}<br/>
                Payment ID: ${payment.id}
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        // Don't fail the webhook if email fails
        console.error("Failed to send confirmation email:", emailError);
      }

      return NextResponse.json({ status: "success" });
    }

    // Handle other events
    return NextResponse.json({ status: "ignored" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
