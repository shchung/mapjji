import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "맵찌주의보 | 내 주변 매운 맛집 찾기",
  description: "내 주변 매운 맛집을 쉽게 찾아보세요. 매운 음식 전문 지도 서비스 맵찌주의보",
  keywords: ["맵찌", "매운맛집", "매운음식", "맛집지도", "매운거", "spicy food", "restaurant map"],
  authors: [{ name: "맵찌주의보" }],
  creator: "맵찌주의보",
  openGraph: {
    title: "맵찌주의보 | 내 주변 매운 맛집 찾기",
    description: "내 주변 매운 맛집을 쉽게 찾아보세요",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "맵찌주의보 | 내 주변 매운 맛집 찾기",
    description: "내 주변 매운 맛집을 쉽게 찾아보세요",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
