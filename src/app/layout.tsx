import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, EB_Garamond, Inter } from "next/font/google";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});
const garamond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-garamond",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Furniture & Home Interiors", template: "%s" },
};

export const viewport: Viewport = {
  themeColor: "#29345f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${garamond.variable} ${inter.variable}`}>
      <body className="min-h-screen font-serif antialiased">{children}</body>
    </html>
  );
}
