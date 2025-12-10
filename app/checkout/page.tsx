"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Truck, Lock, ChevronDown, Banknote, Ticket, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { getCurrentUser, getAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface CartItem {
  id: number; name: string; price: number; quantity: number
  size?: string; color?: string; image?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [showOrderSummary, setShowOrderSummary] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: number, discount: number, code: string } | null>(null)
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "", country: "India",
  })
  const [shippingSettings, setShippingSettings] = useState({ free_delivery_minimum: 800, delivery_charge: 85 })

  useEffect(() => {
    const cart = typeof window !== "undefined" ? localStorage.getItem("cart") : null
    if (cart) { setCartItems(JSON.parse(cart)) } else { router.push("/cart") }

    // Load applied coupon from cart page
    const savedCoupon = typeof window !== "undefined" ? localStorage.getItem("appliedCoupon") : null
    if (savedCoupon) { setAppliedCoupon(JSON.parse(savedCoupon)) }

    const user = getCurrentUser()
    if (user) {
      setFormData(prev => ({ ...prev, firstName: user.first_name, lastName: user.last_name, email: user.email }))
    }

    // Load saved address from addresses page
    const savedAddresses = typeof window !== "undefined" ? localStorage.getItem("savedAddresses") : null
    if (savedAddresses) {
      const addresses = JSON.parse(savedAddresses)
      const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0]
      if (defaultAddress) {
        const [firstName, ...lastNameParts] = (defaultAddress.name || "").split(" ")
        setFormData(prev => ({
          ...prev,
          firstName: prev.firstName || firstName || "",
          lastName: prev.lastName || lastNameParts.join(" ") || "",
          phone: prev.phone || defaultAddress.phone || "",
          address: defaultAddress.address || "",
          city: defaultAddress.city || "",
          state: defaultAddress.state || "",
          zip: defaultAddress.zip || "",
          country: defaultAddress.country || "India"
        }))
      }
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
  }, [router])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = appliedCoupon?.discount || 0
  const shippingCost = subtotal >= shippingSettings.free_delivery_minimum ? 0 : shippingSettings.delivery_charge
  const tax = Math.round((subtotal - discount) * 0.04)
  const total = subtotal - discount + shippingCost + tax

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, order_total: subtotal })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Invalid coupon')

      setAppliedCoupon({ id: data.coupon_id, discount: data.discount, code: couponCode.toUpperCase() })
      toast({ title: "Coupon Applied", description: `You saved ₹${data.discount.toFixed(0)}!` })
      setCouponCode("")
    } catch (error: any) {
      toast({ title: "Invalid Coupon", description: error.message, variant: "destructive" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone ||
      !formData.address || !formData.city || !formData.state || !formData.zip) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    setIsProcessing(true)

    try {
      // For online payment, create Razorpay order first
      if (paymentMethod === "online") {
        // Create Razorpay order
        const paymentResponse = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total })
        })

        if (!paymentResponse.ok) {
          const error = await paymentResponse.json()
          throw new Error(error.detail || 'Failed to create payment order')
        }

        const paymentData = await paymentResponse.json()

        // Load Razorpay script if not already loaded
        if (!(window as any).Razorpay) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = resolve
            script.onerror = reject
            document.body.appendChild(script)
          })
        }

        // Open Razorpay checkout
        const options = {
          key: paymentData.key_id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: 'Vurel',
          description: 'Order Payment',
          order_id: paymentData.order_id,
          handler: async function (response: any) {
            try {
              // Verify payment
              const verifyResponse = await fetch(`${API_BASE_URL}/api/payment/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              })

              const verifyData = await verifyResponse.json()
              if (!verifyData.verified) throw new Error('Payment verification failed')

              // Now place the order with payment_id
              await placeOrder(response.razorpay_payment_id)
            } catch (err: any) {
              toast({ title: "Payment Failed", description: err.message, variant: "destructive" })
              setIsProcessing(false)
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone
          },
          theme: { color: '#2E5E99' },
          modal: {
            ondismiss: function () {
              setIsProcessing(false)
            }
          }
        }

        const razorpay = new (window as any).Razorpay(options)
        razorpay.open()
        return // Don't proceed further, handler will call placeOrder
      }

      // For COD, place order directly
      await placeOrder(null)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
      setIsProcessing(false)
    }
  }

  const placeOrder = async (paymentId: string | null) => {
    try {
      const user = getCurrentUser()
      const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}, ${formData.country}`

      const orderData = {
        customer_id: user?.id || null,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        items: cartItems,
        total: total,
        shipping_address: shippingAddress,
        payment_method: paymentMethod === "online" ? "razorpay" : "cod",
        payment_id: paymentId,
        coupon_id: appliedCoupon?.id || null,
        discount: discount
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (user) headers['Authorization'] = `Bearer ${getAuthToken()}`

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST', headers, body: JSON.stringify(orderData)
      })

      const order = await response.json()
      if (!response.ok) throw new Error(order.detail || 'Failed to place order')

      // Clear cart and coupon
      localStorage.removeItem("cart")
      localStorage.removeItem("appliedCoupon")

      // Auto-login if account was created or token returned
      if (order.access_token && order.user) {
        localStorage.setItem('token', order.access_token)
        localStorage.setItem('user', JSON.stringify(order.user))
        window.dispatchEvent(new Event('storage'))
      }

      toast({
        title: "🎉 Order Placed Successfully!",
        description: order.account_created
          ? `Order #${order.id} confirmed! Your account has been created.`
          : `Order #${order.id} confirmed! Thank you for shopping.`
      })
      router.push(`/order-confirmation?orderId=${order.id}`)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setIsProcessing(false) }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-10">
        <Link href="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back to Cart</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6 sm:mb-10">Checkout</h1>

        {/* Mobile Order Summary Toggle */}
        <button onClick={() => setShowOrderSummary(!showOrderSummary)}
          className="w-full lg:hidden flex items-center justify-between bg-card border border-border rounded-xl p-4 mb-6">
          <span className="font-medium text-foreground">Order Summary ({cartItems.length} items)</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">₹{total.toFixed(0)}</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${showOrderSummary ? "rotate-180" : ""}`} />
          </div>
        </button>

        {showOrderSummary && (
          <div className="lg:hidden bg-card border border-border rounded-xl p-4 mb-6 space-y-4">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
                <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">{item.quantity}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.size} / {item.color}</p>
                  <p className="text-sm font-medium mt-1">₹{(item.price * item.quantity).toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <section className="bg-card rounded-xl p-5 sm:p-6 border border-border">
                <h2 className="text-lg font-bold text-foreground mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="your@email.com" required className="mt-1.5"
                      value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+91 98765 43210" required className="mt-1.5"
                      value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section className="bg-card rounded-xl p-5 sm:p-6 border border-border">
                <h2 className="text-lg font-bold text-foreground mb-4">Shipping Address</h2>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" required className="mt-1.5"
                        value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" required className="mt-1.5"
                        value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="123 Main Street" required className="mt-1.5"
                      value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="Mumbai" required className="mt-1.5"
                        value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" placeholder="Maharashtra" required className="mt-1.5"
                        value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="zip">PIN Code</Label>
                      <Input id="zip" placeholder="400001" required className="mt-1.5"
                        value={formData.zip} onChange={(e) => setFormData({ ...formData, zip: e.target.value })} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section className="bg-card rounded-xl p-5 sm:p-6 border border-border">
                <h2 className="text-lg font-bold text-foreground mb-4">Payment Method</h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <RadioGroupItem value="cod" />
                    <Banknote className="w-5 h-5 text-green-600" />
                    <div>
                      <span className="font-medium">Cash on Delivery (COD)</span>
                      <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <RadioGroupItem value="online" />
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-medium">Pay Online</span>
                      <p className="text-sm text-muted-foreground">Credit/Debit Card, UPI, NetBanking, Wallets</p>
                    </div>
                  </label>
                </RadioGroup>
              </section>

              {/* Mobile Submit */}
              <div className="lg:hidden">
                <Button type="submit" size="lg" className="w-full text-base" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : paymentMethod === "cod" ? `Place Order - ₹${total.toFixed(0)}` : `Pay ₹${total.toFixed(0)}`}
                </Button>
              </div>
            </form>
          </div>

          {/* Desktop Order Summary */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="bg-card rounded-xl p-6 border border-border sticky top-24">
              <h2 className="text-lg font-bold text-foreground mb-5">Order Summary</h2>

              <div className="space-y-4 mb-5">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      {/* Watermark */}
                      <div className="absolute bottom-1 left-1 pointer-events-none">
                        <span className="text-white/50 text-[6px] font-bold tracking-widest uppercase select-none" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Vurel</span>
                      </div>
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.size} / {item.color}</p>
                      <p className="text-sm font-medium mt-1">₹{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-5" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">₹{subtotal.toFixed(0)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toFixed(0)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : ''}`}>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="font-medium">₹{tax}</span></div>
              </div>

              <Separator className="my-5" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">₹{total.toFixed(0)}</span>
              </div>

              <Button type="submit" size="lg" className="w-full text-base" disabled={isProcessing} onClick={handleSubmit}>
                {isProcessing ? "Processing..." : paymentMethod === "cod" ? `Place Order` : `Pay ₹${total.toFixed(0)}`}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" /><span>Secured checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
