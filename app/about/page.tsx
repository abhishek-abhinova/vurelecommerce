import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Image from "next/image"
import { Sparkles, Target, Eye, CheckCircle2 } from "lucide-react"

export default function AboutPage() {
  const whyChooseUs = [
    { icon: "✨", text: "Premium fabric quality" },
    { icon: "🎨", text: "Unique & trend-driven designs" },
    { icon: "💎", text: "Affordable luxury" },
    { icon: "🤝", text: "Customer-first support" },
    { icon: "🚚", text: "Reliable shipping" },
  ]

  return (
    <div className="min-h-screen bg-[#E7F0FA]">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative h-[50vh] sm:h-[55vh] lg:h-[65vh] overflow-hidden">
          <Image
            src="/elegant-fashion-atelier-sapphire-blue-aesthetic.jpg"
            alt="About Vurel"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D2440]/70 via-[#0D2440]/60 to-[#0D2440]/80" />
          <div className="relative h-full container mx-auto px-4 lg:px-8 flex items-center justify-center text-center">
            <div className="max-w-4xl">
              <p className="text-sm sm:text-base uppercase tracking-[0.3em] text-[#7BA4D0] mb-4" style={{ fontFamily: "var(--font-body)" }}>
                About Us
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 text-[#E7F0FA] leading-tight">
                Welcome to Vurel
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-[#E7F0FA]/90 font-light" style={{ fontFamily: "var(--font-body)" }}>
                Where Luxury Meets Personality
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 sm:py-20 lg:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-lg sm:text-xl lg:text-2xl text-[#0D2440]/80 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                At Vurel, we create clothing that blends <strong className="text-[#0D2440]">premium quality</strong>,
                <strong className="text-[#0D2440]"> unique design</strong>, and <strong className="text-[#0D2440]">youth-driven fashion</strong>.
                Each piece is crafted to deliver comfort, confidence, and creativity — made for people who want to
                <span className="italic text-[#2E5E99]"> stand out, not fit in</span>.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 sm:py-20 lg:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              {/* Mission */}
              <div className="bg-gradient-to-br from-[#0D2440] to-[#2E5E99] rounded-2xl p-8 sm:p-10 lg:p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Target className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold">Our Mission</h2>
                  </div>
                  <p className="text-lg sm:text-xl text-white/90 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    To provide <strong>premium, stylish, and high-quality clothing</strong> that inspires individuality
                    and empowers every person to express their unique style with confidence.
                  </p>
                </div>
              </div>

              {/* Vision */}
              <div className="bg-gradient-to-br from-[#2E5E99] to-[#7BA4D0] rounded-2xl p-8 sm:p-10 lg:p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Eye className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold">Our Vision</h2>
                  </div>
                  <p className="text-lg sm:text-xl text-white/90 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    To become one of <strong>India's most trusted youth-focused luxury clothing brands</strong>,
                    setting new standards for quality, design, and customer experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Vurel */}
        <section className="py-16 sm:py-20 lg:py-28 bg-[#0D2440] text-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <p className="text-sm uppercase tracking-[0.3em] text-[#7BA4D0] mb-4" style={{ fontFamily: "var(--font-body)" }}>
                The Vurel Difference
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Why Choose Vurel?</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
              {whyChooseUs.map((item, index) => (
                <div key={index} className="bg-white/5 backdrop-blur rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300 group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                  <p className="text-base sm:text-lg font-medium" style={{ fontFamily: "var(--font-body)" }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Image Section */}
        <section className="py-16 sm:py-20 lg:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/fashion-designer-at-work-elegant-blue.jpg"
                  alt="Vurel Craftsmanship"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D2440]/40 to-transparent" />
              </div>
              <div className="lg:pl-8">
                <p className="text-sm uppercase tracking-[0.3em] text-[#2E5E99] mb-4" style={{ fontFamily: "var(--font-body)" }}>
                  Crafted With Care
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0D2440] mb-6 leading-tight">
                  Quality You Can Feel
                </h2>
                <p className="text-lg text-[#0D2440]/80 leading-relaxed mb-6" style={{ fontFamily: "var(--font-body)" }}>
                  Every Vurel piece is a testament to our commitment to excellence. From carefully sourced fabrics
                  to meticulous stitching, we ensure that each garment meets our exacting standards.
                </p>
                <div className="space-y-4">
                  {["Hand-selected premium materials", "Expert craftsmanship", "Rigorous quality checks", "Designed for lasting comfort"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#2E5E99]" />
                      <span className="text-[#0D2440]/80" style={{ fontFamily: "var(--font-body)" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-[#0D2440] via-[#2E5E99] to-[#0D2440] text-white text-center">
          <div className="container mx-auto px-4 lg:px-8">
            <Sparkles className="w-10 h-10 mx-auto mb-6 text-[#7BA4D0]" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Ready to Stand Out?</h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
              Explore our collection and discover clothing that speaks to who you are.
            </p>
            <a href="/shop" className="inline-block bg-white text-[#0D2440] px-8 py-4 rounded-full font-semibold hover:bg-[#E7F0FA] transition-colors duration-300">
              Shop Now
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
