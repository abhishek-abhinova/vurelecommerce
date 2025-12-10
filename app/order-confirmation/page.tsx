"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, Package, Truck, Mail, ArrowRight, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { userOrdersAPI, getCurrentUser, authAPI, Order } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function OrderConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)

  const orderId = searchParams?.get("orderId")

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Small delay to allow localStorage to be set from checkout
    const timer = setTimeout(() => {
      if (orderId) {
        fetchOrder()
      } else {
        setIsLoading(false)
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [orderId])

  const fetchOrder = async () => {
    if (!orderId) return
    try {
      const data = await userOrdersAPI.getById(parseInt(orderId))
      setOrder(data)
    } catch (error: any) {
      console.error("Failed to load order:", error)
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.id.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  const getEstimatedDelivery = (dateString: string) => {
    const date = new Date(dateString)
    date.setDate(date.getDate() + 7)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading order details...</p>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Link href="/account/orders">
            <Button>View My Orders</Button>
          </Link>
        </div>
      </main>
    )
  }

  const orderItems = Array.isArray(order.items) ? order.items : []

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                style={{
                  backgroundColor: ["#2E5E99", "#7BA4D0", "#E7F0FA", "#0D2440"][Math.floor(Math.random() * 4)],
                }}
              />
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Success Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
          </div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Order Confirmed!
          </h1>
          <p
            className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Thank you for your purchase. We've sent a confirmation email to{" "}
            <span className="font-medium text-foreground">{order.customer_email}</span>
          </p>
        </div>

        {/* Order Number */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="bg-card rounded-xl p-4 sm:p-5 border border-border text-center">
            <p className="text-sm text-muted-foreground mb-1" style={{ fontFamily: "var(--font-body)" }}>
              Order Number
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span
                className="text-lg sm:text-xl font-bold text-primary tracking-wider"
                style={{ fontFamily: "var(--font-body)" }}
              >
                #{order.id}
              </span>
              <button onClick={copyOrderNumber} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Timeline */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="bg-card rounded-xl p-5 sm:p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-5" style={{ fontFamily: "var(--font-sans)" }}>
              Estimated Delivery
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
              {/* Step 1 */}
              <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center sm:flex-1">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="sm:mt-2">
                  <p className="font-medium text-foreground text-sm" style={{ fontFamily: "var(--font-body)" }}>
                    Order Placed
                  </p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
              </div>

              {/* Connector */}
              <div className="hidden sm:block flex-1 h-1 bg-muted mx-2 rounded-full relative">
                <div className="absolute inset-0 bg-primary rounded-full" style={{ width: "50%" }} />
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center sm:flex-1">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div className="sm:mt-2">
                  <p className="font-medium text-foreground text-sm" style={{ fontFamily: "var(--font-body)" }}>
                    Processing
                  </p>
                  <p className="text-xs text-muted-foreground">1-2 days</p>
                </div>
              </div>

              {/* Connector */}
              <div className="hidden sm:block flex-1 h-1 bg-muted mx-2 rounded-full" />

              {/* Step 3 */}
              <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center sm:flex-1">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="sm:mt-2">
                  <p className="font-medium text-foreground text-sm" style={{ fontFamily: "var(--font-body)" }}>
                    Delivery
                  </p>
                  <p className="text-xs text-muted-foreground">{getEstimatedDelivery(order.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Order Items */}
          <div className="bg-card rounded-xl p-5 sm:p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-sans)" }}>
              Order Items
            </h2>
            <div className="space-y-4">
              {orderItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items found</p>
              ) : (
                orderItems.map((item: any, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative w-14 h-16 sm:w-16 sm:h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name || "Product"} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium text-foreground line-clamp-1"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {item.name || "Product"}
                      </p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && " / "}
                          {item.color && `Color: ${item.color}`}
                          {item.quantity && ` × ${item.quantity}`}
                        </p>
                      )}
                      <p className="text-sm font-medium text-primary mt-1">
                        ₹{((item.price || 0) * (item.quantity || 1)).toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Separator className="my-4" />

            {/* Price Summary */}
            <div className="space-y-2 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{(order.total * 0.92).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (GST)</span>
                <span>₹{(order.total * 0.08).toFixed(0)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary">₹{order.total.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-5 sm:p-6 border border-border">
              <h2 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-sans)" }}>
                Shipping Address
              </h2>
              <div className="space-y-1" style={{ fontFamily: "var(--font-body)" }}>
                <p className="font-medium text-foreground">{order.customer_name}</p>
                <p className="text-muted-foreground text-sm">{order.customer_email}</p>
                <p className="text-muted-foreground text-sm mt-2">
                  {typeof order.items === "object" && "shipping_address" in order.items
                    ? (order.items as any).shipping_address
                    : "Address information not available"}
                </p>
              </div>
            </div>

            {/* Email Notification */}
            <div className="bg-primary/5 rounded-xl p-5 border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm" style={{ fontFamily: "var(--font-body)" }}>
                    Check your inbox
                  </p>
                  <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "var(--font-body)" }}>
                    We've sent order confirmation and tracking details to {order.customer_email}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/account/orders" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  View Order Details
                </Button>
              </Link>
              <Link href="/shop" className="flex-1">
                <Button className="w-full">
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="max-w-2xl mx-auto mt-10 sm:mt-12 text-center">
          <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
            Have questions about your order?{" "}
            <Link href="/contact" className="text-primary hover:underline font-medium">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
