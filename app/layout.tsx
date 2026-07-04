import type { Metadata } from "next";
import { Gothic_A1, Geist_Mono } from "next/font/google";
import "./globals.css";

const gothicA1 = Gothic_A1({
  variable: "--font-gothic-a1",
  subsets: ["latin", "korean"],
  weight: ["400", "500", "700", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wanderlog — 세계여행 기록",
  description: "세계 곳곳을 다닌 여행의 기록",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${gothicA1.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
