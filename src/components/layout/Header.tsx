"use client";

import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <nav className="container-narrow">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-text-primary tracking-tight">
              Hone<span className="text-brand-orange">ST</span> Books
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#books"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
            >
              Books
            </Link>
            <Show when="signed-in">
              <Link
                href="/library"
                className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
              >
                My Library
              </Link>
              <Link
                href="/orders"
                className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
              >
                Orders
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary text-sm !py-2 !px-5">
                  Get Started
                </button>
              </SignUpButton>
            </Show>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-text-secondary"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-border-light">
            <div className="flex flex-col gap-3">
              <Link href="/#books" onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-text-primary text-sm font-medium px-1 py-1.5">Books</Link>
              <Show when="signed-in">
                <Link href="/library" onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-text-primary text-sm font-medium px-1 py-1.5">My Library</Link>
                <Link href="/orders" onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-text-primary text-sm font-medium px-1 py-1.5">Orders</Link>
                <div className="px-1 py-1.5"><UserButton /></div>
              </Show>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-text-primary text-sm font-medium px-1 py-1.5 text-left cursor-pointer">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button onClick={() => setMobileOpen(false)} className="btn-primary text-sm !py-2 mt-1 w-full">Get Started</button>
                </SignUpButton>
              </Show>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
