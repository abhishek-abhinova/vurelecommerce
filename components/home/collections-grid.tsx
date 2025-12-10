"use client"

import { useState, useEffect } from "react"
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

export function CollectionsGrid() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      // Fetch collections that are marked for homepage
      const response = await fetch(`${API_BASE_URL}/api/collections/home`)
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

  // Don't render if no collections
  if (isLoading) return null
  if (collections.length === 0) return null

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <p
            className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#2E5E99] mb-3 sm:mb-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Explore
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-[#0D2440]">Shop by Collection</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="group relative aspect-[4/5] sm:aspect-[4/5] overflow-hidden rounded-xl"
            >
              <Image
                src={collection.cover_image || "/placeholder.svg"}
                alt={collection.title || collection.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D2440]/90 via-[#0D2440]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-[#E7F0FA]">
                <p
                  className="text-[10px] sm:text-xs uppercase tracking-wider mb-1.5 sm:mb-2 text-[#7BA4D0]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {collection.product_count || 0} Products
                </p>
                <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{collection.title || collection.name}</h3>
                <p className="text-xs sm:text-sm text-[#E7F0FA]/80" style={{ fontFamily: "var(--font-body)" }}>
                  {collection.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
