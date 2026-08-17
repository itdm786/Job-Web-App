import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "GlobalJob Portal — Government & Private Jobs Worldwide",
  description: "Find government and private jobs across Pakistan, USA, India, UAE and more. Multi-country job portal with smart filters.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f8fafc] text-slate-900 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
