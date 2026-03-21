export const BRAND_COLORS = {
  orange: "#FF7A2E",
  blue: "#2491BF",
  orangeLight: "#FFAA6E",
  blueDark: "#1A6F8F",
  background: "#0A0A0F",
  surface: "#131320",
  surfaceLight: "#1E1E35",
  text: "#F5F5F7",
  textMuted: "#9CA3AF",
} as const;

export interface BookInfo {
  id: string;
  slug: string;
  title: string;
  titleHindi?: string;
  description: string;
  price: number; // in paise
  priceDisplay: string;
  coverImage: string;
  pdfFilename: string;
  language: string;
}

export const BOOKS: BookInfo[] = [
  {
    id: "bhagavad-gita-hindi",
    slug: "bhagavad-gita-hindi",
    title: "Bhagavad Gita - A Story",
    titleHindi: "भगवद्गीता - एक कहानी",
    description:
      "Discover the timeless wisdom of the Bhagavad Gita through an engaging narrative in Hindi. This unique retelling brings ancient teachings to life, making them accessible and relevant for modern readers.",
    price: 19900,
    priceDisplay: "₹199",
    coverImage: "/covers/bhagavad-gita-hindi.jpg",
    pdfFilename: "bhagavad-gita-hindi.pdf",
    language: "hi",
  },
  {
    id: "bhagavad-gita-english",
    slug: "bhagavad-gita-english",
    title: "Bhagavad Gita - A Story",
    description:
      "Experience the profound teachings of the Bhagavad Gita reimagined as a captivating story in English. A fresh perspective on ancient wisdom that speaks to the challenges of contemporary life.",
    price: 19900,
    priceDisplay: "₹199",
    coverImage: "/covers/bhagavad-gita-english.jpg",
    pdfFilename: "bhagavad-gita-english.pdf",
    language: "en",
  },
  {
    id: "corporate-bhagavad-gita",
    slug: "corporate-bhagavad-gita",
    title: "The Corporate Bhagavad Gita",
    description:
      "Bridge ancient wisdom and modern business with The Corporate Bhagavad Gita. Learn how timeless teachings from the Gita can transform your leadership style, decision-making, and professional growth.",
    price: 19900,
    priceDisplay: "₹199",
    coverImage: "/covers/corporate-bhagavad-gita.jpg",
    pdfFilename: "corporate-bhagavad-gita.pdf",
    language: "en",
  },
];

export const LEGACY_BOOK_MAPPING = {
  payment_status: "bhagavad-gita-hindi",
  payment_status_english: "bhagavad-gita-english",
  payment_status_corporate: "corporate-bhagavad-gita",
} as const;
