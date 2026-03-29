import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "갓생북 은혜",
  description: "교회 공동체의 소중한 경험을 신앙 서사로 — 완전 무료",
  openGraph: {
    title: "갓생북 은혜",
    description: "교회 공동체의 소중한 경험을 신앙 서사로 — 완전 무료",
    siteName: "갓생북 은혜",
    images: [],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "갓생북 은혜",
    description: "교회 공동체의 소중한 경험을 신앙 서사로 — 완전 무료",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@400;500;600&family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
