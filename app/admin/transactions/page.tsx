"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Banknote, RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCurrentUser, getAuthToken } from "@/lib/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Transaction {
  order_id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  amount: number
  payment_method: string
  payment_id: string
  status: string
  created_at: string
}

export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "cod" | "razorpay">("all")

  useEffect(() => {
    const user = getCurrentUser()
    if (!user?.is_admin) { router.push("/login"); return }
    fetchTransactions()
  }, [router])

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/admin/transactions`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      })
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Failed to fetch transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
      t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.order_id.toString().includes(searchTerm)

    const matchesFilter =
      filter === "all" ||
      (filter === "cod" && t.payment_method === "cod") ||
      (filter === "razorpay" && t.payment_method === "razorpay")

    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
  const codCount = transactions.filter(t => t.payment_method === "cod").length
  const onlineCount = transactions.filter(t => t.payment_method === "razorpay").length

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#f8f9fc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-muted-foreground text-sm">All payment transactions</p>
          </div>
          <Button onClick={fetchTransactions} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">{transactions.length}</p>
            <p className="text-sm font-semibold text-green-600">{formatPrice(totalAmount)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-green-600" />
              <p className="text-sm text-muted-foreground">COD Payments</p>
            </div>
            <p className="text-2xl font-bold">{codCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-muted-foreground">Online Payments</p>
            </div>
            <p className="text-2xl font-bold">{onlineCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, order ID, or payment ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
            <Button variant={filter === "cod" ? "default" : "outline"} size="sm" onClick={() => setFilter("cod")}>
              <Banknote className="w-4 h-4 mr-1" /> COD
            </Button>
            <Button variant={filter === "razorpay" ? "default" : "outline"} size="sm" onClick={() => setFilter("razorpay")}>
              <CreditCard className="w-4 h-4 mr-1" /> Online
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No transactions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Order ID</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Customer</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Payment Method</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Payment ID</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTransactions.map((t) => (
                    <tr key={t.order_id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm font-medium">#{t.order_id}</td>
                      <td className="p-4 text-sm">
                        <p className="font-medium">{t.customer_name}</p>
                        <p className="text-muted-foreground text-xs">{t.customer_email}</p>
                        {t.customer_phone && <p className="text-muted-foreground text-xs">{t.customer_phone}</p>}
                      </td>
                      <td className="p-4 text-sm font-bold text-green-600">{formatPrice(t.amount)}</td>
                      <td className="p-4">
                        {t.payment_method === "cod" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <Banknote className="w-3 h-3" /> COD
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <CreditCard className="w-3 h-3" /> Razorpay
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        {t.payment_id ? (
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{t.payment_id}</code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.status === "Delivered" ? "bg-green-100 text-green-700" :
                          t.status === "Processing" ? "bg-blue-100 text-blue-700" :
                            t.status === "Shipped" ? "bg-purple-100 text-purple-700" :
                              t.status === "Cancelled" ? "bg-red-100 text-red-700" :
                                "bg-yellow-100 text-yellow-700"
                          }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">{formatDate(t.created_at)}</td>
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
