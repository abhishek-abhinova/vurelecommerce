"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SaleTimer } from "@/components/home/sale-timer"
import { collectionsAPI, Collection, Product } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"

export default function CollectionPage() {
  const params = useParams()
  const collectionId = params?.id ? parseInt(params.id as string) : null
  const [collection, setCollection] = useState<Collection | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (collectionId) {
      fetchCollection()
    }
  }, [collectionId])

  const fetchCollection = async () => {
    if (!collectionId) return
    try {
      const data = await collectionsAPI.getById(collectionId)
      setCollection(data)
      setProducts(data.products || [])
    } catch (error) {
      console.error("Failed to fetch collection:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SaleTimer />
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <p className="text-[#2E5E99]">Loading collection...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="min-h-screen">
        <SaleTimer />
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <p className="text-[#2E5E99]">Collection not found</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SaleTimer />
      <Header />
      <main>
        {/* Collection Header */}
        <section className="py-10 sm:py-14 bg-gradient-to-br from-[#E7F0FA] to-[#F5F9FD]">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0D2440] mb-4">
              {collection.title}
            </h1>
            {collection.description && (
              <p className="text-lg text-[#2E5E99] max-w-2xl mx-auto">
                {collection.description}
              </p>
            )}
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-10 sm:py-14">
          <div className="container mx-auto px-4 lg:px-8">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#7BA4D0] mb-1">
                          {product.category}
                        </p>
                        <h3 className="font-medium text-sm sm:text-base text-[#0D2440] line-clamp-1 mb-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-[#2E5E99] font-semibold">₹{product.price.toFixed(0)}</p>
                          {product.original_price && product.original_price > product.price && (
                            <p className="text-gray-400 text-sm line-through">
                              ₹{product.original_price.toFixed(0)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-[#2E5E99] text-lg">No products found in this collection.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}