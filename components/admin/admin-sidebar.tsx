"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, ChevronRight, Menu, X, FolderOpen, Layers, Image, Video, MessageSquare, ShoppingBag, Ticket, Star, CreditCard, Mail, Sparkles } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { authAPI } from "@/lib/api"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: FolderOpen, label: "Categories", href: "/admin/categories" },
  { icon: Layers, label: "Collections", href: "/admin/collections" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: CreditCard, label: "Transactions", href: "/admin/transactions" },
  { icon: Users, label: "Customers", href: "/admin/customers" },
  { icon: Ticket, label: "Coupons", href: "/admin/coupons" },
  { icon: Star, label: "Reviews", href: "/admin/reviews" },
  { icon: Mail, label: "Contacts", href: "/admin/contacts" },
  { icon: Image, label: "Hero Settings", href: "/admin/hero" },
  { icon: Video, label: "Our Story", href: "/admin/our-story" },
  { icon: MessageSquare, label: "Testimonials", href: "/admin/testimonials" },
  { icon: ShoppingBag, label: "Shop The Look", href: "/admin/shop-the-look" },
  { icon: Sparkles, label: "Featured Products", href: "/admin/featured" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = () => {
    authAPI.logout()
    router.push("/")
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0D2440] text-[#E7F0FA] p-4 flex items-center justify-between">
        <Link href="/admin/dashboard">
          <h1 className="text-lg font-bold tracking-[0.2em]">Vurel</h1>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-[#E7F0FA] hover:bg-[#2E5E99]">
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0D2440] text-[#E7F0FA] flex flex-col transform transition-transform duration-300 ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} pt-16 lg:pt-0`}>
        <div className="hidden lg:block p-6 border-b border-[#2E5E99]/30">
          <Link href="/admin/dashboard">
            <h1 className="text-xl font-bold tracking-[0.2em]">Vurel</h1>
            <p className="text-xs text-[#7BA4D0] mt-1" style={{ fontFamily: "var(--font-body)" }}>Admin Panel</p>
          </Link>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${isActive ? "bg-[#2E5E99] text-[#E7F0FA]" : "text-[#7BA4D0] hover:bg-[#2E5E99]/30 hover:text-[#E7F0FA]"}`}>
                    <item.icon className="h-4 w-4" />
                    <span style={{ fontFamily: "var(--font-body)" }}>{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#2E5E99]/30">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#7BA4D0] hover:bg-[#2E5E99]/30 hover:text-[#E7F0FA] transition-colors text-sm">
            <LogOut className="h-4 w-4" />
            <span style={{ fontFamily: "var(--font-body)" }}>Exit Admin</span>
          </button>
        </div>
      </aside>
    </>
  )
}
