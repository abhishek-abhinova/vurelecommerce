"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Mail, Lock, CheckCircle } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState<"email" | "otp" | "password" | "success">("email")
  const [isLoading, setIsLoading] = useState(false)

  const sendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Failed to send OTP')
      setStep("otp")
      toast({ title: "OTP Sent", description: "Check your email for the OTP code" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setIsLoading(false) }
  }

  const verifyOtpStep = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) { toast({ title: "Error", description: "Please enter 6-digit OTP", variant: "destructive" }); return }
    setStep("password")
  }

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      return
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, new_password: newPassword })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Failed to reset password')
      setStep("success")
      toast({ title: "Success", description: "Password reset successfully!" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#E7F0FA] to-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <Link href="/login" className="inline-flex items-center text-[#2E5E99] hover:text-[#0D2440] mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
        </Link>

        {step === "email" && (
          <>
            <h1 className="text-2xl font-bold text-[#0D2440] mb-2">Forgot Password?</h1>
            <p className="text-[#2E5E99] mb-6">Enter your email to receive a password reset OTP</p>
            <form onSubmit={sendResetOtp} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block text-[#0D2440]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input type="email" placeholder="john@example.com" className="h-12 pl-10 border-[#7BA4D0]"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 bg-[#2E5E99] hover:bg-[#0D2440]" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset OTP"}
              </Button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="text-2xl font-bold text-[#0D2440] mb-2">Enter OTP</h1>
            <p className="text-[#2E5E99] mb-6">We've sent a 6-digit code to {email}</p>
            <form onSubmit={verifyOtpStep} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block text-[#0D2440]">OTP Code</label>
                <Input type="text" placeholder="123456" className="h-14 text-center text-2xl tracking-[0.5em] border-[#7BA4D0]"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} required />
              </div>
              <Button type="submit" className="w-full h-12 bg-[#2E5E99] hover:bg-[#0D2440]">
                Continue
              </Button>
              <button type="button" onClick={() => setStep("email")} className="w-full text-sm text-[#2E5E99] hover:underline">
                Change email
              </button>
            </form>
          </>
        )}

        {step === "password" && (
          <>
            <h1 className="text-2xl font-bold text-[#0D2440] mb-2">Set New Password</h1>
            <p className="text-[#2E5E99] mb-6">Create a strong password for your account</p>
            <form onSubmit={resetPassword} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block text-[#0D2440]">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input type="password" placeholder="••••••••" className="h-12 pl-10 border-[#7BA4D0]"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-[#0D2440]">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input type="password" placeholder="••••••••" className="h-12 pl-10 border-[#7BA4D0]"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 bg-[#2E5E99] hover:bg-[#0D2440]" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </>
        )}

        {step === "success" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#0D2440] mb-2">Password Reset!</h1>
            <p className="text-[#2E5E99] mb-6">Your password has been reset successfully.</p>
            <Button onClick={() => router.push("/login")} className="w-full h-12 bg-[#2E5E99] hover:bg-[#0D2440]">
              Login with New Password
            </Button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t text-center">
          <Link href="/account" className="text-sm text-[#2E5E99] hover:underline">Go to My Account</Link>
        </div>
      </div>
    </div>
  )
}
