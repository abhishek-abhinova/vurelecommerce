"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { authAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Mail, Lock, ArrowRight } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password")
  const [otpSent, setOtpSent] = useState(false)

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await authAPI.login({ email, password })
      toast({ title: "Success", description: "Logged in successfully!" })
      window.dispatchEvent(new Event('storage'))
      if (response.user.is_admin) router.push("/admin/dashboard")
      else router.push("/")
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to login", variant: "destructive" })
    } finally { setIsLoading(false) }
  }

  const sendOtp = async () => {
    if (!email) { toast({ title: "Error", description: "Please enter your email", variant: "destructive" }); return }
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'login' })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Failed to send OTP')
      setOtpSent(true)
      toast({ title: "OTP Sent", description: `Check your email ${email}` })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setIsLoading(false) }
  }

  const verifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) { toast({ title: "Error", description: "Please enter OTP", variant: "destructive" }); return }
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, purpose: 'login' })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Invalid OTP')

      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.dispatchEvent(new Event('storage'))
      toast({ title: "Success", description: "Logged in successfully!" })
      if (data.user.is_admin) router.push("/admin/dashboard")
      else router.push("/")
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 order-2 lg:order-1">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-block mb-8 sm:mb-12">
            <h1 className="text-2xl font-bold tracking-[0.2em] text-[#2E5E99]">Vurel</h1>
          </Link>

          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#0D2440]">Welcome back</h2>
          <p className="text-[#2E5E99] mb-6" style={{ fontFamily: "var(--font-body)" }}>
            {loginMode === "password" ? "Enter your credentials to access your account" : "Login with OTP sent to your email"}
          </p>

          {/* Toggle Login Mode */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button onClick={() => { setLoginMode("password"); setOtpSent(false) }}
              className={`flex-1 py-2 px-4 rounded-md text-sm transition ${loginMode === "password" ? "bg-white shadow text-[#0D2440]" : "text-gray-500"}`}>
              <Lock className="w-4 h-4 inline mr-2" />Password
            </button>
            <button onClick={() => setLoginMode("otp")}
              className={`flex-1 py-2 px-4 rounded-md text-sm transition ${loginMode === "otp" ? "bg-white shadow text-[#0D2440]" : "text-gray-500"}`}>
              <Mail className="w-4 h-4 inline mr-2" />OTP Login
            </button>
          </div>

          {loginMode === "password" ? (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block text-[#0D2440]">Email</label>
                <Input type="email" placeholder="john@example.com" className="h-12 border-[#7BA4D0]"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-[#0D2440]">Password</label>
                <Input type="password" placeholder="••••••••" className="h-12 border-[#7BA4D0]"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-[#0D2440]">
                  <input type="checkbox" className="rounded border-[#7BA4D0]" />Remember me
                </label>
                <Link href="/forgot-password" className="text-sm text-[#2E5E99] hover:underline">Forgot password?</Link>
              </div>
              <Button type="submit" size="lg" className="w-full bg-[#2E5E99] hover:bg-[#0D2440] h-12" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyOtpLogin} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block text-[#0D2440]">Email</label>
                <div className="flex gap-2">
                  <Input type="email" placeholder="john@example.com" className="h-12 border-[#7BA4D0] flex-1"
                    value={email} onChange={(e) => setEmail(e.target.value)} disabled={otpSent} required />
                  {!otpSent && (
                    <Button type="button" onClick={sendOtp} disabled={isLoading} className="bg-[#2E5E99] h-12">
                      Send OTP
                    </Button>
                  )}
                </div>
              </div>
              {otpSent && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-[#0D2440]">Enter OTP</label>
                    <Input type="text" placeholder="123456" className="h-12 border-[#7BA4D0] text-center text-2xl tracking-widest"
                      value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} required />
                    <button type="button" onClick={() => { setOtpSent(false); setOtp("") }}
                      className="text-sm text-[#2E5E99] hover:underline mt-2">Change email</button>
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-[#2E5E99] hover:bg-[#0D2440] h-12" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Verify & Login"} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}
            </form>
          )}

          <p className="text-center mt-6 text-[#2E5E99]">
            Don't have an account? <Link href="/signup" className="text-[#0D2440] font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>

      <div className="h-[30vh] lg:h-auto lg:flex-1 bg-cover bg-center order-1 lg:order-2"
        style={{ backgroundImage: "url('/elegant-fashion-model-in-blue-tones-sapphire-aesth.jpg')" }}>
        <div className="w-full h-full bg-gradient-to-b lg:bg-gradient-to-r from-[#0D2440]/60 to-transparent" />
      </div>
    </div>
  )
}
