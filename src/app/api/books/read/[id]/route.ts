import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { list } from "@vercel/blob";

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

    // Find the blob
    const blobs = await list({ prefix: `books/${book.pdfFilename}` });
    const matchingBlob = blobs.blobs.find(
      (b) => b.pathname === `books/${book.pdfFilename}`
    );

    if (!matchingBlob) {
      console.error(`Blob not found for: books/${book.pdfFilename}`);
      return NextResponse.json(
        { error: "Book file not found in storage" },
        { status: 404 }
      );
    }

    // Fetch the PDF server-side using the token (private blob)
    const blobResponse = await fetch(matchingBlob.url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!blobResponse.ok || !blobResponse.body) {
      console.error(`Blob fetch failed: ${blobResponse.status}`);
      return NextResponse.json(
        { error: "Book file not available" },
        { status: 404 }
      );
    }

    // Stream the response directly — don't buffer into memory
    return new Response(blobResponse.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": matchingBlob.size.toString(),
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  } catch (error) {
    console.error("Error serving PDF:", error);
    return NextResponse.json(
      { error: "Failed to serve book" },
      { status: 500 }
    );
  }
}
