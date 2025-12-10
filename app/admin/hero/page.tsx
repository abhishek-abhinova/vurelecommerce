"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Trash2, Save, Upload, Loader2, GripVertical, Image as ImageIcon, Type, Info, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { settingsAPI, getCurrentUser, authAPI, HeroSlide, HeroSettings, ScrollingTextSettings, SaleBannerSettings, getAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const emptySlide: HeroSlide = { title: "", subtitle: "", description: "", image: "", cta: "Shop Now", href: "/shop" }

export default function AdminHero() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [heroSettings, setHeroSettings] = useState<HeroSettings>({ slides: [], recommended_size: "1920x1080" })
    const [scrollingText, setScrollingText] = useState<ScrollingTextSettings>({ enabled: true, text: "" })
    const [saleBanner, setSaleBanner] = useState<SaleBannerSettings>({
        enabled: true,
        text: "LIMITED TIME OFFER - UP TO 50% OFF",
        end_date: "2025-12-31T23:59"
    })
    const imageRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})

    useEffect(() => {
        const user = getCurrentUser()
        if (!user || !user.is_admin) { router.push("/login"); return }
        fetchSettings()
    }, [router])

    const fetchSettings = async () => {
        try {
            const [hero, scrolling, banner] = await Promise.all([
                settingsAPI.getHero(),
                settingsAPI.getScrollingText(),
                settingsAPI.getSaleBanner()
            ])
            setHeroSettings(hero)
            setScrollingText(scrolling)
            const endDate = banner.end_date ? banner.end_date.slice(0, 16) : "2025-12-31T23:59"
            setSaleBanner({ ...banner, end_date: endDate })
        } catch (error: any) {
            if (error.message?.includes("401")) { authAPI.logout(); router.push("/login") }
        } finally { setIsLoading(false) }
    }

    const uploadImage = async (file: File): Promise<string | null> => {
        const fd = new FormData()
        fd.append('file', file)
        try {
            const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${getAuthToken()}` }, body: fd
            })
            if (!response.ok) throw new Error('Upload failed')
            return (await response.json()).url
        } catch { toast({ title: "Upload failed", variant: "destructive" }); return null }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIsUploading(true)
        const url = await uploadImage(file)
        if (url) updateSlide(index, 'image', url)
        setIsUploading(false)
    }

    const updateSlide = (index: number, field: keyof HeroSlide, value: string) => {
        setHeroSettings(prev => ({
            ...prev,
            slides: prev.slides.map((slide, i) => i === index ? { ...slide, [field]: value } : slide)
        }))
    }

    const addSlide = () => {
        setHeroSettings(prev => ({ ...prev, slides: [...prev.slides, { ...emptySlide }] }))
    }

    const removeSlide = (index: number) => {
        setHeroSettings(prev => ({ ...prev, slides: prev.slides.filter((_, i) => i !== index) }))
    }

    const saveSettings = async () => {
        setIsSaving(true)
        try {
            await Promise.all([
                settingsAPI.updateHero(heroSettings),
                settingsAPI.updateScrollingText(scrollingText),
                settingsAPI.updateSaleBanner({ ...saleBanner, end_date: saleBanner.end_date + ":00" })
            ])
            toast({ title: "Success", description: "Settings saved" })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally { setIsSaving(false) }
    }

    if (isLoading) return <div className="p-8 flex items-center justify-center"><p>Loading...</p></div>

    return (
        <div className="p-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Hero Settings</h1>
                    <p className="text-muted-foreground">Manage homepage hero slider and scrolling text</p>
                </div>
                <Button onClick={saveSettings} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />{isSaving ? "Saving..." : "Save All"}
                </Button>
            </div>

            {/* Sale Banner */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Sale Banner</CardTitle>
                    <CardDescription>Configure the countdown timer banner at the top of the website</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                            <h4 className="font-medium">Enable Sale Banner</h4>
                            <p className="text-sm text-muted-foreground">Show or hide the banner</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm ${saleBanner.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                                {saleBanner.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <Switch checked={saleBanner.enabled} onCheckedChange={(checked) => setSaleBanner(prev => ({ ...prev, enabled: checked }))} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Banner Text</label>
                        <Input value={saleBanner.text} onChange={(e) => setSaleBanner(prev => ({ ...prev, text: e.target.value }))} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Sale End Date & Time</label>
                        <Input type="datetime-local" value={saleBanner.end_date} onChange={(e) => setSaleBanner(prev => ({ ...prev, end_date: e.target.value }))} className="w-full max-w-xs" />
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h4 className="text-sm font-medium mb-3">Preview</h4>
                        <div className={`bg-[#0D2440] text-white py-2 px-4 rounded flex items-center justify-center gap-4 ${!saleBanner.enabled && 'opacity-50'}`}>
                            <span className="text-sm font-medium">{saleBanner.text}</span>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="bg-white/20 px-2 py-1 rounded"><span className="font-bold">00</span><span className="text-xs ml-1">DAYS</span></div>
                                <span>:</span>
                                <div className="bg-white/20 px-2 py-1 rounded"><span className="font-bold">00</span><span className="text-xs ml-1">HRS</span></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Info Box */}
            <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="py-4 flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-blue-900">Recommended Image Size</p>
                        <p className="text-sm text-blue-700">For best results, use images with resolution: <strong>{heroSettings.recommended_size}</strong> (landscape orientation)</p>
                    </div>
                </CardContent>
            </Card>

            {/* Hero Slides */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Hero Slides</CardTitle>
                            <CardDescription>Auto-rotating images shown in the hero section</CardDescription>
                        </div>
                        <Button onClick={addSlide} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Slide</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {heroSettings.slides.map((slide, idx) => (
                        <div key={idx} className="border rounded-lg p-4 space-y-4 bg-muted/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Slide {idx + 1}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeSlide(idx)} className="text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Title</label>
                                        <Input value={slide.title} onChange={(e) => updateSlide(idx, 'title', e.target.value)} placeholder="New Season Arrivals" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Subtitle</label>
                                        <Input value={slide.subtitle} onChange={(e) => updateSlide(idx, 'subtitle', e.target.value)} placeholder="Spring/Summer 2024" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Description</label>
                                        <Textarea value={slide.description} onChange={(e) => updateSlide(idx, 'description', e.target.value)} rows={2} placeholder="Discover our latest collection" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Button Text</label>
                                            <Input value={slide.cta} onChange={(e) => updateSlide(idx, 'cta', e.target.value)} placeholder="Shop Now" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Button Link</label>
                                            <Input value={slide.href} onChange={(e) => updateSlide(idx, 'href', e.target.value)} placeholder="/shop" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Background Image</label>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input type="file" ref={(el) => { imageRefs.current[idx] = el }} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, idx)} />
                                            <Button type="button" variant="outline" size="sm" onClick={() => imageRefs.current[idx]?.click()} disabled={isUploading}>
                                                {isUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />} Upload
                                            </Button>
                                            <Input placeholder="Or paste URL" value={slide.image} onChange={(e) => updateSlide(idx, 'image', e.target.value)} className="flex-1" />
                                        </div>
                                        {slide.image && (
                                            <div className="relative h-32 rounded-lg overflow-hidden bg-muted">
                                                <Image src={slide.image} alt={`Slide ${idx + 1}`} fill className="object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {heroSettings.slides.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">No slides yet. Click "Add Slide" to create one.</div>
                    )}
                </CardContent>
            </Card>

            {/* Scrolling Text */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5" /> Scrolling Text</CardTitle>
                    <CardDescription>Moving text line displayed below the hero section</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                            <h4 className="font-medium">Enable Scrolling Text</h4>
                            <p className="text-sm text-muted-foreground">Show the animated text banner</p>
                        </div>
                        <Switch checked={scrollingText.enabled} onCheckedChange={(checked) => setScrollingText(prev => ({ ...prev, enabled: checked }))} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Text Content</label>
                        <Textarea value={scrollingText.text} onChange={(e) => setScrollingText(prev => ({ ...prev, text: e.target.value }))}
                            rows={2} placeholder="Free Shipping on Orders Over $100  |  New Arrivals Weekly" />
                        <p className="text-xs text-muted-foreground mt-1">Use " | " to separate different messages</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
