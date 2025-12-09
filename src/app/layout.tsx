import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
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
        {/* Background watermark */}
        <div className="fixed bottom-0 left-0 -translate-x-[10%] translate-y-1/4 pointer-events-none z-[1] opacity-[0.12]">
          <Image
            src="/logo.png"
            alt=""
            width={800}
            height={1000}
            className="w-[60vw] h-auto max-w-none"
            priority
          />
        </div>
        <Header />
        <main className="flex-1 pt-20 relative z-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
