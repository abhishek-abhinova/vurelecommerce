"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, Package, Truck, Mail, ArrowRight, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { userOrdersAPI, getCurrentUser, authAPI, Order } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

function OrderConfirmationContent() {
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
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Thank you for your purchase. We've sent a confirmation email to{" "}
            <span className="font-medium text-foreground">{order.customer_email}</span>
          </p>
        </div>

        <div className="max-w-lg mx-auto mb-8">
          <div className="bg-card rounded-xl p-4 sm:p-5 border border-border text-center">
            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span className="text-lg sm:text-xl font-bold text-primary tracking-wider">
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

        <div className="text-center">
          <Link href="/shop">
            <Button className="w-full max-w-md">
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  )
}