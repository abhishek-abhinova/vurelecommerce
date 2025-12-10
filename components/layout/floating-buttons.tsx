"use client"

import { useState, useEffect } from "react"
import { ArrowUp, MessageCircle, X, ChevronDown, ChevronUp } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// WhatsApp SVG Icon
const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
)

// FAQ Data
const faqData = [
    { q: "What payment methods do you accept?", a: "We accept UPI, PhonePe, Google Pay, Paytm, PayPal, Credit/Debit Cards, and Net Banking." },
    { q: "Do you offer Cash on Delivery (COD)?", a: "COD is available on selected pincodes based on courier availability." },
    { q: "How long does delivery take?", a: "Delivery usually takes 4–7 working days after dispatch." },
    { q: "When will my order be shipped?", a: "Orders are shipped within 1–3 working days." },
    { q: "How can I track my order?", a: "Once your order is shipped, you will receive a tracking ID and link via WhatsApp, SMS, or email." },
    { q: "Can I cancel my order?", a: "You can cancel within 6 hours if the order is not shipped yet." },
    { q: "Can I return a product?", a: "Yes, returns are accepted only if the product is wrong, damaged, or defective AND you have a full unboxing video." },
    { q: "Do you accept returns for wrong size?", a: "No. Returns for wrong size ordered by the customer are not accepted." },
    { q: "What are the return requirements?", a: "Product must be: Unused, unworn, unwashed, have all original Vurel tags, in original packaging, with full unboxing video." },
    { q: "How do I request a return?", a: "Share your order ID + unboxing video with: 📩 help.vurel@gmail.com or 📞 +91 82186 20557" },
    { q: "What if I received the wrong product?", a: "We will replace it free of charge — just provide a clear unboxing video." },
    { q: "Do you ship internationally?", a: "Yes, international shipping is available. Charges depend on location." },
    { q: "What if I entered the wrong address?", a: "Vurel is not responsible if the order is delayed or lost due to an incorrect or incomplete address." },
    { q: "How do I contact customer support?", a: "You can reach us at: 📩 help.vurel@gmail.com or 📞 +91 82186 20557 / +91 90452 11333" },
    { q: "What if my order is delayed?", a: "Delays may occur due to weather, festivals, courier issues, or high shipping load." },
    { q: "Do you offer replacements instead of refunds?", a: "Yes, we provide free replacements for eligible cases. Cash refunds are rarely given." },
    { q: "How do I know my order is confirmed?", a: "You receive an order confirmation email or WhatsApp message immediately after placing the order." },
    { q: "Are Vurel products true to size?", a: "Yes, but you should always check the size chart before ordering." },
    { q: "How do I apply a coupon code?", a: "Enter the coupon code during checkout in the 'Apply Coupon' box." },
    { q: "What if courier marks delivered but I didn't receive?", a: "Contact customer support immediately. The courier investigation may take 2–5 days." },
    { q: "What should the unboxing video include?", a: "It must show: Sealed package, full 360° before opening, entire opening process, product clearly." },
    { q: "Can I change my address after ordering?", a: "Only if the order is not shipped yet. Contact support quickly." },
    { q: "Does Vurel have a return pickup service?", a: "Yes. After approval, our courier partner will arrange pickup." },
]

export function FloatingButtons() {
    const [showScroll, setShowScroll] = useState(false)
    const [whatsappSettings, setWhatsappSettings] = useState({ whatsapp_number: '', whatsapp_message: '' })
    const [showFaq, setShowFaq] = useState(false)
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

    useEffect(() => {
        const checkScrollTop = () => {
            setShowScroll(window.scrollY > 300)
        }
        window.addEventListener("scroll", checkScrollTop)

        // Fetch WhatsApp settings
        const fetchWhatsAppSettings = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/settings/whatsapp`)
                if (res.ok) {
                    const data = await res.json()
                    setWhatsappSettings(data)
                }
            } catch (e) { /* use defaults */ }
        }
        fetchWhatsAppSettings()

        return () => window.removeEventListener("scroll", checkScrollTop)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const openWhatsApp = () => {
        if (!whatsappSettings.whatsapp_number) return
        const message = encodeURIComponent(whatsappSettings.whatsapp_message || "Hi!")
        window.open(`https://wa.me/${whatsappSettings.whatsapp_number}?text=${message}`, "_blank")
    }

    return (
        <>
            {/* Left Side - WhatsApp Button */}
            <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
                {whatsappSettings.whatsapp_number && (
                    <button
                        onClick={openWhatsApp}
                        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                        aria-label="Chat on WhatsApp"
                    >
                        <WhatsAppIcon />
                    </button>
                )}
            </div>

            {/* Right Side - FAQ Chat & Scroll to Top */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                {/* FAQ Chat Button */}
                <button
                    onClick={() => setShowFaq(!showFaq)}
                    className={`w-14 h-14 rounded-full ${showFaq ? 'bg-[#0D2440]' : 'bg-[#2E5E99]'} hover:bg-[#0D2440] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center`}
                    aria-label="FAQ Chat"
                >
                    {showFaq ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                </button>

                {/* Scroll to Top Button */}
                {showScroll && (
                    <button
                        onClick={scrollToTop}
                        className="w-14 h-14 rounded-full bg-[#0D2440] hover:bg-[#2E5E99] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* FAQ Chat Panel */}
            {showFaq && (
                <div className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#0D2440] text-white p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MessageCircle className="w-6 h-6" />
                                <div>
                                    <h3 className="font-semibold">FAQ & Help</h3>
                                    <p className="text-xs text-gray-300">Find answers to common questions</p>
                                </div>
                            </div>
                            <button onClick={() => setShowFaq(false)} className="p-1 hover:bg-white/10 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* FAQ List */}
                    <div className="overflow-y-auto max-h-[calc(70vh-80px)] p-3">
                        {faqData.map((faq, index) => (
                            <div key={index} className="mb-2">
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-start justify-between gap-2"
                                >
                                    <span className="text-sm font-medium text-[#0D2440] flex-1">{faq.q}</span>
                                    {expandedFaq === index ? (
                                        <ChevronUp className="w-4 h-4 text-[#2E5E99] flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-[#2E5E99] flex-shrink-0 mt-0.5" />
                                    )}
                                </button>
                                {expandedFaq === index && (
                                    <div className="px-3 py-2 bg-[#E7F0FA] rounded-b-lg mt-1">
                                        <p className="text-sm text-gray-700">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Contact Section */}
                        <div className="mt-4 p-4 bg-[#E7F0FA] rounded-lg">
                            <p className="text-sm font-medium text-[#0D2440] mb-2">Still need help?</p>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p>📩 help.vurel@gmail.com</p>
                                <p>📞 +91 82186 20557</p>
                                <p>📞 +91 90452 11333</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
