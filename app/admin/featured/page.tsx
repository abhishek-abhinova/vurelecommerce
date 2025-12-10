"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Save, Check, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { productsAPI, getCurrentUser, getAuthToken, Product } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function AdminFeaturedProducts() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [allProducts, setAllProducts] = useState<Product[]>([])
    const [selectedIds, setSelectedIds] = useState<number[]>([])

    useEffect(() => {
        const user = getCurrentUser()
        if (!user || !user.is_admin) { router.push("/login"); return }

        Promise.all([
            productsAPI.getAll(),
            fetch(`${API_BASE_URL}/api/featured-products`).then(res => res.json())
        ]).then(([products, featured]) => {
            setAllProducts(products)
            setSelectedIds(featured.map((p: Product) => p.id))
        }).catch(() => { }).finally(() => setIsLoading(false))
    }, [router])

    const toggleProduct = (productId: number) => {
        setSelectedIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    const saveSettings = async () => {
        setIsSaving(true)
        try {
            // Get all products and update their featured status
            for (const product of allProducts) {
                const shouldBeFeatured = selectedIds.includes(product.id)
                const isFeatured = product.is_featured === true

                // Only update if status changed
                if (shouldBeFeatured !== isFeatured) {
                    await fetch(`${API_BASE_URL}/api/admin/products/${product.id}/featured`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`
                        },
                        body: JSON.stringify({ is_featured: shouldBeFeatured })
                    })
                }
            }
            toast({ title: "Success", description: "Featured products updated" })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally { setIsSaving(false) }
    }

    if (isLoading) return <div className="p-8 flex items-center justify-center"><p>Loading...</p></div>

    return (
        <div className="p-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Featured Products</h1>
                    <p className="text-muted-foreground">Select products to display in the Featured Products section ({selectedIds.length} selected)</p>
                </div>
                <Button onClick={saveSettings} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />{isSaving ? "Saving..." : "Save"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" /> Select Featured Products</CardTitle>
                    <CardDescription>Click to select/deselect products to feature on homepage</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {allProducts.map(product => (
                            <div key={product.id} onClick={() => toggleProduct(product.id)}
                                className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${selectedIds.includes(product.id) ? 'border-[#2E5E99] ring-2 ring-[#2E5E99]/30' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="aspect-square relative bg-muted">
                                    <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                                    {selectedIds.includes(product.id) && (
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#2E5E99] rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-2">
                                    <p className="text-sm font-medium truncate">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">₹{product.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {allProducts.length === 0 && <div className="text-center py-12 text-muted-foreground">No products available. Add products first.</div>}
                </CardContent>
            </Card>
        </div>
    )
}
