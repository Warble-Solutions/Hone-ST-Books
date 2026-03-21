import { notFound } from "next/navigation";
import { BOOKS } from "@/lib/constants";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BookDetailClient from "@/components/books/BookDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BOOKS.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const book = BOOKS.find((b) => b.slug === slug);
  if (!book) return {};

  return {
    title: `${book.title} | Hone ST Books`,
    description: book.description,
    openGraph: {
      title: `${book.title} | Hone ST Books`,
      description: book.description,
      images: [book.coverImage],
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const book = BOOKS.find((b) => b.slug === slug);

  if (!book) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="pt-20 pb-16 min-h-screen">
        <BookDetailClient book={book} />
      </main>
      <Footer />
    </>
  );
}
