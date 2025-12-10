"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronDown, ChevronUp, Package, MapPin, CreditCard, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ordersAPI, getCurrentUser, authAPI, Order } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "RTO", "Return"]

export default function AdminOrders() {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isLoading, setIsLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || !user.is_admin) { router.push("/login"); return }
    fetchOrders()
  }, [router])

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAll()
      setOrders(data)
    } catch (error: any) {
      if (error.message.includes("401") || error.message.includes("403")) {
        authAPI.logout(); router.push("/login")
      } else {
        toast({ title: "Error", description: "Failed to load orders", variant: "destructive" })
      }
    } finally { setIsLoading(false) }
  }

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await ordersAPI.update(orderId, { status: newStatus })
      toast({ title: "Success", description: "Order status updated" })
      fetchOrders()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Delivered': 'bg-green-100 text-green-800',
      'Shipped': 'bg-blue-100 text-blue-800',
      'Processing': 'bg-purple-100 text-purple-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'RTO': 'bg-orange-100 text-orange-800',
      'Return': 'bg-pink-100 text-pink-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      (order.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_email || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) return <div className="p-4 md:p-8 flex items-center justify-center min-h-screen"><p className="text-muted-foreground">Loading...</p></div>

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
        <p className="text-sm md:text-base text-muted-foreground">Manage and track customer orders</p>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              {ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No orders found</CardContent></Card>
        ) : filteredOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Order Header - Mobile Optimized */}
              <div
                className="p-4 cursor-pointer active:bg-muted/50"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                {/* Top Row: Order ID, Status, Expand Icon */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">#{order.id}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                  </div>
                  {expandedOrder === order.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>

                {/* Customer Info Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{order.customer_name || 'Guest'}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                    <span className="font-bold">₹{order.total?.toFixed(0)}</span>
                  </div>
                </div>

                {/* Quick Status Change */}
                <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                  <Select value={order.status} onValueChange={(value) => handleStatusUpdate(order.id, value)}>
                    <SelectTrigger className="w-full h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Expanded Details - Compact Layout */}
              {expandedOrder === order.id && (
                <div className="border-t p-3 bg-muted/30 space-y-2">
                  {/* Customer & Payment Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Customer Info */}
                    <div className="bg-white rounded-lg p-2 border">
                      <h4 className="font-semibold text-xs mb-1 flex items-center gap-1 text-primary">
                        <User className="h-3 w-3" /> Customer
                      </h4>
                      <div className="text-xs space-y-0.5">
                        <p><span className="text-muted-foreground">Name:</span> <span className="font-medium">{order.customer_name || 'Guest'}</span></p>
                        <p><span className="text-muted-foreground">Email:</span> {order.customer_email}</p>
                        <p><span className="text-muted-foreground">Phone:</span> {(order as any).customer_phone || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-white rounded-lg p-2 border">
                      <h4 className="font-semibold text-xs mb-1 flex items-center gap-1 text-primary">
                        <CreditCard className="h-3 w-3" /> Payment
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.payment_method === 'cod' || order.payment_method === 'COD'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {order.payment_method?.toUpperCase() || 'COD'}
                      </span>
                    </div>
                  </div>

                  {/* Shipping Address - Parsed Format */}
                  <div className="bg-white rounded-lg p-2 border">
                    <h4 className="font-semibold text-xs mb-1 flex items-center gap-1 text-primary">
                      <MapPin className="h-3 w-3" /> Shipping Address
                    </h4>
                    {order.shipping_address ? (
                      <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-0.5">
                        {(() => {
                          // Parse address: "Address, City, State PIN, Country"
                          const parts = order.shipping_address.split(',').map((p: string) => p.trim())
                          const address = parts[0] || ''
                          const city = parts[1] || ''
                          const statePin = parts[2] || ''
                          const country = parts[3] || 'India'
                          const [state, pin] = statePin.includes(' ') ? [statePin.split(' ')[0], statePin.split(' ')[1]] : [statePin, '']

                          return (
                            <>
                              <p><span className="text-muted-foreground">Address:</span> <span className="font-medium">{address || 'N/A'}</span></p>
                              <p><span className="text-muted-foreground">City:</span> <span className="font-medium">{city || 'N/A'}</span></p>
                              <p><span className="text-muted-foreground">State:</span> <span className="font-medium">{state || 'N/A'}</span></p>
                              <p><span className="text-muted-foreground">PIN:</span> <span className="font-medium">{pin || 'N/A'}</span></p>
                              <p><span className="text-muted-foreground">Country:</span> <span className="font-medium">{country}</span></p>
                            </>
                          )
                        })()}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Not provided</p>
                    )}
                  </div>

                  {/* Products - Compact */}
                  <div className="bg-white rounded-lg p-2 border">
                    <h4 className="font-semibold text-xs mb-2 flex items-center gap-1 text-primary">
                      <Package className="h-3 w-3" /> Products ({Array.isArray(order.items) ? order.items.length : 0})
                    </h4>
                    <div className="space-y-2">
                      {Array.isArray(order.items) && order.items.length > 0 ? order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-2 pb-2 border-b last:border-0 last:pb-0">
                          {item.image && (
                            <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 text-xs">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-muted-foreground">
                              {item.size && `${item.size}`} {item.color && `/ ${item.color}`} × {item.quantity}
                            </p>
                          </div>
                          <span className="font-medium text-xs">₹{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      )) : <p className="text-xs text-muted-foreground">No items</p>}
                    </div>

                    {/* Total */}
                    <div className="mt-2 pt-2 border-t flex justify-between items-center text-sm">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-primary">₹{order.total?.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
