import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Instagram, Facebook, Twitter, Youtube, UserPlus } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#0D2440] text-[#E7F0FA]">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand - Full width on mobile */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1 space-y-4">
            <Image src="/vr-logo.png" alt="Vurel" width={50} height={50} className="object-contain brightness-0 invert" />
            <p className="text-sm text-[#7BA4D0] leading-relaxed max-w-xs" style={{ fontFamily: "var(--font-body)" }}>
              Where luxury meets personality. Premium quality, unique design, and youth-driven fashion.
            </p>
            <div className="flex gap-3">
              <Link href="#" className="text-[#7BA4D0] hover:text-[#E7F0FA] transition-colors p-2 -ml-2">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-[#7BA4D0] hover:text-[#E7F0FA] transition-colors p-2">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-[#7BA4D0] hover:text-[#E7F0FA] transition-colors p-2">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-[#7BA4D0] hover:text-[#E7F0FA] transition-colors p-2">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              <li>
                <Link href="/" className="text-[#7BA4D0] hover:text-[#E7F0FA] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-[#7BA4D0] hover:text-[#E7F0FA] transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-[#7BA4D0] hover:text-[#E7F0FA] transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#7BA4D0] hover:text-[#E7F0FA] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/account/profile" className="text-[#7BA4D0] hover:text-[#E7F0FA] transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Help</h3>
            <ul className="space-y-2.5 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              <li>
                <Link href="/contact" className="text-[#7BA4D0] hover:text-[#E7F0FA] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-[#7BA4D0] hover:text-[#E7F0FA] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-[#7BA4D0] hover:text-[#E7F0FA] transition-colors">
                  Returns & Refund
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-[#7BA4D0] hover:text-[#E7F0FA] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#7BA4D0] hover:text-[#E7F0FA] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Account - Full width on small mobile */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">My Account</h3>
            <p className="text-sm text-[#7BA4D0]" style={{ fontFamily: "var(--font-body)" }}>
              Create an account to track orders, save wishlist, and get exclusive offers.
            </p>
            <Link href="/account/profile">
              <Button className="bg-[#2E5E99] hover:bg-[#7BA4D0] text-[#E7F0FA] h-11 w-full sm:w-auto">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        <div className="border-t border-[#2E5E99]/30 mt-10 lg:mt-12 pt-6 lg:pt-8 flex justify-center">
          <p className="text-sm text-[#7BA4D0] text-center" style={{ fontFamily: "var(--font-body)" }}>
            © 2025 Vurel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
