"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Save, Check, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { settingsAPI, productsAPI, getCurrentUser, authAPI, Product } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function AdminShopTheLook() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [allProducts, setAllProducts] = useState<Product[]>([])
    const [settings, setSettings] = useState<{ enabled: boolean; title: string; product_ids: number[] }>({ enabled: true, title: "Shop The Look", product_ids: [] })

    useEffect(() => {
        const user = getCurrentUser()
        if (!user || !user.is_admin) { router.push("/login"); return }
        Promise.all([settingsAPI.getShopTheLook(), productsAPI.getAll()])
            .then(([stl, products]) => { setSettings(stl); setAllProducts(products) })
            .catch(() => { })
            .finally(() => setIsLoading(false))
    }, [router])

    const toggleProduct = (productId: number) => {
        setSettings(prev => ({
            ...prev,
            product_ids: prev.product_ids.includes(productId)
                ? prev.product_ids.filter(id => id !== productId)
                : [...prev.product_ids, productId]
        }))
    }

    const saveSettings = async () => {
        setIsSaving(true)
        try {
            await settingsAPI.updateShopTheLook(settings)
            toast({ title: "Success", description: "Settings saved" })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally { setIsSaving(false) }
    }

    if (isLoading) return <div className="p-8 flex items-center justify-center"><p>Loading...</p></div>

    return (
        <div className="p-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Shop The Look</h1>
                    <p className="text-muted-foreground">Select products to display in this section ({settings.product_ids.length} selected)</p>
                </div>
                <Button onClick={saveSettings} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />{isSaving ? "Saving..." : "Save"}
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> Section Settings</CardTitle>
                            <CardDescription>Featured products showcase on homepage</CardDescription>
                        </div>
                        <Switch checked={settings.enabled} onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))} />
                    </div>
                </CardHeader>
                <CardContent>
                    <label className="text-sm font-medium mb-2 block">Section Title</label>
                    <Input value={settings.title} onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))} className="max-w-md" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Select Products</CardTitle>
                    <CardDescription>Click to select/deselect products</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {allProducts.map(product => (
                            <div key={product.id} onClick={() => toggleProduct(product.id)}
                                className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${settings.product_ids.includes(product.id) ? 'border-[#2E5E99] ring-2 ring-[#2E5E99]/30' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="aspect-square relative bg-muted">
                                    <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                                    {settings.product_ids.includes(product.id) && (
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
