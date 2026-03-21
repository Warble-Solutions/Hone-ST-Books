"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BOOKS } from "@/lib/constants";

export default function BookShowcase() {
  const colors = [
    "from-orange-400 to-orange-600",
    "from-sky-400 to-blue-600",
    "from-violet-400 to-purple-600",
  ];

  return (
    <section id="books" className="section-padding bg-bg-primary">
      <div className="container-narrow">
        <div className="text-center mb-14">
          <div className="accent-line mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Our Collection
          </h2>
          <p className="text-text-muted mt-3 max-w-lg mx-auto">
            Three unique perspectives on the Bhagavad Gita, crafted for different readers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BOOKS.map((book, i) => (
            <motion.div
              key={book.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="card overflow-hidden group">
                {/* Cover */}
                <div className="relative h-56 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors[i]} transition-transform duration-500 group-hover:scale-105`} />
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="text-center">
                      <h3 className="text-white font-bold text-lg drop-shadow-md">{book.title}</h3>
                      {book.titleHindi && (
                        <p className="text-white/80 text-sm mt-1">{book.titleHindi}</p>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="badge !bg-white/90 !text-text-primary !border-0 text-xs">
                      {book.language === "hi" ? "हिंदी" : "English"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-text-muted text-sm leading-relaxed line-clamp-3">
                    {book.description}
                  </p>
                  <div className="flex items-center justify-between mt-5">
                    <span className="text-xl font-bold text-text-primary">{book.priceDisplay}</span>
                    <Link
                      href={`/books/${book.slug}`}
                      className="btn-primary text-sm !py-2 !px-5"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
