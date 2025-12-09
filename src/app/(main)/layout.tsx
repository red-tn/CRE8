import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Background watermark */}
      <div className="fixed bottom-0 left-0 -translate-x-[10%] translate-y-1/4 pointer-events-none z-[1] opacity-[0.06]">
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
    </div>
  );
}
