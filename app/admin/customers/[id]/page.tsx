"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Calendar, ShoppingBag, CreditCard, User, Package, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser, getAuthToken } from "@/lib/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Customer {
    id: number
    first_name: string
    last_name: string
    email: string
    phone?: string
    created_at: string
    total_orders: number
    total_spent: number
}

interface Order {
    id: number
    order_number: string
    status: string
    total: number
    created_at: string
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [addresses, setAddresses] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const user = getCurrentUser()
        if (!user?.is_admin) { router.push("/login"); return }
        fetchCustomerDetails()
    }, [router, resolvedParams.id])

    const fetchCustomerDetails = async () => {
        try {
            setIsLoading(true)
            const [customerRes, ordersRes, addressesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/admin/customers/${resolvedParams.id}`, {
                    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
                }),
                fetch(`${API_BASE_URL}/api/admin/customers/${resolvedParams.id}/orders`, {
                    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
                }),
                fetch(`${API_BASE_URL}/api/admin/customers/${resolvedParams.id}/addresses`, {
                    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
                })
            ])

            if (customerRes.ok) {
                setCustomer(await customerRes.json())
            }
            if (ordersRes.ok) {
                setOrders(await ordersRes.json())
            }
            if (addressesRes.ok) {
                setAddresses(await addressesRes.json())
            }
        } catch (error) {
            console.error("Failed to fetch customer details:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    }

    if (isLoading) return <div className="p-8 flex items-center justify-center"><p>Loading...</p></div>
    if (!customer) return <div className="p-8 flex items-center justify-center"><p>Customer not found</p></div>

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-[#f8f9fc] min-h-screen">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
                        <p className="text-muted-foreground text-sm">View customer account information</p>
                    </div>
                </div>

                {/* Customer Info Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" /> Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium text-lg">{customer.first_name} {customer.last_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium flex items-center gap-2"><Mail className="w-4 h-4" /> {customer.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> {customer.phone || "Not provided"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Member Since</p>
                                    <p className="font-medium flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatDate(customer.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Orders</p>
                                    <p className="text-2xl font-bold">{customer.total_orders || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Spent</p>
                                    <p className="text-2xl font-bold">₹{(parseFloat(String(customer.total_spent)) || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Saved Addresses */}
                {addresses.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" /> Saved Addresses
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map((address, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{address}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Order History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" /> Order History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {orders.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No orders yet</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="text-left p-3 text-sm font-medium text-gray-600">Order #</th>
                                            <th className="text-left p-3 text-sm font-medium text-gray-600">Date</th>
                                            <th className="text-left p-3 text-sm font-medium text-gray-600">Status</th>
                                            <th className="text-left p-3 text-sm font-medium text-gray-600">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                                                <td className="p-3 font-medium">{order.order_number}</td>
                                                <td className="p-3 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 font-semibold">₹{(parseFloat(String(order.total)) || 0).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
