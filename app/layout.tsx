import type { Metadata } from "next";
import { Noto_Sans_KR, Gowun_Batang, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--loaded-sans",
  display: "swap",
});

const gowunBatang = Gowun_Batang({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--loaded-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--loaded-display",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--loaded-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "갓생북 은혜",
  description: "순간의 은혜가 평생의 기억으로 — 교회 전용 무료 플립북",
  metadataBase: new URL("https://godsaengbook-grace.vercel.app"),
  openGraph: {
    title: "갓생북 은혜",
    description: "순간의 은혜가 평생의 기억으로 — 교회 전용 무료 플립북",
    siteName: "갓생북 은혜",
    url: "https://godsaengbook-grace.vercel.app",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://godsaengbook-grace.vercel.app/api/og",
        width: 1200,
        height: 630,
        alt: "갓생북 은혜 — 순간의 은혜가 평생의 기억으로",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "갓생북 은혜",
    description: "순간의 은혜가 평생의 기억으로 — 교회 전용 무료 플립북",
    images: ["https://godsaengbook-grace.vercel.app/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`h-full antialiased ${notoSans.variable} ${gowunBatang.variable} ${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
