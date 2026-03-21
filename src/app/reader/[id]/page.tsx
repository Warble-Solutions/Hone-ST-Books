import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { BOOKS } from "@/lib/constants";
import PDFReaderClient from "@/components/reader/PDFReaderClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const book = BOOKS.find((b) => b.slug === id);
  return {
    title: book ? `Reading: ${book.title}` : "Reader",
  };
}

export default async function ReaderPage({ params }: PageProps) {
  const { id: bookSlug } = await params;
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const book = BOOKS.find((b) => b.slug === bookSlug);
  if (!book) {
    notFound();
  }

  // Verify purchase
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    redirect("/sign-in");
  }

  const dbBook = await prisma.book.findUnique({
    where: { slug: bookSlug },
  });

  if (!dbBook) {
    notFound();
  }

  const purchase = await prisma.purchase.findUnique({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId: dbBook.id,
      },
    },
  });

  if (!purchase) {
    redirect(`/books/${bookSlug}?error=not_purchased`);
  }

  return <PDFReaderClient bookSlug={bookSlug} bookTitle={book.title} />;
}
