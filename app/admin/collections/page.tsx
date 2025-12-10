"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Edit, Trash2, Eye, EyeOff, Home, Upload, Check, X, Loader2, Grid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { collectionsAPI, productsAPI, getCurrentUser, authAPI, Collection, Product, getAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function AdminCollections() {
    const router = useRouter()
    const { toast } = useToast()
    const [collections, setCollections] = useState<Collection[]>([])
    const [allProducts, setAllProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false)
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const coverImageRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        title: "", description: "", cover_image: "", format_type: "short" as "short" | "long"
    })

    useEffect(() => {
        const user = getCurrentUser()
        if (!user || !user.is_admin) { router.push("/login"); return }
        fetchData()
    }, [router])

    const fetchData = async () => {
        try {
            const [cols, prods] = await Promise.all([collectionsAPI.adminGetAll(), productsAPI.getAll()])
            setCollections(cols)
            setAllProducts(prods)
        } catch (error: any) {
            if (error.message?.includes("401")) { authAPI.logout(); router.push("/login") }
            else toast({ title: "Error", description: "Failed to load data", variant: "destructive" })
        } finally { setIsLoading(false) }
    }

    const uploadImage = async (file: File): Promise<string | null> => {
        const fd = new FormData()
        fd.append('file', file)
        try {
            const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${getAuthToken()}` }, body: fd
            })
            if (!response.ok) throw new Error('Upload failed')
            return (await response.json()).url
        } catch { return null }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIsUploading(true)
        const url = await uploadImage(file)
        if (url) setFormData(prev => ({ ...prev, cover_image: url }))
        setIsUploading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingCollection) {
                await collectionsAPI.update(editingCollection.id, formData)
                toast({ title: "Success", description: "Collection updated" })
            } else {
                await collectionsAPI.create(formData)
                toast({ title: "Success", description: "Collection created" })
            }
            closeDialog()
            fetchData()
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this collection?")) return
        try {
            await collectionsAPI.delete(id)
            toast({ title: "Success", description: "Collection deleted" })
            fetchData()
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        }
    }

    const toggleHomeDisplay = async (collection: Collection) => {
        try {
            await collectionsAPI.update(collection.id, { show_on_home: !collection.show_on_home })
            toast({ title: "Success", description: collection.show_on_home ? "Removed from home" : "Added to home" })
            fetchData()
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        }
    }

    const toggleActive = async (collection: Collection) => {
        try {
            await collectionsAPI.update(collection.id, { is_active: !collection.is_active })
            fetchData()
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        }
    }

    const openProductsDialog = async (collection: Collection) => {
        setSelectedCollection(collection)
        try {
            const products = await collectionsAPI.getProducts(collection.id)
            setSelectedProductIds(products.map(p => p.id))
        } catch { setSelectedProductIds([]) }
        setIsProductsDialogOpen(true)
    }

    const saveProducts = async () => {
        if (!selectedCollection) return
        try {
            await collectionsAPI.setProducts(selectedCollection.id, selectedProductIds)
            toast({ title: "Success", description: "Products updated" })
            setIsProductsDialogOpen(false)
            fetchData()
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        }
    }

    const toggleProduct = (productId: number) => {
        setSelectedProductIds(prev =>
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        )
    }

    const openEdit = (collection: Collection) => {
        setEditingCollection(collection)
        setFormData({
            title: collection.title, description: collection.description || "",
            cover_image: collection.cover_image || "", format_type: collection.format_type
        })
        setIsDialogOpen(true)
    }

    const closeDialog = () => {
        setIsDialogOpen(false)
        setEditingCollection(null)
        setFormData({ title: "", description: "", cover_image: "", format_type: "short" })
    }

    const homeCollections = collections.filter(c => c.show_on_home)

    if (isLoading) return <div className="p-8 flex items-center justify-center"><p>Loading...</p></div>

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Collections</h1>
                    <p className="text-muted-foreground">Manage product collections | Home: {homeCollections.length}/3</p>
                </div>
                <Button onClick={() => { closeDialog(); setIsDialogOpen(true) }}><Plus className="h-4 w-4 mr-2" /> New Collection</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {collections.map((col) => (
                    <Card key={col.id} className={!col.is_active ? "opacity-60" : ""}>
                        <div className="relative h-40 bg-muted rounded-t-lg overflow-hidden">
                            {col.cover_image ? (
                                <Image src={col.cover_image} alt={col.title} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground"><Grid className="w-12 h-12" /></div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <span className={`px-2 py-0.5 text-xs rounded ${col.format_type === 'short' ? 'bg-blue-500' : 'bg-purple-500'} text-white`}>
                                    {col.format_type}
                                </span>
                                {col.show_on_home && <span className="px-2 py-0.5 text-xs rounded bg-green-500 text-white">Home</span>}
                            </div>
                        </div>
                        <CardContent className="pt-4">
                            <h3 className="font-semibold text-lg">{col.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{col.description || "No description"}</p>
                            <p className="text-sm font-medium mt-2">{col.product_count} products</p>
                            <div className="flex gap-2 mt-4 flex-wrap">
                                <Button variant="outline" size="sm" onClick={() => openProductsDialog(col)}>
                                    <Grid className="h-3 w-3 mr-1" /> Products
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => toggleHomeDisplay(col)}
                                    className={col.show_on_home ? "text-green-600" : ""}>
                                    <Home className="h-3 w-3 mr-1" /> {col.show_on_home ? "On Home" : "Add Home"}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => openEdit(col)}><Edit className="h-3 w-3" /></Button>
                                <Button variant="outline" size="sm" onClick={() => toggleActive(col)}>
                                    {col.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDelete(col.id)} className="text-red-600">
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {collections.length === 0 && (
                    <Card className="col-span-full"><CardContent className="py-12 text-center text-muted-foreground">
                        No collections yet. Create your first collection.
                    </CardContent></Card>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingCollection ? "Edit" : "Create"} Collection</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Title *</label>
                            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Description</label>
                            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Format Type</label>
                            <div className="flex gap-2">
                                {(['short', 'long'] as const).map(type => (
                                    <button key={type} type="button" onClick={() => setFormData({ ...formData, format_type: type })}
                                        className={`flex-1 py-2 px-4 rounded border text-sm ${formData.format_type === type ? 'bg-[#2E5E99] text-white border-[#2E5E99]' : 'border-gray-300'}`}>
                                        {type === 'short' ? 'Short Video (9:16)' : 'Long Video (16:9)'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Cover Image</label>
                            <div className="flex gap-2 items-center">
                                <input type="file" ref={coverImageRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                                <Button type="button" variant="outline" size="sm" onClick={() => coverImageRef.current?.click()} disabled={isUploading}>
                                    {isUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />} Upload
                                </Button>
                                <Input placeholder="Or paste URL" value={formData.cover_image} onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })} className="flex-1" />
                            </div>
                            {formData.cover_image && (
                                <div className="relative w-20 h-20 mt-2 rounded overflow-hidden bg-muted">
                                    <Image src={formData.cover_image} alt="Cover" fill className="object-cover" />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                            <Button type="submit">{editingCollection ? "Update" : "Create"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Products Assignment Dialog */}
            <Dialog open={isProductsDialogOpen} onOpenChange={setIsProductsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader><DialogTitle>Manage Products - {selectedCollection?.title}</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Select products to include in this collection ({selectedProductIds.length} selected)</p>
                    <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-4">
                        {allProducts.map(product => (
                            <div key={product.id} onClick={() => toggleProduct(product.id)}
                                className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${selectedProductIds.includes(product.id) ? 'border-[#2E5E99] ring-2 ring-[#2E5E99]/30' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="aspect-square relative bg-muted">
                                    <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                                    {selectedProductIds.includes(product.id) && (
                                        <div className="absolute top-1 right-1 w-6 h-6 bg-[#2E5E99] rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-2"><p className="text-xs font-medium truncate">{product.name}</p><p className="text-xs text-muted-foreground">₹{product.price}</p></div>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsProductsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveProducts}>Save Products</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
