"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SaleTimer } from "@/components/home/sale-timer"
import Image from "next/image"
import Link from "next/link"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Collection {
  id: number
  name: string
  title: string
  slug: string
  description: string
  cover_image: string
  product_count: number
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/collections`)
      if (response.ok) {
        const data = await response.json()
        setCollections(data)
      }
    } catch (error) {
      console.error("Failed to fetch collections:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#E7F0FA]">
      <SaleTimer />
      <Header />
      <main>
        {/* Hero */}
        <section className="py-10 sm:py-12 lg:py-16 text-center">
          <div className="container mx-auto px-4 lg:px-8">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 text-[#0D2440]">Collections</h1>
            <p
              className="text-sm sm:text-lg text-[#2E5E99] max-w-md mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Explore our curated collections designed for every moment
            </p>
          </div>
        </section>

        {/* Collections Grid - Bento Style */}
        <section className="pb-12 sm:pb-16 lg:pb-20">
          <div className="container mx-auto px-4 lg:px-8">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading collections...</p>
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No collections available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {collections.map((collection, index) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.id}`}
                    className={`group relative overflow-hidden rounded-xl ${index === 0 || index === 5 ? "sm:col-span-2 aspect-[16/9] sm:aspect-[2/1]" : "aspect-[4/5]"
                      }`}
                  >
                    <Image
                      src={collection.cover_image || "/placeholder.svg"}
                      alt={collection.title || collection.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D2440]/90 via-[#0D2440]/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
                      <p
                        className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#7BA4D0] mb-1 sm:mb-2"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {collection.product_count || 0} Products
                      </p>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-[#E7F0FA]">
                        {collection.title || collection.name}
                      </h2>
                      <p
                        className="text-xs sm:text-sm text-[#E7F0FA]/80 max-w-sm hidden sm:block"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {collection.description}
                      </p>
                      <span
                        className="inline-block mt-2 sm:mt-4 text-xs sm:text-sm uppercase tracking-wider border-b border-[#E7F0FA] pb-0.5 sm:pb-1 text-[#E7F0FA]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        Shop Now
                      </span>
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
