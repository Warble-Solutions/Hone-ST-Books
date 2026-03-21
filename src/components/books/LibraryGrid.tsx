"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { BookInfo } from "@/lib/constants";

interface Props {
  books: BookInfo[];
  purchasedSlugs: string[];
}

export default function LibraryGrid({ books, purchasedSlugs }: Props) {
  const colors = [
    "from-orange-400 to-orange-600",
    "from-sky-400 to-blue-600",
    "from-violet-400 to-purple-600",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book, i) => {
        const isPurchased = purchasedSlugs.includes(book.slug);

        return (
          <motion.div
            key={book.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className={`card overflow-hidden ${!isPurchased ? "opacity-60" : ""}`}>
              {/* Cover */}
              <div className="relative h-48">
                <div className={`absolute inset-0 bg-gradient-to-br ${colors[i]}`} />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <span className="text-white font-bold text-base text-center drop-shadow-md">
                    {book.title}
                  </span>
                </div>

                {!isPurchased && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-10 h-10 text-text-muted mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-text-muted text-sm">Not purchased</span>
                    </div>
                  </div>
                )}

                {isPurchased && (
                  <div className="absolute top-3 right-3">
                    <span className="badge !bg-white !text-green-700 !border-0 text-xs">✓ Owned</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-text-primary font-bold">{book.title}</h3>
                {book.titleHindi && (
                  <p className="text-brand-orange text-sm mt-0.5">{book.titleHindi}</p>
                )}

                <div className="mt-4">
                  {isPurchased ? (
                    <Link href={`/reader/${book.slug}`} className="btn-primary text-sm w-full">
                      📖 Read Now
                    </Link>
                  ) : (
                    <Link href={`/books/${book.slug}`} className="btn-outline text-sm w-full">
                      Buy — {book.priceDisplay}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
