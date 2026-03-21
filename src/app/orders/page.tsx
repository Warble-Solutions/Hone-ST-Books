import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = {
  title: "My Orders | Hone ST Books",
  description: "Your purchase history",
};

export default async function OrdersPage() {
  const { userId: clerkId } = await auth();

  let orders: Awaited<ReturnType<typeof getOrders>> = [];

  if (clerkId) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (user) {
      orders = await getOrders(user.id);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="accent-line mb-4" />
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            My Orders
          </h1>
          <p className="text-text-muted mt-1 mb-10">
            Your purchase history and receipts.
          </p>

          {orders.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-text-primary font-bold text-lg mb-1">No orders yet</h3>
              <p className="text-text-muted text-sm mb-6">
                Browse our collection and find your next great read.
              </p>
              <Link href="/#books" className="btn-primary">
                Browse Books
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="card p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                    <div>
                      <p className="text-text-muted text-xs">
                        Order:{" "}
                        <span className="text-text-secondary font-mono">
                          {order.razorpayOrderId}
                        </span>
                      </p>
                      <p className="text-text-muted text-xs mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          order.status === "PAID"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : order.status === "FAILED"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-text-primary font-bold">
                        ₹{(order.amount / 100).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border-light pt-4">
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 bg-bg-accent rounded-lg px-3 py-2 text-sm"
                        >
                          <span className="text-text-primary font-medium">
                            {item.book.title}
                          </span>
                          {order.status === "PAID" && (
                            <Link href={`/reader/${item.book.slug}`} className="text-brand-orange text-xs hover:underline">
                              Read →
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

async function getOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: { book: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
