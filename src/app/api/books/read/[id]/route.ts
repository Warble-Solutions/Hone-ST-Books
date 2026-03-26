import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl, list } from "@vercel/blob";

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

    // Return a signed download URL (valid for ~1 hour)
    // This lets the client fetch directly from Blob storage,
    // bypassing the serverless function's 4.5MB response limit
    const downloadUrl = await getDownloadUrl(matchingBlob.url);

    return NextResponse.json({ url: downloadUrl });
  } catch (error) {
    console.error("Error serving PDF:", error);
    return NextResponse.json(
      { error: "Failed to serve book" },
      { status: 500 }
    );
  }
}
