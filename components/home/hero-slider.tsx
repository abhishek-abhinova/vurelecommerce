"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { settingsAPI, HeroSlide } from "@/lib/api"

const defaultSlides: HeroSlide[] = [
  {
    title: "New Season Arrivals", subtitle: "Spring/Summer 2024", description: "Discover our latest collection",
    image: "/elegant-fashion-model-blue-tones.jpg", cta: "Shop Now", href: "/shop"
  },
  {
    title: "Exclusive Collection", subtitle: "Limited Edition", description: "Handcrafted pieces for the modern wardrobe",
    image: "/luxury-fashion-store-sapphire-blue.jpg", cta: "Explore", href: "/shop"
  },
  {
    title: "Summer Sale", subtitle: "Up to 50% Off", description: "Don't miss our biggest sale of the season",
    image: "/summer-fashion-collection-navy-blue-aesthetic.jpg", cta: "Shop Sale", href: "/shop"
  },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides)

  useEffect(() => {
    settingsAPI.getHero()
      .then(data => { if (data.slides?.length) setSlides(data.slides) })
      .catch(() => { }) // Use defaults on error
  }, [])

  useEffect(() => {
    if (slides.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const goToSlide = (index: number) => setCurrentSlide(index)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)

  if (slides.length === 0) return null

  return (
    <section className="relative h-[60vh] sm:h-[70vh] lg:h-[85vh] overflow-hidden">
      {slides.map((slide, index) => (
        <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D2440]/90 via-[#0D2440]/50 to-transparent" />
          </div>
          <div className="relative h-full container mx-auto px-4 lg:px-8 flex items-center">
            <div className="max-w-xl space-y-4 sm:space-y-6">
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#7BA4D0]" style={{ fontFamily: "var(--font-body)" }}>
                {slide.subtitle}
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight text-[#E7F0FA] text-balance">
                {slide.title}
              </h2>
              <p className="text-sm sm:text-lg text-[#E7F0FA]/80 max-w-md" style={{ fontFamily: "var(--font-body)" }}>
                {slide.description}
              </p>
              <Link href={slide.href}>
                <Button size="lg" className="mt-2 sm:mt-4 uppercase tracking-wider bg-[#2E5E99] hover:bg-[#7BA4D0] text-[#E7F0FA] text-sm sm:text-base px-6 sm:px-8">
                  {slide.cta}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button onClick={prevSlide} className="hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-[#E7F0FA]/20 backdrop-blur-sm rounded-full hover:bg-[#E7F0FA]/40 transition-colors items-center justify-center">
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-[#E7F0FA]" />
      </button>
      <button onClick={nextSlide} className="hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-[#E7F0FA]/20 backdrop-blur-sm rounded-full hover:bg-[#E7F0FA]/40 transition-colors items-center justify-center">
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-[#E7F0FA]" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
        {slides.map((_, index) => (
          <button key={index} onClick={() => goToSlide(index)}
            className={`h-2 sm:h-2.5 rounded-full transition-all ${index === currentSlide ? "w-8 sm:w-10 bg-[#E7F0FA]" : "w-2 sm:w-2.5 bg-[#E7F0FA]/40"}`} />
        ))}
      </div>
    </section>
  )
}
