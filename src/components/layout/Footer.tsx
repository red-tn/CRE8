import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Youtube, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo.png"
                alt="CRE8 Truck Club"
                width={100}
                height={50}
                className="h-10 w-auto"
              />
            </Link>
            <div className="flex gap-4">
              <a href="https://instagram.com/cre8truckclub" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@cre8truckclub" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="mailto:info@cre8truckclub.com" className="text-zinc-500 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider mb-4">Club</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-zinc-500 hover:text-white text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-zinc-500 hover:text-white text-sm transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-zinc-500 hover:text-white text-sm transition-colors">
                  Fleet Gallery
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-zinc-500 hover:text-white text-sm transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-zinc-500 hover:text-white text-sm transition-colors">
                  Join the Club
                </Link>
              </li>
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="text-zinc-500 hover:text-white text-sm transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?category=apparel" className="text-zinc-500 hover:text-white text-sm transition-colors">
                  Apparel
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="text-zinc-500 hover:text-white text-sm transition-colors">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-zinc-500 hover:text-white text-sm transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-sm">
            &copy; {new Date().getFullYear()} CRE8 Truck Club. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
