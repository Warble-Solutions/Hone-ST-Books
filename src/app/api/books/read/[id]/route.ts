import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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

    // Fetch PDF from Vercel Blob
    const blobUrl = `${process.env.BLOB_BASE_URL}/books/${book.pdfFilename}`;

    try {
      const response = await fetch(blobUrl);

      if (!response.ok) {
        throw new Error(`Blob fetch failed: ${response.status}`);
      }

      const pdfBuffer = Buffer.from(await response.arrayBuffer());

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
      console.error("Failed to fetch PDF from Blob:", err);
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
