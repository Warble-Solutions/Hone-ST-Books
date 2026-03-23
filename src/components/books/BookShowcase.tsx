"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { BOOKS } from "@/lib/constants";

export default function BookShowcase() {
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
                <div className="relative h-72 overflow-hidden bg-neutral-100">
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-105 p-2"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="badge !bg-white/90 !text-text-primary !border-0 text-xs">
                      {book.language === "hi" ? "हिंदी" : "English"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-text-primary font-bold">{book.title}</h3>
                  {book.titleHindi && (
                    <p className="text-brand-orange text-sm mt-0.5">{book.titleHindi}</p>
                  )}
                  <p className="text-text-muted text-sm leading-relaxed line-clamp-3 mt-2">
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
