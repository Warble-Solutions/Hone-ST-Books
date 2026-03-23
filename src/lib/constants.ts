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
      "भगवद्गीता को एक सरल और रोचक कहानी के रूप में प्रस्तुत करती यह पुस्तक मूल संस्कृत श्लोकों का हिंदी अनुवाद है — बिना किसी जटिल भाष्य के। लेखक प्रसून कुंडू ने गीता के ७०१ श्लोकों को एक प्रवाहमय कथा में पिरोया है ताकि हर पाठक इस अमूल्य ज्ञान से जुड़ सके। पुस्तक में मूल संस्कृत पाठ भी सम्मिलित है। बिक्री की ५०% आय बालिका शिक्षा और वंचित बच्चों की शिक्षा के लिए समर्पित है।",
    price: 20000,
    priceDisplay: "₹200",
    coverImage: "/covers/bhagavad-gita-hindi.png",
    pdfFilename: "bhagavad-gita-hindi.pdf",
    language: "hi",
  },
  {
    id: "bhagavad-gita-english",
    slug: "bhagavad-gita-english",
    title: "Bhagavad Gita - A Story",
    description:
      "Read the Bhagavad Gita the way it was meant to be experienced — as a flowing story, not a textbook. Author Prasun Kundu translates all 701 shlokas into simple English sentences that stay true to the original Sanskrit, free from complex commentaries. Whether you are new to the Gita or revisiting it, this book makes its timeless wisdom accessible to all. Includes the complete original Sanskrit text for reference. 50% of proceeds fund education for underprivileged children.",
    price: 20000,
    priceDisplay: "₹200",
    coverImage: "/covers/bhagavad-gita-english.png",
    pdfFilename: "bhagavad-gita-english.pdf",
    language: "en",
  },
  {
    id: "corporate-bhagavad-gita",
    slug: "corporate-bhagavad-gita",
    title: "The Corporate Bhagavad Gita",
    description:
      "Discover the Arjuna in You. This in-depth exploration of the eighteenth chapter of the Bhagavad Gita bridges 5,000-year-old wisdom with modern corporate challenges — from ownership and leadership to communication, integrity and excellence in execution. Author Prasun Kundu draws parallels between Arjuna's battlefield dilemma and today's professional struggles, providing a personalised guidebook for navigating the battlefield of life with clarity and purpose.",
    price: 20000,
    priceDisplay: "₹200",
    coverImage: "/covers/corporate-bhagavad-gita.png",
    pdfFilename: "corporate-bhagavad-gita.pdf",
    language: "en",
  },
];

export const LEGACY_BOOK_MAPPING = {
  payment_status: "bhagavad-gita-hindi",
  payment_status_english: "bhagavad-gita-english",
  payment_status_corporate: "corporate-bhagavad-gita",
} as const;
