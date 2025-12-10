import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { RotateCcw, CheckCircle, XCircle, Clock, Package, Video } from "lucide-react"

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-[#E7F0FA]">
            <Header />
            <main>
                {/* Hero */}
                <section className="bg-[#0D2440] py-16 sm:py-20 lg:py-24">
                    <div className="container mx-auto px-4 lg:px-8 text-center">
                        <RotateCcw className="w-12 h-12 sm:w-16 sm:h-16 text-[#7BA4D0] mx-auto mb-6" />
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Refund & Return Policy</h1>
                        <p className="text-lg text-[#7BA4D0] max-w-2xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                            Important guidelines for returns and refunds
                        </p>
                    </div>
                </section>

                <section className="py-12 sm:py-16 lg:py-20">
                    <div className="container mx-auto px-4 lg:px-8 max-w-4xl space-y-6">

                        {/* Eligibility */}
                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-[#7BA4D0]/20">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#2E5E99]/10 flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-6 h-6 text-[#2E5E99]" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-[#0D2440] mb-4">1. Eligibility</h2>
                                    <p className="text-[#0D2440]/80 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                                        Returns are accepted <strong>ONLY</strong> for damaged, defective, or wrong items.
                                        An <strong>unboxing video is mandatory</strong> to process any return request.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Return Window */}
                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-[#7BA4D0]/20">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#2E5E99]/10 flex items-center justify-center shrink-0">
                                    <Clock className="w-6 h-6 text-[#2E5E99]" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-[#0D2440] mb-4">2. Return Window</h2>
                                    <p className="text-[#0D2440]/80 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                                        Return requests must be raised within <strong>2–3 days of delivery</strong>.
                                        Requests after this period will not be accepted.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Return Requirements */}
                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-[#7BA4D0]/20">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#2E5E99]/10 flex items-center justify-center shrink-0">
                                    <Video className="w-6 h-6 text-[#2E5E99]" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-[#0D2440] mb-4">3. Return Requirements</h2>
                                    <ul className="space-y-2 text-[#0D2440]/80" style={{ fontFamily: "var(--font-body)" }}>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#2E5E99] mt-1">•</span>
                                            <span><strong>Mandatory unboxing video</strong> showing the product condition</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#2E5E99] mt-1">•</span>
                                            <span>Product must be <strong>unused and unwashed</strong></span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#2E5E99] mt-1">•</span>
                                            <span>All <strong>original tags and packaging</strong> must be intact</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#2E5E99] mt-1">•</span>
                                            <span>Any <strong>freebies</strong> must be included in the return</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#2E5E99] mt-1">•</span>
                                            <span>Pickup will <strong>reject used or tampered products</strong></span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Non-Returnable */}
                        <div className="bg-red-50 rounded-xl p-6 sm:p-8 shadow-sm border border-red-200">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-[#0D2440] mb-4">4. Non-Returnable Items</h2>
                                    <ul className="space-y-2 text-[#0D2440]/80" style={{ fontFamily: "var(--font-body)" }}>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500 mt-1">✕</span>
                                            <span>Used or worn items</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500 mt-1">✕</span>
                                            <span>Items without unboxing video</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500 mt-1">✕</span>
                                            <span>Sale or discounted items</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500 mt-1">✕</span>
                                            <span>Wrong size ordered by customer</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Replacement */}
                        <div className="bg-green-50 rounded-xl p-6 sm:p-8 shadow-sm border border-green-200">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <Package className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-[#0D2440] mb-4">5. Replacement</h2>
                                    <p className="text-[#0D2440]/80 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                                        For eligible returns, we offer a <strong>free replacement</strong> or <strong>store credit</strong>.
                                        Refunds to original payment method are provided only in exceptional cases.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Contact */}
                <section className="py-12 sm:py-16 bg-[#0D2440]">
                    <div className="container mx-auto px-4 lg:px-8 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Need to Return an Item?</h2>
                        <p className="text-[#7BA4D0] mb-6" style={{ fontFamily: "var(--font-body)" }}>
                            Contact us with your order details and unboxing video
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
