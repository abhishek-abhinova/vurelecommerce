import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FileText, Globe, ShoppingBag, Monitor, AlertTriangle } from "lucide-react"

export default function TermsPage() {
    const sections = [
        {
            icon: Globe,
            title: "1. Use of Website",
            content: "This website is intended for personal browsing and shopping use only. Any form of misuse, including but not limited to unauthorized access, data scraping, or commercial exploitation, is strictly prohibited."
        },
        {
            icon: ShoppingBag,
            title: "2. Orders",
            content: "All orders are subject to product availability and price changes. Customers are responsible for providing correct shipping addresses. We reserve the right to cancel or refuse orders at our discretion."
        },
        {
            icon: Monitor,
            title: "3. Product Display",
            content: "We strive to display product colors and images as accurately as possible. However, actual colors may vary slightly from what appears on your screen due to differences in monitor settings and display technologies."
        },
        {
            icon: AlertTriangle,
            title: "4. Limitation of Liability",
            content: "Vurel is not responsible for delays caused by courier services, natural disasters, or other external factors beyond our control. Our liability is limited to the value of the products purchased."
        }
    ]

    return (
        <div className="min-h-screen bg-[#E7F0FA]">
            <Header />
            <main>
                {/* Hero */}
                <section className="bg-[#0D2440] py-16 sm:py-20 lg:py-24">
                    <div className="container mx-auto px-4 lg:px-8 text-center">
                        <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-[#7BA4D0] mx-auto mb-6" />
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Terms & Conditions</h1>
                        <p className="text-lg text-[#7BA4D0] max-w-2xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                            Please read these terms carefully before using our website
                        </p>
                    </div>
                </section>

                {/* Introduction */}
                <section className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
                        <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm border border-[#7BA4D0]/20">
                            <p className="text-lg text-[#0D2440]/80 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                                By accessing Vurel or making a purchase, you agree to be bound by these Terms and Conditions.
                                If you do not agree with any part of these terms, please do not use our website.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Terms Sections */}
                <section className="pb-16 sm:pb-20">
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

                {/* Contact for Terms */}
                <section className="py-12 sm:py-16 bg-[#0D2440]">
                    <div className="container mx-auto px-4 lg:px-8 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Have Questions?</h2>
                        <p className="text-[#7BA4D0] mb-6" style={{ fontFamily: "var(--font-body)" }}>
                            Contact us if you need clarification on any of these terms
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
