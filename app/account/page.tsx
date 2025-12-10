"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { User, Package, Heart, MapPin, CreditCard, LogOut, Loader2, Lock, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUser, authAPI, getAuthToken } from "@/lib/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const menuItems = [
  { icon: User, label: "Profile", href: "/account/profile" },
  { icon: Package, label: "Orders", href: "/account/orders" },
  { icon: History, label: "Order History", href: "/account/order-history" },
  { icon: Heart, label: "Wishlist", href: "/account/wishlist" },
  { icon: MapPin, label: "Addresses", href: "/account/addresses" },
  { icon: Lock, label: "Change Password", href: "/forgot-password" },
]

export default function AccountPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("")
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) { router.push("/signup"); return }

    setUserName(user.first_name || "there")
    fetchOrders()
    setIsLoading(false)
  }, [router])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/orders`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data.slice(0, 3)) // Show only latest 3
      }
    } catch (error) {
      console.error('Failed to fetch orders')
    }
  }

  const handleLogout = () => {
    authAPI.logout()
    router.push("/")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E7F0FA]">
        <Header />
        <main className="py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2E5E99]" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E7F0FA]">
      <Header />
      <main className="py-10 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-[#0D2440]">My Account</h1>
                <p className="text-[#2E5E99]" style={{ fontFamily: "var(--font-body)" }}>
                  Welcome back, {userName}
                </p>
              </div>
              <Button onClick={handleLogout} variant="outline"
                className="gap-2 bg-transparent border-[#7BA4D0] text-[#2E5E99] hover:bg-[#7BA4D0]/20 w-full sm:w-auto">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {menuItems.map((item) => (
                <Link key={item.label} href={item.href}
                  className="bg-white p-4 sm:p-6 rounded-xl border border-[#7BA4D0]/30 hover:border-[#2E5E99] transition-colors group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#7BA4D0]/20 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[#2E5E99] transition-colors">
                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#2E5E99] group-hover:text-[#E7F0FA]" />
                  </div>
                  <h3 className="font-semibold mb-0.5 sm:mb-1 text-[#0D2440] text-sm sm:text-base">{item.label}</h3>
                  <p className="text-xs sm:text-sm text-[#2E5E99] hidden sm:block" style={{ fontFamily: "var(--font-body)" }}>
                    Manage your {item.label.toLowerCase()}
                  </p>
                </Link>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="mt-8 sm:mt-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[#0D2440]">Recent Orders</h2>
              <div className="bg-white rounded-xl border border-[#7BA4D0]/30 overflow-hidden">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-[#2E5E99]">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No orders yet</p>
                    <Link href="/shop">
                      <Button className="mt-4 bg-[#2E5E99] hover:bg-[#0D2440]">Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {orders.map((order) => (
                      <div key={order.id} className="p-4 sm:p-6 border-b border-[#7BA4D0]/20 last:border-b-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-[#0D2440]">Order #{order.id}</p>
                            <p className="text-xs sm:text-sm text-[#2E5E99]" style={{ fontFamily: "var(--font-body)" }}>
                              Placed on {formatDate(order.created_at)}
                            </p>
                          </div>
                          <span className={`self-start px-3 py-1 text-xs rounded-full uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`} style={{ fontFamily: "var(--font-body)" }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="p-4 sm:p-6 text-center">
                      <Link href="/account/orders">
                        <Button variant="outline"
                          className="uppercase tracking-wider bg-transparent border-[#2E5E99] text-[#2E5E99] hover:bg-[#2E5E99] hover:text-[#E7F0FA] text-sm">
                          View All Orders
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
