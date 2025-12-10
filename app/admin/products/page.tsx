"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Search, Edit, Trash2, MoreHorizontal, X, Upload, Loader2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { productsAPI, categoriesAPI, getCurrentUser, authAPI, Product, Category, getAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
const DEFAULT_COLORS = [
  { name: "Beige", value: "#d4c4b0" },
  { name: "Navy", value: "#0D2440" },
  { name: "Sapphire", value: "#2E5E99" },
  { name: "White", value: "#FFFFFF" },
  { name: "Black", value: "#000000" },
  { name: "Cream", value: "#FFFDD0" },
  { name: "Brown", value: "#8B4513" },
  { name: "Gray", value: "#808080" },
]

interface GalleryImage {
  url: string;
  color: string | null; // null means applies to all colors
}

interface FormData {
  name: string; description: string; category: string; price: string; original_price: string; stock: string;
  image_url: string; colors: { name: string; value: string }[];
  sizes: string[]; gallery_images: GalleryImage[]; video_url: string;
  faqs: { question: string; answer: string }[]; related_products: number[];
}

const initialFormData: FormData = {
  name: "", description: "", category: "", price: "", original_price: "", stock: "",
  image_url: "", colors: [], sizes: [], gallery_images: [], video_url: "",
  faqs: [], related_products: [],
}

export default function AdminProducts() {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const [availableSizes, setAvailableSizes] = useState<string[]>([...DEFAULT_SIZES])
  const [availableColors, setAvailableColors] = useState([...DEFAULT_COLORS])

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [newColorName, setNewColorName] = useState("")
  const [newColorValue, setNewColorValue] = useState("#000000")
  const [newSize, setNewSize] = useState("")
  const [newGalleryUrl, setNewGalleryUrl] = useState("")

  const coverImageRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || !user.is_admin) { router.push("/login"); return }
    fetchProducts()
    fetchCategories()
  }, [router])

  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAll()
      setProducts(data)
    } catch (error: any) {
      if (error.message?.includes("401") || error.message?.includes("403")) {
        authAPI.logout(); router.push("/login")
      } else {
        toast({ title: "Error", description: "Failed to load products", variant: "destructive" })
      }
    } finally { setIsLoading(false) }
  }

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getGrouped()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories')
    }
  }

  const uploadFile = async (file: File, type: 'image' | 'video'): Promise<string | null> => {
    const fd = new FormData()
    fd.append('file', file)
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/${type === 'video' ? 'video' : 'image'}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        body: fd
      })
      if (!response.ok) throw new Error((await response.json()).detail || 'Upload failed')
      return (await response.json()).url
    } catch (error: any) {
      toast({ title: "Upload Error", description: error.message, variant: "destructive" })
      return null
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url' | 'video_url' | 'gallery') => {
    const files = e.target.files
    if (!files?.length) return
    setIsUploading(true)

    if (field === 'gallery') {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        const url = await uploadFile(file, 'image')
        if (url) urls.push(url)
      }
      if (urls.length) {
        setFormData(prev => ({ ...prev, gallery_images: [...prev.gallery_images, ...urls.map(url => ({ url, color: null }))] }))
        toast({ title: "Success", description: `${urls.length} image(s) uploaded` })
      }
    } else {
      const url = await uploadFile(files[0], field === 'video_url' ? 'video' : 'image')
      if (url) {
        setFormData(prev => ({ ...prev, [field]: url }))
        toast({ title: "Success", description: `${field === 'video_url' ? 'Video' : 'Image'} uploaded` })
      }
    }
    setIsUploading(false)
    e.target.value = ''
  }

  const updateFormField = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const addGalleryUrl = useCallback(() => {
    if (newGalleryUrl.trim()) {
      setFormData(prev => ({ ...prev, gallery_images: [...prev.gallery_images, { url: newGalleryUrl.trim(), color: null }] }))
      setNewGalleryUrl("")
    }
  }, [newGalleryUrl])

  const updateGalleryImageColor = useCallback((index: number, color: string | null) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.map((img, i) => i === index ? { ...img, color } : img)
    }))
  }, [])

  const addCustomColor = useCallback(() => {
    if (!newColorName.trim()) return
    const newColor = { name: newColorName.trim(), value: newColorValue }
    setAvailableColors(prev => [...prev, newColor])
    setFormData(prev => ({ ...prev, colors: [...prev.colors, newColor] }))
    setNewColorName("")
    setNewColorValue("#000000")
  }, [newColorName, newColorValue])

  const addCustomSize = useCallback(() => {
    const size = newSize.trim().toUpperCase()
    if (!size || availableSizes.includes(size)) return
    setAvailableSizes(prev => [...prev, size])
    setFormData(prev => ({ ...prev, sizes: [...prev.sizes, size] }))
    setNewSize("")
  }, [newSize, availableSizes])

  const toggleSize = useCallback((size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }))
  }, [])

  const toggleColor = useCallback((color: { name: string; value: string }) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.some(c => c.name === color.name)
        ? prev.colors.filter(c => c.name !== color.name)
        : [...prev.colors, color]
    }))
  }, [])

  const removeGalleryImage = useCallback((index: number) => {
    setFormData(prev => ({ ...prev, gallery_images: prev.gallery_images.filter((_, i) => i !== index) }))
  }, [])

  const handleSubmit = async (e: React.FormEvent, isEdit: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSaving(true)

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
      stock: parseInt(formData.stock),
      image_url: formData.image_url || undefined,
      colors: formData.colors.length > 0 ? formData.colors : undefined,
      sizes: formData.sizes.length > 0 ? formData.sizes : undefined,
      gallery_images: formData.gallery_images.length > 0 ? formData.gallery_images : undefined,
      video_url: formData.video_url || undefined,
      faqs: formData.faqs.length > 0 ? formData.faqs : undefined,
      related_products: formData.related_products.length > 0 ? formData.related_products : undefined,
    }

    try {
      if (isEdit && editingProduct) {
        await productsAPI.update(editingProduct.id, payload)
        toast({ title: "Success", description: "Product updated successfully" })
        setIsEditOpen(false)
      } else {
        await productsAPI.create(payload)
        toast({ title: "Success", description: "Product created successfully" })
        setIsAddOpen(false)
      }
      setEditingProduct(null)
      setFormData(initialFormData)
      fetchProducts()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save product", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Delete this product?")) return
    try {
      await productsAPI.delete(id)
      toast({ title: "Success", description: "Product deleted" })
      fetchProducts()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      stock: product.stock.toString(),
      image_url: product.image_url || "",
      colors: Array.isArray(product.colors) ? product.colors : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      gallery_images: Array.isArray(product.gallery_images)
        ? product.gallery_images.map((img: any) => typeof img === 'string' ? { url: img, color: null } : img)
        : [],
      video_url: product.video_url || "",
      faqs: Array.isArray((product as any).faqs) ? (product as any).faqs : [],
      related_products: Array.isArray((product as any).related_products) ? (product as any).related_products : [],
    })
    setIsEditOpen(true)
  }

  const closeDialog = () => {
    setIsAddOpen(false)
    setIsEditOpen(false)
    setEditingProduct(null)
    setFormData(initialFormData)
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) return <div className="p-8 flex items-center justify-center min-h-screen"><p>Loading...</p></div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button onClick={() => { setFormData(initialFormData); setIsAddOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No products found</td></tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                            <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">{product.category}</td>
                      <td className="py-4 px-6">₹{product.price.toFixed(0)}</td>
                      <td className="py-4 px-6">{product.stock}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-xs rounded-full ${product.status === "Active" ? "bg-green-100 text-green-800" :
                          product.status === "Low Stock" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                          }`}>{product.status}</span>
                      </td>
                      <td className="py-4 px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(product)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{isEditOpen ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => handleSubmit(e, isEditOpen)} className="flex-1 overflow-y-auto space-y-4 pr-2">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Product Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => updateFormField('category', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <optgroup key={cat.id} label={cat.name}>
                      <option value={cat.name}>📁 {cat.name} (Main)</option>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        cat.subcategories.map((sub) => (
                          <option key={sub.id} value={sub.name}>&nbsp;&nbsp;↳ {sub.name}</option>
                        ))
                      )}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Sale Price (₹) *</label>
                <Input
                  type="number"
                  step="1"
                  value={formData.price}
                  onChange={(e) => updateFormField('price', e.target.value)}
                  placeholder="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Actual selling price</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Original Price (₹)</label>
                <Input
                  type="number"
                  step="1"
                  value={formData.original_price}
                  onChange={(e) => updateFormField('original_price', e.target.value)}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">MRP / Strikethrough price</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Stock *</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => updateFormField('stock', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => updateFormField('description', e.target.value)}
                placeholder="Product description"
                rows={2}
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="text-sm font-medium mb-2 block">Cover Image</label>
              <div className="flex gap-2 items-center flex-wrap">
                <input type="file" ref={coverImageRef} accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image_url')} />
                <Button type="button" variant="outline" size="sm" onClick={() => coverImageRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />} Upload
                </Button>
                <span className="text-gray-400 text-sm">or</span>
                <Input
                  placeholder="Paste image URL"
                  value={formData.image_url}
                  onChange={(e) => updateFormField('image_url', e.target.value)}
                  className="flex-1 min-w-[200px]"
                />
              </div>
              {formData.image_url && (
                <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100 mt-2 inline-block">
                  <Image src={formData.image_url} alt="Cover" fill className="object-cover" />
                  <button type="button" onClick={() => updateFormField('image_url', '')}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Gallery Images */}
            <div>
              <label className="text-sm font-medium mb-2 block">Gallery Images</label>
              <div className="flex gap-2 items-center flex-wrap mb-2">
                <input type="file" ref={galleryRef} accept="image/*" multiple className="hidden" onChange={(e) => handleFileUpload(e, 'gallery')} />
                <Button type="button" variant="outline" size="sm" onClick={() => galleryRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />} Upload
                </Button>
                <span className="text-gray-400 text-sm">or</span>
                <Input
                  placeholder="Paste image URL"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  className="flex-1 min-w-[180px]"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGalleryUrl(); } }}
                />
                <Button type="button" variant="outline" size="sm" onClick={addGalleryUrl}>Add</Button>
              </div>
              {formData.gallery_images.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {formData.gallery_images.map((img, i) => (
                    <div key={i} className="relative group">
                      <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
                        <Image src={img.url} alt={`Gallery ${i}`} width={64} height={64} className="object-cover w-full h-full" />
                      </div>
                      <button type="button" onClick={() => removeGalleryImage(i)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-2 h-2" />
                      </button>
                      {/* Color selector */}
                      <select
                        value={img.color || ""}
                        onChange={(e) => updateGalleryImageColor(i, e.target.value || null)}
                        className="absolute -bottom-6 left-0 right-0 text-[10px] bg-white border rounded px-1 py-0.5"
                        title="Assign to color"
                      >
                        <option value="">All Colors</option>
                        {formData.colors.map((c) => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
              {formData.gallery_images.length > 0 && <p className="text-xs text-gray-500 mt-8">Select a color below each image to show it only for that color, or leave as "All Colors"</p>}
            </div>

            {/* Video */}
            <div>
              <label className="text-sm font-medium mb-2 block">Video</label>
              <div className="flex gap-2 items-center flex-wrap">
                <input type="file" ref={videoRef} accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video_url')} />
                <Button type="button" variant="outline" size="sm" onClick={() => videoRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />} Upload
                </Button>
                <span className="text-gray-400 text-sm">or</span>
                <Input
                  placeholder="Paste video URL"
                  value={formData.video_url}
                  onChange={(e) => updateFormField('video_url', e.target.value)}
                  className="flex-1 min-w-[200px]"
                />
                {formData.video_url && (
                  <button type="button" onClick={() => updateFormField('video_url', '')} className="text-red-500"><X className="w-4 h-4" /></button>
                )}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sizes</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {availableSizes.map((size) => (
                  <button key={size} type="button" onClick={() => toggleSize(size)}
                    className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${formData.sizes.includes(size) ? "bg-[#2E5E99] text-white border-[#2E5E99]" : "border-gray-300 hover:border-[#2E5E99]"
                      }`}>{size}</button>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Custom size"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="w-28"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSize(); } }}
                />
                <Button type="button" variant="outline" size="sm" onClick={addCustomSize}>Add Size</Button>
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="text-sm font-medium mb-2 block">Colors</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {availableColors.map((color) => (
                  <button key={color.name} type="button" onClick={() => toggleColor(color)} title={color.name}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${formData.colors.some(c => c.name === color.name)
                      ? "ring-2 ring-[#2E5E99] ring-offset-2 border-[#2E5E99]"
                      : "border-gray-300 hover:border-gray-400"
                      }`} style={{ backgroundColor: color.value }} />
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-2 border rounded-md px-2 py-1">
                  <input
                    type="color"
                    value={newColorValue}
                    onChange={(e) => setNewColorValue(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0"
                  />
                  <Input
                    placeholder="Color name"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="w-24 border-0 p-0 h-auto focus-visible:ring-0"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomColor(); } }}
                  />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addCustomColor}>Add Color</Button>
              </div>
              {formData.colors.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">Selected: {formData.colors.map(c => c.name).join(", ")}</p>
              )}
            </div>

            {/* Related Products */}
            <div>
              <label className="text-sm font-medium mb-2 block">Related Products (Show on this product page)</label>
              <p className="text-xs text-gray-500 mb-3">Select products to display in "You May Also Like" section</p>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2 bg-gray-50">
                {products.filter(p => p.id !== editingProduct?.id).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No other products available</p>
                ) : (
                  products.filter(p => p.id !== editingProduct?.id).map((p) => (
                    <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.related_products.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFormField('related_products', [...formData.related_products, p.id])
                          } else {
                            updateFormField('related_products', formData.related_products.filter(id => id !== p.id))
                          }
                        }}
                        className="w-4 h-4 text-[#2E5E99] border-gray-300 rounded focus:ring-[#2E5E99]"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        {p.image_url && (
                          <Image src={p.image_url} alt={p.name} width={32} height={32} className="rounded object-cover" />
                        )}
                        <div>
                          <span className="text-sm font-medium text-gray-700">{p.name}</span>
                          <span className="text-xs text-gray-400 ml-2">₹{p.price}</span>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
              {formData.related_products.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">{formData.related_products.length} product(s) selected</p>
              )}
            </div>

            {/* FAQs */}
            <div>
              <label className="text-sm font-medium mb-2 block">FAQs (Frequently Asked Questions)</label>
              <div className="space-y-3">
                {formData.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 border">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Question"
                          value={faq.question}
                          onChange={(e) => {
                            const newFaqs = [...formData.faqs]
                            newFaqs[idx].question = e.target.value
                            updateFormField('faqs', newFaqs)
                          }}
                        />
                        <Textarea
                          placeholder="Answer"
                          value={faq.answer}
                          onChange={(e) => {
                            const newFaqs = [...formData.faqs]
                            newFaqs[idx].answer = e.target.value
                            updateFormField('faqs', newFaqs)
                          }}
                          rows={2}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newFaqs = formData.faqs.filter((_, i) => i !== idx)
                          updateFormField('faqs', newFaqs)
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFaqs = [...formData.faqs, { question: '', answer: '' }]
                    updateFormField('faqs', newFaqs)
                  }}
                  className="w-full border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add FAQ
                </Button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white pb-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={isUploading || isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                {isEditOpen ? "Update Product" : "Save Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
