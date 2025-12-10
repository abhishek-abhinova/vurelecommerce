"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Mail, Calendar, ShoppingBag, CreditCard, RefreshCw, Users, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCurrentUser, getAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Customer {
  id: number
  first_name: string
  last_name: string
  email: string
  created_at: string
  total_orders: number
  total_spent: number
}

export default function AdminCustomers() {
  const router = useRouter()
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user?.is_admin) { router.push("/login"); return }
    fetchCustomers()
  }, [router])

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/admin/customers`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      })
      if (!response.ok) throw new Error('Failed to load customers')
      const data = await response.json()
      setCustomers(data)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
  }

  const filteredCustomers = customers.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalSpent = customers.reduce((sum, c) => sum + (parseFloat(String(c.total_spent)) || 0), 0)
  const totalOrders = customers.reduce((sum, c) => sum + (parseInt(String(c.total_orders)) || 0), 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#f8f9fc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-muted-foreground text-sm">View and manage your customer base</p>
          </div>
          <Button onClick={fetchCustomers} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-muted-foreground">Total Customers</p>
            </div>
            <p className="text-2xl font-bold mt-1">{customers.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-green-600" />
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
            <p className="text-2xl font-bold mt-1">{totalOrders}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <p className="text-2xl font-bold mt-1">₹{totalSpent.toFixed(2)}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search customers..." className="pl-10"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No customers found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Customer</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Joined</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Orders</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Total Spent</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                            {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{customer.first_name} {customer.last_name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(customer.created_at)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          <ShoppingBag className="w-3 h-3" /> {customer.total_orders || 0}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-green-600">
                        ₹{(parseFloat(String(customer.total_spent)) || 0).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/customers/${customer.id}`)}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
