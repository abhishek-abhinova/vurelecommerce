import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Truck, Package, MapPin, Clock } from "lucide-react"

export default function ShippingPage() {
    const sections = [
        {
            icon: Package,
            title: "1. Dispatch Time",
            content: "All orders are processed and shipped within 1–3 working days after order confirmation. Orders placed on weekends or holidays will be processed on the next working day."
        },
        {
            icon: Truck,
            title: "2. Delivery Time",
            content: "Standard delivery takes 4–7 working days depending on your location. Metro cities typically receive orders faster, while remote areas may take slightly longer."
        },
        {
            icon: MapPin,
            title: "3. Tracking",
            content: "Once your order is shipped, you will receive a tracking ID via SMS and email. You can use this ID to track your package in real-time through our courier partner's website."
        },
        {
            icon: Clock,
            title: "4. Delays",
            content: "While we strive for timely delivery, external factors such as weather conditions, natural disasters, public holidays, or courier-related issues may occasionally cause delays. We appreciate your patience in such cases."
        }
    ]

    return (
        <div className="min-h-screen bg-[#E7F0FA]">
            <Header />
            <main>
                {/* Hero */}
                <section className="bg-[#0D2440] py-16 sm:py-20 lg:py-24">
                    <div className="container mx-auto px-4 lg:px-8 text-center">
                        <Truck className="w-12 h-12 sm:w-16 sm:h-16 text-[#7BA4D0] mx-auto mb-6" />
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Shipping Policy</h1>
                        <p className="text-lg text-[#7BA4D0] max-w-2xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                            Everything you need to know about our shipping process
                        </p>
                    </div>
                </section>

                {/* Shipping Sections */}
                <section className="py-12 sm:py-16 lg:py-20">
                    <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
                        <div className="space-y-6">
                            {sections.map((section, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-[#7BA4D0]/20">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[#2E5E99]/10 flex items-center justify-center shrink-0">
                                            <section.icon className="w-6 h-6 text-[#2E5E99]" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl sm:text-2xl font-bold text-[#0D2440] mb-4">{section.title}</h2>
                                            <p className="text-[#0D2440]/80 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                                                {section.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact for Shipping */}
                <section className="py-12 sm:py-16 bg-[#0D2440]">
                    <div className="container mx-auto px-4 lg:px-8 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Need Help With Your Order?</h2>
                        <p className="text-[#7BA4D0] mb-6" style={{ fontFamily: "var(--font-body)" }}>
                            Contact us for shipping inquiries
                        </p>
                        <a
                            href="mailto:help.vurel@gmail.com"
                            className="inline-block bg-white text-[#0D2440] px-6 py-3 rounded-full font-semibold hover:bg-[#E7F0FA] transition-colors"
                        >
                            help.vurel@gmail.com
                        </a>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
