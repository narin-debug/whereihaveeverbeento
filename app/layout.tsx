import type { Metadata } from "next";
import { headers } from "next/headers";
import { Noto_Sans_KR, Geist_Mono } from "next/font/google";
import { detectLocale, translations } from "@/lib/i18n";
import { LocaleProvider } from "@/lib/locale-context";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://world-travel-site.vercel.app";

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale((await headers()).get("accept-language"));
  const title = translations[locale].siteTitle;
  const description = translations[locale].siteDescription;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: "Wanderlog",
      locale: locale === "ko" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = detectLocale((await headers()).get("accept-language"));

  return (
    <html
      lang={locale}
      className={`${notoSansKR.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
