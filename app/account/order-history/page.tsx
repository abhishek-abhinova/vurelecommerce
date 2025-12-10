"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Package, Calendar, CheckCircle, ArrowLeft, ShoppingBag } from "lucide-react"
import { getCurrentUser, getAuthToken } from "@/lib/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Order {
    id: number
    total: number
    status: string
    items: any[]
    created_at: string
    completed_at: string | null
}

export default function OrderHistoryPage() {
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const user = getCurrentUser()
        if (!user) { router.push("/login"); return }

        setTimeout(() => fetchOrders(), 300)
    }, [router])

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/orders`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            })
            if (response.ok) {
                const data = await response.json()
                // Filter only Delivered orders for history
                const completedOrders = data.filter((o: Order) => o.status === 'Delivered')
                setOrders(completedOrders)
            }
        } catch (error) {
            console.error('Failed to fetch orders')
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-"
        const date = new Date(dateString)
        return date.toLocaleDateString("en-IN", {
            year: "numeric", month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit"
        })
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#E7F0FA] py-8 sm:py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/account" className="text-[#2E5E99] hover:text-[#0D2440]">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-[#0D2440]">Order History</h1>
                            <p className="text-[#2E5E99] text-sm">Your completed orders</p>
                        </div>
                    </div>

                    {/* Orders List */}
                    {isLoading ? (
                        <div className="bg-white rounded-xl p-12 text-center">
                            <p className="text-muted-foreground">Loading order history...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center">
                            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">No completed orders yet</h3>
                            <p className="text-gray-400 mb-4">Your delivered orders will appear here</p>
                            <Link href="/shop" className="text-[#2E5E99] hover:underline">Continue Shopping</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                    {/* Order Header */}
                                    <div className="p-4 sm:p-5 border-b bg-gray-50">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[#0D2440]">Order #{order.id}</p>
                                                    <p className="text-sm text-green-600">Delivered</p>
                                                </div>
                                            </div>
                                            <div className="text-lg font-bold text-green-600">₹{order.total.toFixed(2)}</div>
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <div className="p-4 sm:p-5">
                                        {/* Dates */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-500">Ordered:</span>
                                                <span className="text-[#0D2440]">{formatDate(order.created_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                <span className="text-gray-500">Delivered:</span>
                                                <span className="text-green-600">{formatDate(order.completed_at)}</span>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="border-t pt-4">
                                            <p className="text-sm text-gray-500 mb-3">{order.items.length} item(s)</p>
                                            <div className="flex flex-wrap gap-2">
                                                {order.items.slice(0, 4).map((item: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                                        {item.image && (
                                                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                                                        )}
                                                        <div className="text-xs">
                                                            <p className="font-medium text-[#0D2440] line-clamp-1">{item.name}</p>
                                                            <p className="text-gray-500">x{item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.items.length > 4 && (
                                                    <div className="flex items-center justify-center bg-gray-100 rounded-lg px-3">
                                                        <span className="text-sm text-gray-500">+{order.items.length - 4} more</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}
