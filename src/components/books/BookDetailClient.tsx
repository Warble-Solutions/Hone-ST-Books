"use client";

import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import type { BookInfo } from "@/lib/constants";

interface Props {
  book: BookInfo;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export default function BookDetailClient({ book }: Props) {
  const { isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);

  const handleBuyNow = async () => {
    if (!isSignedIn) {
      window.location.href = `/sign-up?redirect_url=/books/${book.slug}`;
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookIds: [book.id] }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Hone ST Books",
        description: book.title,
        order_id: data.orderId,
        handler: () => {
          window.location.href = "/library";
        },
        theme: {
          color: "#FF7A2E",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    { slug: "bhagavad-gita-hindi", gradient: "from-orange-400 to-orange-600" },
    { slug: "bhagavad-gita-english", gradient: "from-sky-400 to-blue-600" },
    { slug: "corporate-bhagavad-gita", gradient: "from-violet-400 to-purple-600" },
  ];
  const gradient = colors.find((c) => c.slug === book.slug)?.gradient || "from-gray-400 to-gray-600";

  return (
    <div className="container-narrow py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Book cover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center lg:sticky lg:top-24"
        >
          <div className="book-cover">
            <div className={`w-64 h-[360px] sm:w-72 sm:h-[400px] rounded-lg bg-gradient-to-br ${gradient} flex flex-col justify-end p-7`}>
              <h2 className="text-white font-bold text-2xl leading-tight drop-shadow-md">
                {book.title}
              </h2>
              {book.titleHindi && (
                <p className="text-white/80 text-base mt-1">{book.titleHindi}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <span className="badge mb-4">
            {book.language === "hi" ? "हिंदी" : "English"}
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mt-3">
            {book.title}
          </h1>
          {book.titleHindi && (
            <p className="text-brand-orange text-lg mt-1">{book.titleHindi}</p>
          )}

          <p className="text-text-secondary text-base leading-relaxed mt-6">
            {book.description}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-3 mt-8 pb-6 border-b border-border">
            <span className="text-4xl font-bold text-text-primary">
              {book.priceDisplay}
            </span>
            <span className="text-text-muted text-sm">
              One-time purchase · Instant access
            </span>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-6">
            {[
              "📱 Read on any device",
              "🔒 Secure reader",
              "⚡ Instant delivery",
              "💳 UPI / Card accepted",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-text-secondary text-sm">
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Buy button */}
          <button
            onClick={handleBuyNow}
            disabled={loading}
            className="btn-primary w-full sm:w-auto mt-8 !py-3.5 !px-10 text-base"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              `Buy Now — ${book.priceDisplay}`
            )}
          </button>
        </motion.div>
      </div>

      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
