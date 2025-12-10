"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { userOrdersAPI, getCurrentUser, authAPI, Order } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function OrdersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Small delay to allow localStorage to be set from checkout auto-login
    const timer = setTimeout(() => {
      const user = getCurrentUser()
      if (!user) {
        router.push("/login")
        return
      }
      fetchOrders()
    }, 200)
    return () => clearTimeout(timer)
  }, [router])

  const fetchOrders = async () => {
    try {
      const data = await userOrdersAPI.getAll()
      // Filter out Delivered orders - they show in Order History instead
      const activeOrders = data.filter((o: any) => o.status !== 'Delivered')
      setOrders(activeOrders)
    } catch (error: any) {
      if (error.message.includes("401") || error.message.includes("403")) {
        authAPI.logout()
        router.push("/login")
      } else {
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-12 flex items-center justify-center">
          <p className="text-muted-foreground">Loading orders...</p>
        </main>
        <Footer />
      </div>
    )
  }
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
            >
              <ChevronLeft className="h-4 w-4" />
              <span style={{ fontFamily: "var(--font-inter)" }}>Back to Account</span>
            </Link>

            <h1 className="text-3xl lg:text-4xl font-bold mb-8">My Orders</h1>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                <Link href="/shop">
                  <Button>Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const orderItems = Array.isArray(order.items) ? order.items : []
                  return (
                    <div key={order.id} className="bg-card rounded-xl border border-border overflow-hidden">
                      <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-inter)" }}>
                            Placed on {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`px-3 py-1 text-xs rounded-full uppercase tracking-wider ${order.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "Shipped"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "Processing"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            style={{ fontFamily: "var(--font-inter)" }}
                          >
                            {order.status}
                          </span>
                          <span className="font-semibold" style={{ fontFamily: "var(--font-inter)" }}>
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {orderItems.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No items found</p>
                          ) : (
                            orderItems.map((item: any, index: number) => (
                              <div key={index} className="flex gap-4">
                                <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                                  <Image
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.name || "Product"}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-medium">{item.name || "Product"}</h3>
                                  {(item.size || item.color) && (
                                    <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-inter)" }}>
                                      {item.size && `Size: ${item.size}`}
                                      {item.size && item.color && " | "}
                                      {item.color && `Color: ${item.color}`}
                                    </p>
                                  )}
                                  <p className="text-sm mt-1" style={{ fontFamily: "var(--font-inter)" }}>
                                    ${item.price?.toFixed(2) || "0.00"} x {item.quantity || 1}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="p-6 border-t border-border flex gap-4">
                        <Button variant="outline" size="sm" className="uppercase tracking-wider bg-transparent">
                          Track Order
                        </Button>
                        <Link href={`/order-confirmation?orderId=${order.id}`}>
                          <Button variant="outline" size="sm" className="uppercase tracking-wider bg-transparent">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
