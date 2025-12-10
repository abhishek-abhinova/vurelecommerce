"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Star, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getCurrentUser, authAPI, getAuthToken, productsAPI, Product } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Review {
    id: number; product_id: number; product_name: string; reviewer_name: string
    rating: number; review_text: string; is_verified: boolean; is_admin_review: boolean; created_at: string
}

export default function AdminReviews() {
    const router = useRouter()
    const { toast } = useToast()
    const [reviews, setReviews] = useState<Review[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [form, setForm] = useState({ product_id: "", reviewer_name: "", rating: 5, review_text: "" })

    useEffect(() => {
        const user = getCurrentUser()
        if (!user || !user.is_admin) { router.push("/login"); return }
        Promise.all([fetchReviews(), fetchProducts()])
    }, [router])

    const fetchReviews = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/reviews`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            })
            if (response.ok) setReviews(await response.json())
        } catch { } finally { setIsLoading(false) }
    }

    const fetchProducts = async () => {
        try { setProducts(await productsAPI.getAll()) } catch { }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
                body: JSON.stringify({ ...form, product_id: parseInt(form.product_id) })
            })
            if (!response.ok) throw new Error('Failed to create review')
            toast({ title: "Success", description: "Review created" })
            setDialogOpen(false)
            setForm({ product_id: "", reviewer_name: "", rating: 5, review_text: "" })
            fetchReviews()
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally { setIsSaving(false) }
    }

    const toggleVerify = async (review: Review) => {
        await fetch(`${API_BASE_URL}/api/admin/reviews/${review.id}/verify`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
            body: JSON.stringify({ verified: !review.is_verified })
        })
        fetchReviews()
    }

    const deleteReview = async (id: number) => {
        if (!confirm('Delete this review?')) return
        await fetch(`${API_BASE_URL}/api/admin/reviews/${id}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        })
        fetchReviews()
    }

    const renderStars = (rating: number) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`h-4 w-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            ))}
        </div>
    )

    if (isLoading) return <div className="p-8 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Reviews</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Manage product reviews ({reviews.filter(r => !r.is_verified).length} pending)</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" /> Add Review</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add Review</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Product</label>
                                <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Reviewer Name</label>
                                <Input value={form.reviewer_name} onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })} placeholder="Customer Name" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Rating</label>
                                <div className="flex gap-2 mt-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <button key={i} type="button" onClick={() => setForm({ ...form, rating: i })}>
                                            <Star className={`h-6 w-6 ${i <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Review Text</label>
                                <Textarea value={form.review_text} onChange={(e) => setForm({ ...form, review_text: e.target.value })} rows={3} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSaving || !form.product_id}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Add Review
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <Card><CardContent className="py-12 text-center text-muted-foreground">No reviews yet</CardContent></Card>
                ) : reviews.map((review) => (
                    <Card key={review.id} className={!review.is_verified ? 'border-yellow-300 bg-yellow-50/50' : ''}>
                        <CardContent className="py-4 px-4 sm:px-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="font-semibold text-sm sm:text-base">{review.reviewer_name}</span>
                                        {renderStars(review.rating)}
                                        {review.is_admin_review && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Admin</span>}
                                        {!review.is_verified && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Pending</span>}
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Product: {review.product_name}</p>
                                    <p className="text-xs sm:text-sm break-words">{review.review_text || <em className="text-muted-foreground">No review text</em>}</p>
                                    <p className="text-xs text-muted-foreground mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button variant={review.is_verified ? "outline" : "default"} size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={() => toggleVerify(review)}>
                                        {review.is_verified ? <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> : <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />}
                                        <span className="hidden sm:inline">{review.is_verified ? 'Unverify' : 'Verify'}</span>
                                        <span className="sm:hidden">{review.is_verified ? 'X' : '✓'}</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => deleteReview(review.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
