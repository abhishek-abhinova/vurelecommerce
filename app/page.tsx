import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SaleTimer } from "@/components/home/sale-timer"
import { HeroSlider } from "@/components/home/hero-slider"
import { MarqueeBanner } from "@/components/home/marquee-banner"
import { ProductCarousel } from "@/components/home/product-carousel"
import { CollectionsGrid } from "@/components/home/collections-grid"
import { VideoSection } from "@/components/home/video-section"
import { VideoCarousel } from "@/components/home/video-carousel"
import { InfiniteCarousel } from "@/components/home/infinite-carousel"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SaleTimer />
      <Header />
      <main>
        <HeroSlider />
        <MarqueeBanner />
        <ProductCarousel />
        <CollectionsGrid />
        <VideoSection />
        <VideoCarousel />
        <InfiniteCarousel />
      </main>
      <Footer />
    </div>
  )
}
