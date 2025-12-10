"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, ArrowLeft } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", password: "", confirmPassword: "" })
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [devOtp, setDevOtp] = useState("") // For development testing

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      return
    }
    if (formData.password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register-with-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Registration failed')

      setDevOtp(data.otp_code_dev_only || "") // For testing only
      toast({ title: "OTP Sent", description: `Verification code sent to ${formData.email}` })
      setStep('otp')
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setIsLoading(false) }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast({ title: "Error", description: "Please enter 6-digit OTP", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: otp, purpose: 'register' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Verification failed')

      // Save auth data
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast({ title: "Success", description: "Account verified successfully!" })
      router.push(data.user.is_admin ? "/admin/dashboard" : "/account")
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setIsLoading(false) }
  }

  const resendOtp = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, purpose: 'register' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Failed to resend OTP')
      setDevOtp(data.otp_code_dev_only || "")
      toast({ title: "OTP Resent", description: "New verification code sent" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="h-[25vh] lg:h-auto lg:flex-1 bg-cover bg-center order-1"
        style={{ backgroundImage: "url('/elegant-fashion-boutique-sapphire-blue-aesthetic.jpg')" }}>
        <div className="w-full h-full bg-gradient-to-b lg:bg-gradient-to-l from-[#0D2440]/60 to-transparent" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 order-2">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-block mb-6 sm:mb-10">
            <h1 className="text-2xl font-bold tracking-[0.2em] text-[#2E5E99]">Vurel</h1>
          </Link>

          {step === 'form' ? (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#0D2440]">Create Account</h2>
              <p className="text-[#2E5E99] mb-6 sm:mb-8" style={{ fontFamily: "var(--font-body)" }}>
                Join us and discover timeless elegance
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0D2440] mb-1.5">First Name</label>
                    <Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required
                      className="h-11 border-[#7BA4D0]/30 focus:border-[#2E5E99]" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0D2440] mb-1.5">Last Name</label>
                    <Input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required
                      className="h-11 border-[#7BA4D0]/30 focus:border-[#2E5E99]" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0D2440] mb-1.5">Email</label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
                    className="h-11 border-[#7BA4D0]/30 focus:border-[#2E5E99]" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0D2440] mb-1.5">Password</label>
                  <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required
                    className="h-11 border-[#7BA4D0]/30 focus:border-[#2E5E99]" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0D2440] mb-1.5">Confirm Password</label>
                  <Input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required
                    className="h-11 border-[#7BA4D0]/30 focus:border-[#2E5E99]" placeholder="••••••••" />
                </div>

                <Button type="submit" className="w-full h-11 bg-[#2E5E99] hover:bg-[#0D2440]" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Create Account
                </Button>
              </form>

              <p className="text-center mt-6 text-sm text-[#2E5E99]" style={{ fontFamily: "var(--font-body)" }}>
                Already have an account?{" "}
                <Link href="/login" className="text-[#0D2440] font-medium hover:underline">Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep('form')} className="flex items-center text-[#2E5E99] mb-4 hover:text-[#0D2440]">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </button>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#0D2440]">Verify Email</h2>
              <p className="text-[#2E5E99] mb-6" style={{ fontFamily: "var(--font-body)" }}>
                Enter the 6-digit code sent to <strong>{formData.email}</strong>
              </p>

              {devOtp && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-yellow-800"><strong>DEV MODE:</strong> OTP is <span className="font-mono font-bold">{devOtp}</span></p>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0D2440] mb-1.5">Verification Code</label>
                  <Input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="h-12 text-center text-2xl tracking-[0.5em] border-[#7BA4D0]/30 focus:border-[#2E5E99]"
                    placeholder="000000" maxLength={6} />
                </div>

                <Button type="submit" className="w-full h-11 bg-[#2E5E99] hover:bg-[#0D2440]" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />} Verify Email
                </Button>
              </form>

              <p className="text-center mt-4 text-sm text-[#2E5E99]">
                Didn't receive the code?{" "}
                <button onClick={resendOtp} disabled={isLoading} className="text-[#0D2440] font-medium hover:underline">Resend</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
