"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, User } from "lucide-react"
import Link from "next/link"
import { getCurrentUser, getAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface ProfileData {
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({
    first_name: "", last_name: "", email: "", phone: "", date_of_birth: "", created_at: ""
  })

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) { router.push("/signup"); return }

    // Pre-populate with localStorage data
    setProfile(prev => ({
      ...prev,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || ""
    }))

    fetchProfile()
  }, [router])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      })
      if (!response.ok) throw new Error('Failed to load profile')
      const data = await response.json()
      if (data.first_name || data.email) {
        setProfile(data)
      }
    } catch (error) {
      // Keep localStorage data if API fails
      console.log("Profile API failed, using localStorage data")
    } finally { setIsLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          date_of_birth: profile.date_of_birth || null
        })
      })
      if (!response.ok) throw new Error('Failed to update profile')

      // Update localStorage user
      const user = getCurrentUser()
      if (user) {
        localStorage.setItem('user', JSON.stringify({ ...user, first_name: profile.first_name, last_name: profile.last_name }))
      }

      toast({ title: "Success", description: "Profile updated successfully" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setIsSaving(false) }
  }

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'None') return 'New member'
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E7F0FA]">
        <Header />
        <main className="py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2E5E99]" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E7F0FA]">
      <Header />
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Link href="/account" className="inline-flex items-center gap-2 text-[#2E5E99] hover:text-[#0D2440] mb-6 sm:mb-8">
              <ArrowLeft className="h-4 w-4" />
              <span style={{ fontFamily: "var(--font-body)" }}>Back to Account</span>
            </Link>

            <div className="bg-white rounded-2xl border border-[#7BA4D0]/30 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-[#2E5E99] to-[#0D2440] p-6 sm:p-8 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#7BA4D0] border-4 border-[#E7F0FA] overflow-hidden mx-auto flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#E7F0FA] mb-1">
                  {profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : 'Complete Your Profile'}
                </h1>
                <p className="text-[#7BA4D0] text-sm" style={{ fontFamily: "var(--font-body)" }}>
                  Member since {formatDate(profile.created_at)}
                </p>
              </div>

              {/* Profile Form */}
              <div className="p-5 sm:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-[#0D2440] mb-5 sm:mb-6">Personal Information</h2>

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-[#0D2440]">First Name</label>
                      <Input value={profile.first_name} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                        className="h-11 border-[#7BA4D0] focus:border-[#2E5E99] bg-[#E7F0FA]/30" placeholder="Enter first name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-[#0D2440]">Last Name</label>
                      <Input value={profile.last_name} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                        className="h-11 border-[#7BA4D0] focus:border-[#2E5E99] bg-[#E7F0FA]/30" placeholder="Enter last name" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-[#0D2440]">Email Address</label>
                    <Input type="email" value={profile.email} disabled
                      className="h-11 border-[#7BA4D0] bg-gray-100 cursor-not-allowed" />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-[#0D2440]">Phone Number</label>
                    <Input type="tel" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="h-11 border-[#7BA4D0] focus:border-[#2E5E99] bg-[#E7F0FA]/30" placeholder="+1 (555) 123-4567" />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-[#0D2440]">Date of Birth</label>
                    <Input type="date" value={profile.date_of_birth || ''} onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                      className="h-11 border-[#7BA4D0] focus:border-[#2E5E99] bg-[#E7F0FA]/30" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                    <Button type="submit" disabled={isSaving}
                      className="flex-1 uppercase tracking-wider bg-[#2E5E99] hover:bg-[#0D2440] text-[#E7F0FA] h-11 sm:h-12">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Changes
                    </Button>
                    <Link href="/account" className="flex-1">
                      <Button type="button" variant="outline"
                        className="w-full uppercase tracking-wider border-[#7BA4D0] text-[#2E5E99] hover:bg-[#7BA4D0]/20 h-11 sm:h-12 bg-transparent">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
