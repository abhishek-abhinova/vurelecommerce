"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Product } from "@/lib/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function ProductCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/featured-products`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Failed to fetch featured products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [products])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
      setTimeout(checkScroll, 300)
    }
  }

  // Don't render if no featured products
  if (!isLoading && products.length === 0) {
    return null
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <p
              className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#2E5E99] mb-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Curated For You
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0D2440]">Featured Products</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="rounded-full h-10 w-10 sm:h-11 sm:w-11 border-[#7BA4D0] text-[#2E5E99] hover:bg-[#7BA4D0]/20 disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="rounded-full h-10 w-10 sm:h-11 sm:w-11 border-[#7BA4D0] text-[#2E5E99] hover:bg-[#7BA4D0]/20 disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group flex-shrink-0 w-[200px] sm:w-[250px] lg:w-[280px] snap-start"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[#E7F0FA] mb-3 sm:mb-4">
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D2440]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p
                className="text-[10px] sm:text-xs uppercase tracking-wider text-[#2E5E99] mb-1"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {product.category}
              </p>
              <h3 className="font-medium text-base sm:text-lg mb-1 text-[#0D2440]">{product.name}</h3>
              <p className="text-[#0D2440] text-base sm:text-lg font-bold">
                ₹{product.price}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
