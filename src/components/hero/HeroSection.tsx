"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { BOOKS } from "@/lib/constants";

export default function HeroSection() {
  return (
    <section className="bg-bg-warm">
      <div className="container-narrow py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="accent-line mb-6" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight tracking-tight">
              Ancient Wisdom,{" "}
              <span className="text-brand-orange">Modern</span> Stories
            </h1>
            <p className="text-text-secondary text-lg mt-6 leading-relaxed max-w-lg">
              Three unique perspectives on the Bhagavad Gita — crafted for the curious mind, the spiritual seeker, and the modern professional.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/#books" className="btn-primary">
                Browse Collection
              </Link>
              <Link href="/library" className="btn-outline">
                My Library →
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-10 mt-12 pt-8 border-t border-border">
              {[
                { value: "3", label: "Premium Books" },
                { value: "₹200", label: "Starting Price" },
                { value: "Instant", label: "Digital Access" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-xl font-bold text-text-primary">{stat.value}</div>
                  <div className="text-xs text-text-muted mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Book stack */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative w-80 h-96">
              {BOOKS.map((book, i) => {
                const offsets = [
                  { x: 0, y: 0, rotate: -6 },
                  { x: 30, y: -10, rotate: 0 },
                  { x: 60, y: -20, rotate: 6 },
                ];
                const o = offsets[i];
                return (
                  <motion.div
                    key={book.slug}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
                    className="absolute"
                    style={{
                      left: o.x,
                      top: o.y,
                      transform: `rotate(${o.rotate}deg)`,
                      zIndex: i,
                    }}
                  >
                    <div className="w-52 h-72 rounded-lg overflow-hidden shadow-xl">
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        width={208}
                        height={288}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
