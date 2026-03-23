import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hone ST Books | Premium Bhagavad Gita eBooks",
  description:
    "Discover the timeless wisdom of the Bhagavad Gita through premium eBooks. Available in Hindi, English, and a unique Corporate edition.",
  keywords: [
    "Bhagavad Gita",
    "eBooks",
    "Hindi",
    "English",
    "Corporate",
    "Spiritual",
    "Wisdom",
  ],
  icons: {
    icon: "/logo/fvicon.png",
    apple: "/logo/fvicon.png",
  },
  openGraph: {
    title: "Hone ST Books | Premium Bhagavad Gita eBooks",
    description:
      "Discover the timeless wisdom of the Bhagavad Gita through premium eBooks.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-bg-primary text-text-primary">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#FF7A2E",
              colorBackground: "#FFFFFF",
              colorInputBackground: "#FAFAF8",
              colorText: "#1A1A1A",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
