import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Shield, Lock, Cookie, Eye, UserCheck, Share2 } from "lucide-react"

export default function PrivacyPolicyPage() {
    const sections = [
        {
            icon: Eye,
            title: "1. Information We Collect",
            items: [
                "Name, phone, email",
                "Billing & shipping address",
                "Payment details (not stored by us)",
                "Automatically collected data such as device details, IP address, cookies"
            ]
        },
        {
            icon: Shield,
            title: "2. How We Use Your Information",
            items: [
                "Process orders",
                "Provide customer support",
                "Improve website performance",
                "Send updates and offers",
                "Prevent fraud"
            ]
        },
        {
            icon: Share2,
            title: "3. Sharing of Information",
            content: "We do NOT sell your data. We share it only with courier partners, payment gateways, and analytics tools to fulfill our services to you."
        },
        {
            icon: Cookie,
            title: "4. Cookies",
            content: "We use cookies to improve your browsing experience, remember your preferences, and analyze website traffic."
        },
        {
            icon: Lock,
            title: "5. Data Security",
            content: "We use modern protection systems including encryption, secure servers, and regular security audits to protect your personal information."
        },
        {
            icon: UserCheck,
            title: "6. Your Rights",
            content: "You may request access, correction, deletion, or opt-out of your personal data at any time. Contact us at help.vurel@gmail.com for any privacy-related requests."
        }
    ]

    return (
        <div className="min-h-screen bg-[#E7F0FA]">
            <Header />
            <main>
                {/* Hero */}
                <section className="bg-[#0D2440] py-16 sm:py-20 lg:py-24">
                    <div className="container mx-auto px-4 lg:px-8 text-center">
                        <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-[#7BA4D0] mx-auto mb-6" />
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
                        <p className="text-lg text-[#7BA4D0] max-w-2xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                            Vurel ("we", "our", "us") values your privacy
                        </p>
                    </div>
                </section>

                {/* Introduction */}
                <section className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
                        <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm border border-[#7BA4D0]/20">
                            <p className="text-lg text-[#0D2440]/80 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                                This policy explains how we collect, use, and protect your information when you visit or shop from our website.
                                We are committed to ensuring that your privacy is protected and your data is handled responsibly.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Policy Sections */}
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
                                            {section.items ? (
                                                <ul className="space-y-2">
                                                    {section.items.map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-[#0D2440]/80" style={{ fontFamily: "var(--font-body)" }}>
                                                            <span className="text-[#2E5E99] mt-1">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-[#0D2440]/80 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                                                    {section.content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact for Privacy */}
                <section className="py-12 sm:py-16 bg-[#0D2440]">
                    <div className="container mx-auto px-4 lg:px-8 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Questions About Privacy?</h2>
                        <p className="text-[#7BA4D0] mb-6" style={{ fontFamily: "var(--font-body)" }}>
                            Contact us for any privacy-related requests
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
