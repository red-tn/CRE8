import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "CRE8 Truck Club",
  description: "CRE8 Truck Club - A truck club for enthusiasts driving Chevy, Ford, Dodge, Toyota, Nissan, and GMC pickups. Join the crew.",
  keywords: ["truck club", "chevy trucks", "ford trucks", "dodge trucks", "toyota trucks", "nissan trucks", "truck enthusiasts", "car club"],
  openGraph: {
    title: "CRE8 Truck Club",
    description: "A truck club for truck enthusiasts",
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
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8003141165916453"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
