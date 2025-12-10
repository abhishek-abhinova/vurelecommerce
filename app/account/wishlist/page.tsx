"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Heart, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getCurrentUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface WishlistItem {
    id: number
    name: string
    price: number
    image: string
    category?: string
}

export default function WishlistPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [wishlist, setWishlist] = useState<WishlistItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const user = getCurrentUser()
        if (!user) { router.push("/signup"); return }

        // Load wishlist from localStorage
        const saved = localStorage.getItem("wishlist")
        if (saved) setWishlist(JSON.parse(saved))
        setIsLoading(false)
    }, [router])

    const removeFromWishlist = (id: number) => {
        const updated = wishlist.filter(item => item.id !== id)
        setWishlist(updated)
        localStorage.setItem("wishlist", JSON.stringify(updated))
        toast({ title: "Removed from Wishlist" })
    }

    const addToCart = (item: WishlistItem) => {
        const cartItem = {
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
            size: "M", // Default size
            color: "Default"
        }

        const existingCart = localStorage.getItem("cart")
        const cart = existingCart ? JSON.parse(existingCart) : []

        const existingIndex = cart.findIndex((c: any) => c.id === item.id)
        if (existingIndex >= 0) {
            cart[existingIndex].quantity += 1
        } else {
            cart.push(cartItem)
        }

        localStorage.setItem("cart", JSON.stringify(cart))
        toast({ title: "Added to Cart", description: `${item.name} added to your cart` })
    }

    const moveToCart = (item: WishlistItem) => {
        addToCart(item)
        removeFromWishlist(item.id)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <Header />
                <main className="py-12 flex items-center justify-center">
                    <p className="text-muted-foreground">Loading wishlist...</p>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <Header />
            <main className="py-12">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <Link href="/account" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
                            <ChevronLeft className="h-4 w-4" /><span>Back to Account</span>
                        </Link>

                        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

                        {wishlist.length === 0 ? (
                            <div className="text-center py-16 bg-card rounded-xl border border-border">
                                <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
                                <p className="text-muted-foreground mb-6">Save items you love to your wishlist</p>
                                <Link href="/shop">
                                    <Button>Start Shopping</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {wishlist.map(item => (
                                    <div key={item.id} className="bg-card rounded-xl border border-border overflow-hidden group">
                                        <Link href={`/product/${item.id}`} className="block">
                                            <div className="relative aspect-[3/4] bg-muted">
                                                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                            </div>
                                        </Link>
                                        <div className="p-4">
                                            <Link href={`/product/${item.id}`}>
                                                <h3 className="font-medium text-sm line-clamp-2 hover:text-primary">{item.name}</h3>
                                            </Link>
                                            {item.category && <p className="text-xs text-muted-foreground mt-1">{item.category}</p>}
                                            <p className="font-bold text-primary mt-2">${item.price.toFixed(2)}</p>

                                            <div className="flex gap-2 mt-4">
                                                <Button size="sm" className="flex-1" onClick={() => moveToCart(item)}>
                                                    <ShoppingBag className="h-3 w-3 mr-1" /> Move to Cart
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => removeFromWishlist(item.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
