"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Minus, Plus, X, ShoppingBag, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/lib/api"
import { AuthModal } from "@/components/auth/auth-modal"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  image?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [promoCode, setPromoCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: number, discount: number, code: string } | null>(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [shippingSettings, setShippingSettings] = useState({ free_delivery_minimum: 800, delivery_charge: 85 })

  useEffect(() => {
    // Load cart from localStorage
    const cart = typeof window !== "undefined" ? localStorage.getItem("cart") : null
    if (cart) {
      setCartItems(JSON.parse(cart))
    }

    // Fetch shipping settings
    const fetchShippingSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings/shipping`)
        if (res.ok) {
          const data = await res.json()
          setShippingSettings(data)
        }
      } catch (e) { /* use defaults */ }
    }
    fetchShippingSettings()
  }, [])

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    const updated = cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    setCartItems(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(updated))
    }
  }

  const removeItem = (id: number) => {
    const updated = cartItems.filter((item) => item.id !== id)
    setCartItems(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(updated))
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = appliedCoupon?.discount || 0
  const shippingCost = subtotal >= shippingSettings.free_delivery_minimum ? 0 : shippingSettings.delivery_charge
  const tax = Math.round((subtotal - discount) * 0.04)
  const total = subtotal - discount + shippingCost + tax

  const applyPromo = async () => {
    if (!promoCode.trim()) return
    setIsApplyingCoupon(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, order_total: subtotal })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Invalid coupon')

      const coupon = { id: data.coupon_id, discount: data.discount, code: promoCode.toUpperCase() }
      setAppliedCoupon(coupon)
      // Store in localStorage so checkout can use it
      localStorage.setItem('appliedCoupon', JSON.stringify(coupon))
      toast({ title: "Coupon Applied!", description: `You saved ₹${data.discount.toFixed(0)}!` })
      setPromoCode("")
    } catch (error: any) {
      toast({ title: "Invalid Coupon", description: error.message, variant: "destructive" })
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    localStorage.removeItem('appliedCoupon')
  }

  const handleCheckout = () => {
    const user = getCurrentUser()
    if (!user) {
      setShowAuthModal(true)
    } else {
      router.push("/checkout")
    }
  }

  const handleAuthSuccess = () => {
    toast({ title: "Account Ready!", description: "Proceeding to checkout..." })
    router.push("/checkout")
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 sm:py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
            </div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground mb-8" style={{ fontFamily: "var(--font-body)" }}>
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link href="/shop">
              <Button size="lg" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-12">
          {/* Back button */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 sm:mb-8"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Continue Shopping</span>
          </Link>

          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6 sm:mb-10"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Shopping Cart
            <span className="text-muted-foreground text-lg sm:text-xl font-normal ml-2">
              ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
            </span>
          </h1>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-card rounded-xl p-4 sm:p-5 border border-border shadow-sm">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-24 sm:w-28 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      {/* Watermark */}
                      <div className="absolute bottom-1 left-1 pointer-events-none">
                        <span className="text-white/50 text-[8px] font-bold tracking-widest uppercase select-none" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Vurel</span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3
                            className="font-semibold text-foreground text-sm sm:text-base line-clamp-2"
                            style={{ fontFamily: "var(--font-sans)" }}
                          >
                            {item.name}
                          </h3>
                          <p
                            className="text-xs sm:text-sm text-muted-foreground mt-1"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            Size: {item.size} | Color: {item.color}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 hover:bg-muted rounded-full transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-end justify-between mt-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <span
                            className="w-8 text-center font-medium text-sm sm:text-base"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        <p
                          className="font-bold text-primary text-base sm:text-lg"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl p-5 sm:p-6 border border-border shadow-sm sticky top-24">
                <h2
                  className="text-lg sm:text-xl font-bold text-foreground mb-5"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Order Summary
                </h2>

                {/* Promo Code */}
                {!appliedCoupon ? (
                  <div className="flex gap-2 mb-5">
                    <Input
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1 text-sm"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                    <Button
                      variant="outline"
                      onClick={applyPromo}
                      disabled={isApplyingCoupon || !promoCode.trim()}
                      className="text-sm px-4 bg-transparent"
                    >
                      {isApplyingCoupon ? "..." : "Apply"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 text-green-700 p-3 rounded-lg mb-5 text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      ✓ {appliedCoupon.code} - ₹{appliedCoupon.discount.toFixed(0)} off
                    </span>
                    <button onClick={removeCoupon} className="text-green-700 hover:text-green-900">
                      ✕
                    </button>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Price Breakdown */}
                <div className="space-y-3" style={{ fontFamily: "var(--font-body)" }}>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(0)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : ''}`}>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">₹{tax}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold text-foreground" style={{ fontFamily: "var(--font-body)" }}>
                    Total
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-body)" }}>
                    ₹{total.toFixed(0)}
                  </span>
                </div>

                <Button size="lg" className="w-full text-base" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-border">
                  <div className="text-center">
                    <Truck className="w-5 h-5 mx-auto text-primary mb-1" />
                    <p
                      className="text-[10px] sm:text-xs text-muted-foreground"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Free Shipping
                    </p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-5 h-5 mx-auto text-primary mb-1" />
                    <p
                      className="text-[10px] sm:text-xs text-muted-foreground"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Secure Payment
                    </p>
                  </div>
                  <div className="text-center">
                    <RotateCcw className="w-5 h-5 mx-auto text-primary mb-1" />
                    <p
                      className="text-[10px] sm:text-xs text-muted-foreground"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Easy Returns
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        title="Create Account to Checkout"
        message="Sign up or login to complete your purchase"
      />
    </>
  )
}
