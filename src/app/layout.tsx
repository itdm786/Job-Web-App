import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GlobalHire — Find Your Next Opportunity, Anywhere in the World",
    template: "%s | GlobalHire",
  },
  description:
    "Discover millions of jobs across 190+ countries. Government positions, remote roles, and opportunities at top companies worldwide.",
  keywords: [
    "jobs",
    "careers",
    "employment",
    "remote jobs",
    "government jobs",
    "hiring",
    "recruitment",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://globalhire.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "GlobalHire",
    title: "GlobalHire — Find Your Next Opportunity",
    description: "Global job portal for seekers and employers worldwide.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GlobalHire — Find Your Next Opportunity",
    description: "Global job portal for seekers and employers worldwide.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
