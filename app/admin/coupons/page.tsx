"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit2, Ticket, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getCurrentUser, authAPI, getAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Coupon {
    id: number; code: string; discount_type: string; discount_value: number
    min_order_amount: number; max_uses: number | null; used_count: number
    expires_at: string | null; is_active: boolean; created_at: string
}

export default function AdminCoupons() {
    const router = useRouter()
    const { toast } = useToast()
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
    const [form, setForm] = useState({
        code: "", discount_type: "percentage", discount_value: 10,
        min_order_amount: 0, max_uses: "", expires_at: ""
    })

    useEffect(() => {
        const user = getCurrentUser()
        if (!user || !user.is_admin) { router.push("/login"); return }
        fetchCoupons()
    }, [router])

    const fetchCoupons = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/coupons`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            })
            if (response.ok) setCoupons(await response.json())
        } catch { } finally { setIsLoading(false) }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const url = editingCoupon
                ? `${API_BASE_URL}/api/admin/coupons/${editingCoupon.id}`
                : `${API_BASE_URL}/api/admin/coupons`
            const response = await fetch(url, {
                method: editingCoupon ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
                body: JSON.stringify({
                    ...form,
                    max_uses: form.max_uses ? parseInt(form.max_uses) : null,
                    expires_at: form.expires_at || null
                })
            })
            if (!response.ok) throw new Error('Failed to save coupon')
            toast({ title: "Success", description: `Coupon ${editingCoupon ? 'updated' : 'created'}` })
            setDialogOpen(false)
            resetForm()
            fetchCoupons()
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally { setIsSaving(false) }
    }

    const deleteCoupon = async (id: number) => {
        if (!confirm('Delete this coupon?')) return
        try {
            await fetch(`${API_BASE_URL}/api/admin/coupons/${id}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            })
            fetchCoupons()
        } catch { }
    }

    const toggleActive = async (coupon: Coupon) => {
        await fetch(`${API_BASE_URL}/api/admin/coupons/${coupon.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
            body: JSON.stringify({ is_active: !coupon.is_active })
        })
        fetchCoupons()
    }

    const resetForm = () => {
        setForm({ code: "", discount_type: "percentage", discount_value: 10, min_order_amount: 0, max_uses: "", expires_at: "" })
        setEditingCoupon(null)
    }

    const openEditDialog = (coupon: Coupon) => {
        setEditingCoupon(coupon)
        setForm({
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_order_amount: coupon.min_order_amount,
            max_uses: coupon.max_uses?.toString() || "",
            expires_at: coupon.expires_at?.split('T')[0] || ""
        })
        setDialogOpen(true)
    }

    if (isLoading) return <div className="p-8 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Coupons</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Manage discount coupons</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" /> Create Coupon</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCoupon ? 'Edit' : 'Create'} Coupon</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Coupon Code</label>
                                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE20" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Discount Type</label>
                                    <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                            <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Discount Value</label>
                                    <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) })} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Min Order (₹)</label>
                                    <Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: parseFloat(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Usage Limit</label>
                                    <Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Unlimited" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Expiry Date</label>
                                <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} {editingCoupon ? 'Update' : 'Create'} Coupon
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {coupons.length === 0 ? (
                    <Card><CardContent className="py-12 text-center text-muted-foreground">No coupons yet</CardContent></Card>
                ) : coupons.map((coupon) => (
                    <Card key={coupon.id} className={!coupon.is_active ? 'opacity-60' : ''}>
                        <CardContent className="py-4 px-4 sm:px-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base sm:text-lg">{coupon.code}</h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : `₹${coupon.discount_value} off`}
                                            {coupon.min_order_amount > 0 && ` • Min ₹${coupon.min_order_amount}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pl-13 sm:pl-0">
                                    <div className="text-left sm:text-right text-xs sm:text-sm">
                                        <p>Used: {coupon.used_count}{coupon.max_uses ? `/${coupon.max_uses}` : ''}</p>
                                        {coupon.expires_at && <p className="text-muted-foreground">Exp: {new Date(coupon.expires_at).toLocaleDateString()}</p>}
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <Switch checked={coupon.is_active} onCheckedChange={() => toggleActive(coupon)} />
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(coupon)}><Edit2 className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => deleteCoupon(coupon.id)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
