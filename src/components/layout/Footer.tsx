import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-bg-warm border-t border-border mt-16">
      <div className="container-narrow py-16" style={{ paddingTop: '4rem' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/">
              <Image
                src="/logo/hone-ST-logo.png"
                alt="Hone ST Books"
                width={140}
                height={46}
                className="h-10 w-auto mb-3"
              />
            </Link>
            <p className="text-text-muted text-sm leading-relaxed">
              Premium eBooks bringing the timeless wisdom of the Bhagavad Gita to modern readers.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#books" className="text-text-muted hover:text-brand-orange transition-colors">Browse Books</Link></li>
              <li><Link href="/library" className="text-text-muted hover:text-brand-orange transition-colors">My Library</Link></li>
              <li><Link href="/orders" className="text-text-muted hover:text-brand-orange transition-colors">My Orders</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">
              Get in Touch
            </h4>
            <p className="text-text-muted text-sm mb-2">
              Have questions? Reach out to us.
            </p>
            <a href="mailto:honestsol.inquiry@gmail.com" className="text-brand-orange text-sm hover:underline">
              honestsol.inquiry@gmail.com
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <span>© {new Date().getFullYear()} Hone ST Solutions. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-text-secondary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-text-secondary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
