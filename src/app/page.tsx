import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/hero/HeroSection";
import BookShowcase from "@/components/books/BookShowcase";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <BookShowcase />

        {/* Why Choose Us */}
        <section className="section-padding bg-bg-warm">
          <div className="container-narrow">
            <div className="text-center mb-12">
              <div className="accent-line mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-text-primary tracking-tight">
                Why Read With Us?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "📖",
                  title: "Read Anywhere",
                  desc: "Our in-browser reader works on mobile, tablet, and desktop — no app download required.",
                },
                {
                  icon: "🔒",
                  title: "Secure & Private",
                  desc: "Your purchased books are protected and accessible only to you through your personal library.",
                },
                {
                  icon: "⚡",
                  title: "Instant Access",
                  desc: "Pay once with UPI or Card and start reading immediately — no waiting, no shipping.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="card p-7 text-center"
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-text-primary font-bold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-bg-primary">
          <div className="container-narrow text-center">
            <h2 className="text-3xl font-bold text-text-primary tracking-tight mb-3">
              Start Your Journey Today
            </h2>
            <p className="text-text-muted max-w-md mx-auto mb-8">
              Unlock the wisdom of the ages with our premium eBook collection. Available for just ₹199 each.
            </p>
            <a href="#books" className="btn-primary">
              Browse Collection
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
