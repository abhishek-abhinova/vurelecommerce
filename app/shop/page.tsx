"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SaleTimer } from "@/components/home/sale-timer"
import Image from "next/image"
import Link from "next/link"
import { Filter, X, Star, ChevronDown, SlidersHorizontal, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { publicProductsAPI, Product, categoriesAPI, Category } from "@/lib/api"

const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1000", min: 500, max: 1000 },
  { label: "₹1000 - ₹2000", min: 1000, max: 2000 },
  { label: "Above ₹2000", min: 2000, max: Infinity },
]
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A-Z", value: "name_asc" },
]

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)
  const [selectedPriceRange, setSelectedPriceRange] = useState(0)
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          publicProductsAPI.getAll(),
          categoriesAPI.getGrouped()
        ])
        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Apply filters
  let filteredProducts = products.filter(p => {
    // Category filter
    if (selectedCategory !== "All") {
      if (selectedSubcategory) {
        // Filter by subcategory name
        if (p.category !== selectedSubcategory) return false
      } else {
        // Filter by parent category - check if product category matches parent or any of its subcategories
        const parentCat = categories.find(c => c.name === selectedCategory)
        if (parentCat) {
          const validCats = [parentCat.name, ...(parentCat.subcategories?.map(s => s.name) || [])]
          if (!validCats.includes(p.category)) return false
        } else if (p.category !== selectedCategory) {
          return false
        }
      }
    }
    // Price filter
    const range = priceRanges[selectedPriceRange]
    if (p.price < range.min || p.price > range.max) return false
    return true
  })

  // Apply sorting
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price_asc": return a.price - b.price
      case "price_desc": return b.price - a.price
      case "name_asc": return a.name.localeCompare(b.name)
      default: return 0 // newest - use original order
    }
  })

  const activeFiltersCount = (selectedCategory !== "All" ? 1 : 0) + (selectedSubcategory ? 1 : 0) + (selectedPriceRange !== 0 ? 1 : 0) + (minRating > 0 ? 1 : 0)

  const clearFilters = () => {
    setSelectedCategory("All")
    setSelectedSubcategory(null)
    setExpandedCategory(null)
    setSelectedPriceRange(0)
    setMinRating(0)
  }

  const handleCategoryClick = (categoryName: string, categoryId: number, hasSubcats: boolean) => {
    if (hasSubcats) {
      // Toggle expanded state
      if (expandedCategory === categoryId) {
        setExpandedCategory(null)
      } else {
        setExpandedCategory(categoryId)
      }
      setSelectedCategory(categoryName)
      setSelectedSubcategory(null)
    } else {
      // No subcategories, directly select
      setSelectedCategory(categoryName)
      setSelectedSubcategory(null)
      setExpandedCategory(null)
    }
  }

  const handleSubcategoryClick = (subcatName: string) => {
    setSelectedSubcategory(subcatName)
  }

  return (
    <div className="min-h-screen bg-[#E7F0FA]">
      <SaleTimer />
      <Header />
      <main>
        {/* Hero Banner */}
        <section className="relative h-[30vh] sm:h-[35vh] lg:h-[45vh] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/luxury-fashion-store-interior-sapphire-blue.jpg')" }}>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0D2440]/70 to-[#0D2440]/40" />
          </div>
          <div className="relative h-full container mx-auto px-4 flex items-center justify-center text-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-[#E7F0FA]">Shop All</h1>
              <p className="text-sm sm:text-base text-[#E7F0FA]/80 max-w-md mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                Discover our complete collection of timeless pieces
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-6 sm:py-10">
          <div className="container mx-auto px-4">
            {/* Category Navigation */}
            <div className="mb-6">
              {/* Click outside overlay to close dropdown */}
              {expandedCategory && (
                <div className="fixed inset-0 z-20" onClick={() => setExpandedCategory(null)} />
              )}

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 relative z-30">
                {/* All button */}
                <button
                  onClick={() => { setSelectedCategory("All"); setSelectedSubcategory(null); setExpandedCategory(null); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === "All"
                    ? "bg-[#0D2440] text-white"
                    : "bg-white text-[#0D2440] border border-[#7BA4D0] hover:bg-[#E7F0FA]"
                    }`}
                >
                  All
                </button>

                {/* Category buttons */}
                {categories.map((cat) => {
                  const hasSubcats = cat.subcategories && cat.subcategories.length > 0
                  const isSelected = selectedCategory === cat.name
                  const isExpanded = expandedCategory === cat.id

                  return (
                    <div key={cat.id} className="relative">
                      <button
                        onClick={() => handleCategoryClick(cat.name, cat.id, hasSubcats || false)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${isSelected
                          ? "bg-[#0D2440] text-white"
                          : "bg-white text-[#0D2440] border border-[#7BA4D0] hover:bg-[#E7F0FA]"
                          }`}
                      >
                        {cat.name}
                        {hasSubcats && (
                          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        )}
                      </button>

                      {/* Subcategory dropdown */}
                      {hasSubcats && isExpanded && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-[#7BA4D0]/30 py-2 z-40 min-w-[200px]">
                          <p className="px-4 py-1 text-xs text-gray-400 uppercase tracking-wide">Subcategories</p>
                          {cat.subcategories?.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={(e) => { e.stopPropagation(); handleSubcategoryClick(sub.name); setExpandedCategory(null); }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${selectedSubcategory === sub.name
                                ? "bg-[#E7F0FA] text-[#2E5E99] font-medium"
                                : "text-gray-700 hover:bg-[#E7F0FA]"
                                }`}
                            >
                              <ChevronRight className="h-3 w-3 text-[#7BA4D0]" />
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Selected subcategory indicator */}
              {selectedSubcategory && (
                <div className="flex items-center gap-2 mt-3 text-sm text-[#2E5E99] bg-white/50 rounded-lg px-3 py-2 w-fit">
                  <span className="text-gray-500">{selectedCategory}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{selectedSubcategory}</span>
                  <button
                    onClick={() => setSelectedSubcategory(null)}
                    className="ml-2 p-1 hover:bg-gray-200 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#7BA4D0]/30">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(true)}
                  className="gap-2 bg-white border-[#7BA4D0] text-[#2E5E99] hover:bg-[#7BA4D0]/20 h-10 px-4"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 bg-[#2E5E99] text-white text-xs px-1.5 py-0.5 rounded-full">{activeFiltersCount}</span>
                  )}
                </Button>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[#2E5E99] hover:text-[#0D2440]">
                    Clear all
                  </Button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="gap-2 bg-white border-[#7BA4D0] text-[#2E5E99] hover:bg-[#7BA4D0]/20 h-10 px-4"
                >
                  Sort: {sortOptions.find(o => o.value === sortBy)?.label}
                  <ChevronDown className={`h-4 w-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                </Button>
                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border z-50 py-2 min-w-[180px]">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => { setSortBy(option.value); setShowSortMenu(false) }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E7F0FA] ${sortBy === option.value ? 'text-[#2E5E99] font-medium bg-[#E7F0FA]' : 'text-gray-700'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-[#2E5E99] mb-4">{filteredProducts.length} products</p>

            {/* Product Grid */}
            {isLoading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-[#2E5E99] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-[#2E5E99]">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <p className="text-[#2E5E99] mb-4">No products found</p>
                <Button onClick={clearFilters} variant="outline" className="border-[#2E5E99] text-[#2E5E99]">Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {filteredProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative aspect-[3/4] overflow-hidden">
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
                        {product.stock > 0 && product.stock < 20 && (
                          <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] px-2 py-1 rounded">Low Stock</span>
                        )}
                        {product.stock === 0 && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded">Out of Stock</span>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#7BA4D0] mb-1">{product.category}</p>
                        <h3 className="font-medium text-sm sm:text-base text-[#0D2440] line-clamp-1 mb-1">{product.name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-[#2E5E99] font-semibold">₹{product.price.toFixed(0)}</p>
                          {product.original_price && product.original_price > product.price && (
                            <p className="text-gray-400 text-sm line-through">₹{product.original_price.toFixed(0)}</p>
                          )}
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-green-600 text-xs font-medium">
                              {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% off
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Filter Sidebar */}
      {showFilters && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowFilters(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0D2440]">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-6">
              {/* Category */}
              <div>
                <h3 className="font-medium text-[#0D2440] mb-3">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === "All"}
                      onChange={() => { setSelectedCategory("All"); setSelectedSubcategory(null); }}
                      className="w-4 h-4 text-[#2E5E99] border-gray-300 focus:ring-[#2E5E99]"
                    />
                    <span className={`text-sm ${selectedCategory === "All" ? 'text-[#2E5E99] font-medium' : 'text-gray-600'}`}>All</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.name}
                        onChange={() => { setSelectedCategory(cat.name); setSelectedSubcategory(null); }}
                        className="w-4 h-4 text-[#2E5E99] border-gray-300 focus:ring-[#2E5E99]"
                      />
                      <span className={`text-sm ${selectedCategory === cat.name ? 'text-[#2E5E99] font-medium' : 'text-gray-600'}`}>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-medium text-[#0D2440] mb-3">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map((range, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        checked={selectedPriceRange === idx}
                        onChange={() => setSelectedPriceRange(idx)}
                        className="w-4 h-4 text-[#2E5E99] border-gray-300 focus:ring-[#2E5E99]"
                      />
                      <span className={`text-sm ${selectedPriceRange === idx ? 'text-[#2E5E99] font-medium' : 'text-gray-600'}`}>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="font-medium text-[#0D2440] mb-3">Minimum Rating</h3>
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <label key={rating} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className="w-4 h-4 text-[#2E5E99] border-gray-300 focus:ring-[#2E5E99]"
                      />
                      <span className="flex items-center gap-1">
                        {rating === 0 ? (
                          <span className="text-sm text-gray-600">All Ratings</span>
                        ) : (
                          <>
                            {[...Array(rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                            <span className="text-sm text-gray-600 ml-1">& up</span>
                          </>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
              <Button variant="outline" onClick={clearFilters} className="flex-1 border-[#7BA4D0] text-[#2E5E99]">Clear All</Button>
              <Button onClick={() => setShowFilters(false)} className="flex-1 bg-[#2E5E99] hover:bg-[#0D2440]">Apply Filters</Button>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  )
}
