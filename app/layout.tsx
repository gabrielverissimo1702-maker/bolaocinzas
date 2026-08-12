import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Geist_Mono } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-sistema",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BolÃ£o",
  description: "Sistema de bolÃ£o de futebol",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050914",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${geistMono.variable} h-full bg-[#050914] antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-[#050914] text-slate-50">{children}</body>
    </html>
  );
}

