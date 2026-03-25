import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookSlug } = await params;

    // Get user
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get book
    const book = await prisma.book.findUnique({ where: { slug: bookSlug } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check purchase
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: book.id,
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "You have not purchased this book" },
        { status: 403 }
      );
    }

    // Fetch PDF from Cloudflare R2
    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: `books/${book.pdfFilename}`,
      });

      const response = await r2.send(command);

      if (!response.Body) {
        throw new Error("Empty response from R2");
      }

      // Convert the readable stream to a buffer
      const chunks: Uint8Array[] = [];
      const reader = response.Body.transformToWebStream().getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const pdfBuffer = Buffer.concat(chunks);

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'",
        },
      });
    } catch (err) {
      console.error("Failed to fetch PDF from R2:", err);
      return NextResponse.json(
        { error: "Book file not available" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error serving PDF:", error);
    return NextResponse.json(
      { error: "Failed to serve book" },
      { status: 500 }
    );
  }
}
