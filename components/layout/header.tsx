"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Search, User, ShoppingBag, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { getCurrentUser } from "@/lib/api"

const navLinks = [
  { href: "/shop", label: "Shop All" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const updateCartCount = useCallback(() => {
    try {
      const saved = localStorage.getItem('cart')
      if (saved) {
        const cart = JSON.parse(saved)
        const total = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
        setCartCount(total)
      } else {
        setCartCount(0)
      }
    } catch {
      setCartCount(0)
    }
  }, [])

  const checkAuthState = useCallback(() => {
    const user = getCurrentUser()
    setIsLoggedIn(!!user)
  }, [])

  useEffect(() => {
    // Check auth and cart on mount
    checkAuthState()
    updateCartCount()

    // Re-check when page becomes visible (user returns to tab)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAuthState()
        updateCartCount()
      }
    }

    // Re-check when localStorage changes (cross-tab)
    const handleStorage = () => {
      checkAuthState()
      updateCartCount()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('storage', handleStorage)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('storage', handleStorage)
    }
  }, [checkAuthState])

  // Re-check auth on route change (important for checkout -> home navigation)
  useEffect(() => {
    checkAuthState()
  }, [pathname, checkAuthState])

  const handleAccountClick = () => {
    const user = getCurrentUser()
    if (user) {
      router.push("/account")
    } else {
      router.push("/signup")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 lg:px-8">
        {/* Left Navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary tracking-wide uppercase"
              style={{ fontFamily: "var(--font-body)" }}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-sm p-0">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-border">
                <Link href="/" className="block">
                  <Image src="/vr-logo.png" alt="Vurel" width={50} height={50} className="object-contain" />
                </Link>
              </div>
              <nav className="flex flex-col p-6 gap-1">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href}
                      className="text-lg font-medium text-foreground/80 transition-colors hover:text-primary hover:bg-muted/50 tracking-wide uppercase py-3 px-4 rounded-lg"
                      style={{ fontFamily: "var(--font-body)" }}>
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="px-6 py-4 border-t border-border">
                <SheetClose asChild>
                  <Link href="/cart"
                    className="flex items-center justify-between text-lg font-medium text-foreground/80 transition-colors hover:text-primary hover:bg-muted/50 py-3 px-4 rounded-lg"
                    style={{ fontFamily: "var(--font-body)" }}>
                    <span>Shopping Cart</span>
                    {cartCount > 0 && <span className="h-6 w-6 rounded-full bg-primary text-xs font-medium text-primary-foreground flex items-center justify-center">{cartCount}</span>}
                  </Link>
                </SheetClose>
              </div>
              <div className="mt-auto p-6 border-t border-border">
                <div className="flex flex-col gap-3">
                  {isLoggedIn ? (
                    <SheetClose asChild>
                      <Link href="/account">
                        <Button className="w-full" style={{ fontFamily: "var(--font-body)" }}>My Account</Button>
                      </Link>
                    </SheetClose>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link href="/login"><Button variant="outline" className="w-full bg-transparent" style={{ fontFamily: "var(--font-body)" }}>Sign In</Button></Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/signup"><Button className="w-full" style={{ fontFamily: "var(--font-body)" }}>Create Account</Button></Link>
                      </SheetClose>
                    </>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Center Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <Image src="/vr-logo.png" alt="Vurel" width={40} height={40} className="object-contain w-8 h-8 sm:w-10 sm:h-10" />
        </Link>

        {/* Right Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-foreground/80 hover:text-primary h-9 w-9 sm:h-10 sm:w-10">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleAccountClick}
            className="text-foreground/80 hover:text-primary h-9 w-9 sm:h-10 sm:w-10">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-primary h-9 w-9 sm:h-10 sm:w-10">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary text-[9px] sm:text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="border-t border-border/40 bg-background p-3 sm:p-4">
          <div className="container mx-auto flex items-center gap-3 sm:gap-4">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
            <input type="text" placeholder="Search products..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
              style={{ fontFamily: "var(--font-body)" }} autoFocus />
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)} className="shrink-0 h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
