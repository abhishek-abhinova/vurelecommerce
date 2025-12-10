"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Clock, Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function ContactPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    subject: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.subject || !formData.message) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error("Failed to submit form")
      }

      setIsSubmitted(true)
      toast({ title: "Success", description: "Your message has been sent!" })
      setFormData({ first_name: "", last_name: "", email: "", subject: "", message: "" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#E7F0FA]">
      <Header />
      <main>
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 text-[#0D2440]">Contact Us</h1>
              <p
                className="text-sm sm:text-lg text-[#2E5E99] max-w-md mx-auto"
                style={{ fontFamily: "var(--font-body)" }}
              >
                We'd love to hear from you. Get in touch with our team.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
              {/* Contact Form */}
              <div className="bg-white p-5 sm:p-8 rounded-xl border border-[#7BA4D0]/30 order-2 lg:order-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-[#0D2440]">Send us a message</h2>

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#0D2440] mb-2">Thank You!</h3>
                    <p className="text-[#2E5E99] mb-6">Your message has been sent successfully. We'll get back to you soon.</p>
                    <Button onClick={() => setIsSubmitted(false)} variant="outline" className="border-[#2E5E99] text-[#2E5E99]">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#0D2440]" style={{ fontFamily: "var(--font-body)" }}>
                          First Name
                        </label>
                        <Input
                          placeholder="John"
                          className="h-11 border-[#7BA4D0] focus:border-[#2E5E99]"
                          value={formData.first_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#0D2440]" style={{ fontFamily: "var(--font-body)" }}>
                          Last Name
                        </label>
                        <Input
                          placeholder="Doe"
                          className="h-11 border-[#7BA4D0] focus:border-[#2E5E99]"
                          value={formData.last_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-[#0D2440]" style={{ fontFamily: "var(--font-body)" }}>
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        className="h-11 border-[#7BA4D0] focus:border-[#2E5E99]"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-[#0D2440]" style={{ fontFamily: "var(--font-body)" }}>
                        Subject
                      </label>
                      <Input
                        placeholder="How can we help?"
                        className="h-11 border-[#7BA4D0] focus:border-[#2E5E99]"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-[#0D2440]" style={{ fontFamily: "var(--font-body)" }}>
                        Message
                      </label>
                      <Textarea
                        placeholder="Your message..."
                        rows={5}
                        className="border-[#7BA4D0] focus:border-[#2E5E99]"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full uppercase tracking-wider bg-[#2E5E99] hover:bg-[#0D2440] text-[#E7F0FA] h-11 sm:h-12"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[#0D2440]">Get in Touch</h2>
                  <p
                    className="text-sm sm:text-base text-[#0D2440]/70 leading-relaxed"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Whether you have a question about our products, sizing, shipping, or anything else, our team is
                    ready to answer all your questions.
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {[
                    { icon: Mail, label: "Email", value: "help.vurel@gmail.com" },
                    { icon: Phone, label: "Phone", value: "+91 82186 20557 / +91 90452 11333" },
                    { icon: MapPin, label: "Address", value: "India" },
                    { icon: Clock, label: "Hours", value: "Mon - Sat: 10am - 7pm IST" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#2E5E99]/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#2E5E99]" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-[#2E5E99]" style={{ fontFamily: "var(--font-body)" }}>
                          {item.label}
                        </p>
                        <p
                          className="font-medium text-sm sm:text-base text-[#0D2440]"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
