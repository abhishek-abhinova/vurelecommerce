"use client"

import { useState, useEffect, use } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SaleTimer } from "@/components/home/sale-timer"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Collection {
    id: number
    title: string
    description: string
    cover_image: string
    product_count: number
}

interface Product {
    id: number
    name: string
    price: number
    image_url: string
    category: string
}

export default function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [collection, setCollection] = useState<Collection | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchCollectionData()
    }, [resolvedParams.id])

    const fetchCollectionData = async () => {
        try {
            setIsLoading(true)
            const [collectionRes, productsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/collections/${resolvedParams.id}`),
                fetch(`${API_BASE_URL}/api/collections/${resolvedParams.id}/products`)
            ])

            if (collectionRes.ok) {
                setCollection(await collectionRes.json())
            }
            if (productsRes.ok) {
                setProducts(await productsRes.json())
            }
        } catch (error) {
            console.error("Failed to fetch collection:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#E7F0FA]">
                <SaleTimer />
                <Header />
                <main className="py-16 flex items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                </main>
                <Footer />
            </div>
        )
    }

    if (!collection) {
        return (
            <div className="min-h-screen bg-[#E7F0FA]">
                <SaleTimer />
                <Header />
                <main className="py-16 flex items-center justify-center">
                    <p className="text-muted-foreground">Collection not found</p>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#E7F0FA]">
            <SaleTimer />
            <Header />
            <main>
                {/* Hero Banner */}
                <section className="relative h-[300px] sm:h-[400px]">
                    <Image
                        src={collection.cover_image || "/placeholder.svg"}
                        alt={collection.title}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D2440]/90 via-[#0D2440]/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12">
                        <div className="container mx-auto">
                            <Link href="/collections" className="inline-flex items-center gap-2 text-[#7BA4D0] hover:text-white mb-4 transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                                <span style={{ fontFamily: "var(--font-body)" }}>Back to Collections</span>
                            </Link>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">{collection.title}</h1>
                            <p className="text-[#E7F0FA]/80 max-w-xl" style={{ fontFamily: "var(--font-body)" }}>
                                {collection.description}
                            </p>
                            <p className="text-[#7BA4D0] mt-2 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                                {products.length} Products
                            </p>
                        </div>
                    </div>
                </section>

                {/* Products Grid */}
                <section className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 lg:px-8">
                        {products.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-muted-foreground text-lg">No products in this collection yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                {products.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/product/${product.id}`}
                                        className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="aspect-[3/4] relative bg-gray-100">
                                            <Image
                                                src={product.image_url || "/placeholder.svg"}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            {/* Watermark */}
                                            <div className="absolute bottom-2 left-2 pointer-events-none">
                                                <span className="text-white/50 text-[10px] sm:text-xs font-bold tracking-widest uppercase select-none" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Vurel</span>
                                            </div>
                                        </div>
                                        <div className="p-3 sm:p-4">
                                            <p className="text-xs text-[#2E5E99] uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-body)" }}>
                                                {product.category}
                                            </p>
                                            <h3 className="font-medium text-[#0D2440] text-sm sm:text-base mb-1 line-clamp-1">
                                                {product.name}
                                            </h3>
                                            <p className="font-bold text-[#0D2440]">
                                                ₹{product.price}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
