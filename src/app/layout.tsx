import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
  title: "CRE8 Truck Club | The Edgiest Truck Club",
  description: "CRE8 Truck Club - The edgiest truck club for enthusiasts driving Chevy, Ford, Dodge, Toyota, and Nissan pickups. Join the crew.",
  keywords: ["truck club", "chevy trucks", "ford trucks", "dodge trucks", "toyota trucks", "nissan trucks", "truck enthusiasts", "car club"],
  openGraph: {
    title: "CRE8 Truck Club",
    description: "The edgiest truck club for truck enthusiasts",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1 pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
