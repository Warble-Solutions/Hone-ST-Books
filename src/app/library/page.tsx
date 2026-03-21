import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { BOOKS } from "@/lib/constants";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LibraryGrid from "@/components/books/LibraryGrid";

export const metadata = {
  title: "My Library | Hone ST Books",
  description: "Your personal eBook library",
};

export default async function LibraryPage() {
  const { userId: clerkId } = await auth();

  let purchasedSlugs: string[] = [];

  if (clerkId) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        purchases: {
          include: { book: true },
        },
      },
    });

    if (user) {
      purchasedSlugs = user.purchases.map((p) => p.book.slug);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-primary">
        <div className="container-narrow py-12">
          <div className="accent-line mb-4" />
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            My Library
          </h1>
          <p className="text-text-muted mt-1 mb-10">
            Your purchased books are ready to read.
          </p>
          <LibraryGrid books={BOOKS} purchasedSlugs={purchasedSlugs} />
        </div>
      </main>
      <Footer />
    </>
  );
}
