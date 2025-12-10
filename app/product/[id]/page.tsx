"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SaleTimer } from "@/components/home/sale-timer"
import { ProductDetails } from "@/components/product/product-details"
import { publicProductsAPI, Product } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"

export default function ProductPage() {
  const params = useParams()
  const productId = params?.id ? parseInt(params.id as string) : null
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    if (!productId) return
    try {
      const data = await publicProductsAPI.getById(productId)
      setProduct(data)

      // Fetch related products if available
      const relatedIds = (data as any).related_products || []
      if (relatedIds.length > 0) {
        const allProducts = await publicProductsAPI.getAll()
        const related = allProducts.filter((p: Product) => relatedIds.includes(p.id))
        setRelatedProducts(related)
      }
    } catch (error) {
      console.error("Failed to fetch product:", error)
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
          <p className="text-[#2E5E99]">Loading product...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <SaleTimer />
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <p className="text-[#2E5E99]">Product not found</p>
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
        <ProductDetails product={product} />

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="py-10 sm:py-14 bg-[#E7F0FA] border-t border-[#7BA4D0]/30">
            <div className="container mx-auto px-4 lg:px-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0D2440] mb-6 text-center">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {relatedProducts.map((p) => (
                  <Link key={p.id} href={`/product/${p.id}`} className="group">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                          src={p.image_url || "/placeholder.svg"}
                          alt={p.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#7BA4D0] mb-1">{p.category}</p>
                        <h3 className="font-medium text-sm sm:text-base text-[#0D2440] line-clamp-1 mb-1">{p.name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-[#2E5E99] font-semibold">₹{p.price.toFixed(0)}</p>
                          {p.original_price && p.original_price > p.price && (
                            <p className="text-gray-400 text-sm line-through">₹{p.original_price.toFixed(0)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
