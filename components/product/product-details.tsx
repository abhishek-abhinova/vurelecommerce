"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Heart, Share2, Minus, Plus, Check, Star, Loader2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Product, getCurrentUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { AuthModal } from "@/components/auth/auth-modal"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Format price with Indian currency format
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

interface Review {
  id: number; reviewer_name: string; rating: number; review_text: string; created_at: string
}

interface ProductDetailsProps { product: Product }

export function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, text: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [reviewPage, setReviewPage] = useState(0)

  // Get FAQs from product (or empty array)
  const faqs: { question: string; answer: string }[] = (product as any).faqs || []

  const sizes = product.sizes?.length > 0 ? product.sizes : []
  const colors = product.colors?.length > 0 ? product.colors : []
  const [selectedColor, setSelectedColor] = useState(colors.length > 0 ? colors[0] : null)

  // Filter gallery images by selected color
  const getFilteredGalleryImages = () => {
    if (!product.gallery_images?.length) return []
    return product.gallery_images
      .filter((img: any) => {
        // Handle both old string format and new object format
        if (typeof img === 'string') return true // Old format - show for all colors
        return img.color === null || img.color === selectedColor?.name
      })
      .map((img: any) => typeof img === 'string' ? img : img.url)
  }

  const productImages = [
    product.image_url || "/placeholder.svg",
    ...getFilteredGalleryImages()
  ].filter(Boolean)

  // Reset to first image when color changes
  useEffect(() => {
    setSelectedImage(0)
  }, [selectedColor])

  useEffect(() => {
    fetchReviews()
    // Check if product is in wishlist
    const saved = localStorage.getItem("wishlist")
    if (saved) {
      const wishlist = JSON.parse(saved)
      setIsInWishlist(wishlist.some((item: any) => item.id === product.id))
    }
  }, [product.id])

  const toggleWishlist = () => {
    const saved = localStorage.getItem("wishlist")
    let wishlist = saved ? JSON.parse(saved) : []

    if (isInWishlist) {
      wishlist = wishlist.filter((item: any) => item.id !== product.id)
      toast({ title: "Removed from Wishlist" })
    } else {
      wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || "/placeholder.svg",
        category: product.category
      })
      toast({ title: "Added to Wishlist", description: "View your wishlist in My Account" })
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist))
    setIsInWishlist(!isInWishlist)
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${product.id}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
        setAvgRating(data.rating?.average || 0)
        setReviewCount(data.rating?.count || 0)
      }
    } catch { }
  }

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on Vurel!`,
      url: shareUrl
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast({ title: "Link Copied!", description: "Product link copied to clipboard" })
      }
    } catch (error) {
      // User cancelled or error
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast({ title: "Link Copied!", description: "Product link copied to clipboard" })
      } catch {
        toast({ title: "Error", description: "Failed to share", variant: "destructive" })
      }
    }
  }

  const addToCart = () => {
    const cartItem = {
      id: product.id, name: product.name, price: product.price, quantity,
      size: selectedSize, color: selectedColor.name, image: product.image_url || "/placeholder.svg"
    }

    const existingCart = typeof window !== "undefined" ? localStorage.getItem("cart") : null
    const cart = existingCart ? JSON.parse(existingCart) : []

    const existingItemIndex = cart.findIndex(
      (item: any) => item.id === product.id && item.size === selectedSize && item.color === selectedColor.name
    )

    if (existingItemIndex >= 0) { cart[existingItemIndex].quantity += quantity }
    else { cart.push(cartItem) }

    if (typeof window !== "undefined") localStorage.setItem("cart", JSON.stringify(cart))
    return true
  }

  const handleAddToCart = () => {
    if (!selectedSize) { toast({ title: "Please select a size", variant: "destructive" }); return }
    addToCart()
    toast({ title: "Added to Cart", description: `${product.name} added to your cart` })
  }

  const handleBuyNow = () => {
    if (!selectedSize) { toast({ title: "Please select a size", variant: "destructive" }); return }

    // Add to cart first
    addToCart()

    // Check if logged in
    const user = getCurrentUser()
    if (!user) {
      // Show auth modal - after login, redirect to cart
      setShowAuthModal(true)
    } else {
      // Already logged in, go to checkout
      router.push("/checkout")
    }
  }

  const handleAuthSuccess = () => {
    toast({ title: "Account Ready!", description: "Redirecting to cart..." })
    router.push("/cart")
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewForm.name.trim()) { toast({ title: "Please enter your name", variant: "destructive" }); return }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewer_name: reviewForm.name, rating: reviewForm.rating, review_text: reviewForm.text })
      })
      if (!response.ok) throw new Error('Failed to submit review')
      toast({ title: "Review Submitted", description: "Your review will appear after approval" })
      setReviewForm({ name: "", rating: 5, text: "" })
      setShowReviewForm(false)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setIsSubmitting(false) }
  }

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => {
        const fillPercent = Math.min(100, Math.max(0, (rating - i + 1) * 100))
        return (
          <button key={i} type="button" disabled={!interactive} onClick={() => onChange?.(i)}
            className={interactive ? "cursor-pointer" : "cursor-default"}>
            <div className="relative h-4 w-4">
              <Star className="absolute h-4 w-4 text-gray-300" />
              {fillPercent > 0 && (
                <div style={{ width: `${fillPercent}%` }} className="absolute h-4 overflow-hidden">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )

  return (
    <>
      <section className="py-6 sm:py-8 lg:py-12 bg-[#E7F0FA]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Images */}
            <div className="space-y-3 sm:space-y-4">
              <div className="relative aspect-[3/4] lg:aspect-[4/5] lg:max-h-[550px] overflow-hidden rounded-lg sm:rounded-xl bg-white">
                <Image src={productImages[selectedImage] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                {/* Watermark */}
                <div className="absolute bottom-3 left-3 pointer-events-none">
                  <span className="text-white/50 text-xs sm:text-sm font-bold tracking-widest uppercase select-none" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Vurel</span>
                </div>
              </div>
              {productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                  {productImages.map((image, index) => (
                    <button key={index} onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square overflow-hidden rounded-lg bg-white ${selectedImage === index ? "ring-2 ring-[#2E5E99]" : "ring-1 ring-[#7BA4D0]/30"}`}>
                      <Image src={image || "/placeholder.svg"} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                      {/* Watermark */}
                      <div className="absolute bottom-1 left-1 pointer-events-none">
                        <span className="text-white/50 text-[8px] font-bold tracking-widest uppercase select-none" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Vurel</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="lg:py-4">
              <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-[#0D2440]">{product.name}</h1>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl font-bold text-[#0D2440]">{formatPrice(product.price)}</span>
                    {reviewCount > 0 && (
                      <div className="flex items-center gap-1">
                        {renderStars(Math.round(avgRating))}
                        <span className="text-sm text-muted-foreground">({reviewCount})</span>
                      </div>
                    )}
                  </div>
                  {product.stock === 0 && <p className="text-sm text-red-600 mt-2">Out of Stock</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className={`rounded-full border-[#7BA4D0] ${isInWishlist ? 'bg-red-50' : 'bg-transparent'}`} onClick={toggleWishlist}><Heart className={`h-4 w-4 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-[#2E5E99]'}`} /></Button>
                  <Button variant="outline" size="icon" className="rounded-full bg-transparent border-[#7BA4D0]" onClick={handleShare}><Share2 className="h-4 w-4 text-[#2E5E99]" /></Button>
                </div>
              </div>

              {product.description && <p className="text-sm text-[#0D2440]/80 mb-6">{product.description}</p>}

              {/* Color Selection */}
              {colors.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium mb-3 text-[#0D2440]">Color: {selectedColor?.name}</p>
                  <div className="flex gap-3">
                    {colors.map((color) => (
                      <button key={color.name} onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${selectedColor?.name === color.name ? "border-[#2E5E99]" : "border-transparent"}`}
                        style={{ backgroundColor: color.value }}>
                        {selectedColor?.name === color.name && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium mb-3 text-[#0D2440]">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button key={size} onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedSize === size ? "bg-[#2E5E99] text-white border-[#2E5E99]" : "bg-white text-[#0D2440] border-[#7BA4D0]/50 hover:border-[#2E5E99]"}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-3 text-[#0D2440]">Quantity</p>
                <div className="flex items-center border border-[#7BA4D0] rounded-lg w-fit">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 hover:bg-[#7BA4D0]/20 text-[#2E5E99]"><Minus className="h-4 w-4" /></button>
                  <span className="w-10 text-center font-medium text-[#0D2440]">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2.5 hover:bg-[#7BA4D0]/20 text-[#2E5E99]"><Plus className="h-4 w-4" /></button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button size="lg" onClick={handleAddToCart} disabled={product.stock === 0}
                  className="flex-1 uppercase tracking-wider bg-[#2E5E99] hover:bg-[#0D2440] text-[#E7F0FA] h-12">
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg" onClick={handleBuyNow} disabled={product.stock === 0}
                  className="flex-1 uppercase tracking-wider bg-transparent border-[#2E5E99] text-[#2E5E99] hover:bg-[#2E5E99] hover:text-[#E7F0FA] h-12">
                  Buy Now
                </Button>
              </div>

              {/* Product Details */}
              <div className="border-t border-[#7BA4D0]/30 pt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-[#0D2440]">Product Details</h3>
                <ul className="space-y-2 text-sm text-[#0D2440]/80">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#2E5E99]" />Category: {product.category}</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#2E5E99]" />Stock: {product.stock} available</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 pt-8 border-t border-[#7BA4D0]/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#0D2440]">Customer Reviews</h2>
              <Button variant="outline" onClick={() => setShowReviewForm(!showReviewForm)} className="bg-transparent border-[#2E5E99] text-[#2E5E99]">
                Write a Review
              </Button>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={submitReview} className="bg-white rounded-xl p-6 mb-6 border border-[#7BA4D0]/30">
                <h3 className="font-semibold mb-4 text-[#0D2440]">Write Your Review</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#0D2440]">Your Name</label>
                    <Input value={reviewForm.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      className="mt-1" placeholder="John Doe" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#0D2440]">Rating</label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button key={i} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: i })}>
                          <Star className={`h-6 w-6 ${i <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#0D2440]">Review</label>
                    <Textarea value={reviewForm.text} onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                      className="mt-1" rows={3} placeholder="Share your experience..." />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="bg-[#2E5E99] hover:bg-[#0D2440]">
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Submit Review
                  </Button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="relative">
                {/* Reviews Grid - 3 per page */}
                <div className="space-y-4">
                  {reviews.slice(reviewPage * 3, reviewPage * 3 + 3).map((review) => (
                    <div key={review.id} className="bg-white rounded-xl p-6 border border-[#7BA4D0]/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-[#0D2440]">{review.reviewer_name}</span>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-sm text-[#0D2440]/80 mb-2">{review.review_text || <em className="text-muted-foreground">No review text</em>}</p>
                      <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {reviews.length > 3 && (
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setReviewPage(prev => Math.max(0, prev - 1))}
                      disabled={reviewPage === 0}
                      className="border-[#2E5E99] text-[#2E5E99] hover:bg-[#2E5E99] hover:text-white disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setReviewPage(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-colors ${reviewPage === idx ? 'bg-[#2E5E99]' : 'bg-[#7BA4D0]/40 hover:bg-[#7BA4D0]'
                            }`}
                        />
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setReviewPage(prev => Math.min(Math.ceil(reviews.length / 3) - 1, prev + 1))}
                      disabled={reviewPage >= Math.ceil(reviews.length / 3) - 1}
                      className="border-[#2E5E99] text-[#2E5E99] hover:bg-[#2E5E99] hover:text-white disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      {faqs.length > 0 && (
        <section className="py-8 sm:py-12 bg-gradient-to-b from-[#E7F0FA] to-[#d4e4f5]">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0D2440] mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-[#7BA4D0]/40 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left bg-[#d4e4f5] hover:bg-[#c4daf0] transition-colors"
                  >
                    <span className="font-medium text-[#0D2440]">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-[#2E5E99] transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && (
                    <div className="p-4 bg-[#E7F0FA] text-sm text-[#0D2440]/80 leading-relaxed border-t border-[#7BA4D0]/30">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Auth Modal for Buy Now */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        title="Create Account to Continue"
        message="Sign up to complete your purchase"
      />
    </>
  )
}
