"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { publicProductsAPI, Product } from "@/lib/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface ShopTheLookSettings {
  enabled: boolean
  title: string
  product_ids: number[]
}

export function InfiniteCarousel() {
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<ShopTheLookSettings>({ enabled: true, title: "Shop The Look", product_ids: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch shop the look settings
      const settingsRes = await fetch(`${API_BASE_URL}/api/settings/shop-the-look`)
      const settingsData = await settingsRes.json()
      setSettings(settingsData)

      if (settingsData.enabled && settingsData.product_ids?.length > 0) {
        // Fetch all products and filter by selected IDs
        const allProducts = await publicProductsAPI.getAll()
        const selectedProducts = allProducts.filter((p: Product) =>
          settingsData.product_ids.includes(p.id)
        )
        setProducts(selectedProducts)
      }
    } catch (error) {
      console.error("Failed to fetch shop the look data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render if disabled or no products
  if (!settings.enabled || products.length === 0) {
    return null
  }

  return (
    <section className="py-12 sm:py-16 overflow-hidden bg-white">
      <div className="text-center mb-8 sm:mb-10 px-4">
        <p
          className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#2E5E99] mb-2"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Trending Now
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0D2440]">{settings.title}</h2>
      </div>

      <div className="relative">
        <div className="flex animate-slide-left">
          {[...products, ...products].map((product, index) => (
            <Link
              key={`${product.id}-${index}`}
              href={`/product/${product.id}`}
              className="group flex-shrink-0 w-[180px] sm:w-[220px] lg:w-[250px] mx-2 sm:mx-3"
            >
              <div className="relative aspect-[5/6] overflow-hidden rounded-lg bg-white mb-2 sm:mb-3 shadow-sm">
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
              <div className="text-center">
                <h3 className="font-medium text-sm sm:text-base text-[#0D2440]">{product.name}</h3>
                <p className="text-sm sm:text-base font-bold text-[#0D2440]">
                  ₹{product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
