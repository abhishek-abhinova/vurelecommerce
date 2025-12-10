"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Save, Plus, Trash2, Upload, Loader2, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { settingsAPI, getCurrentUser, authAPI, getAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface TestimonialVideo { name: string; video_url: string; thumbnail?: string }

export default function AdminTestimonials() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [settings, setSettings] = useState<{ enabled: boolean; title: string; videos: TestimonialVideo[] }>({ enabled: true, title: "What Our Fellows Say", videos: [] })
    const videoRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})

    useEffect(() => {
        const user = getCurrentUser()
        if (!user || !user.is_admin) { router.push("/login"); return }
        settingsAPI.getTestimonials().then(data => setSettings(data)).catch(() => { }).finally(() => setIsLoading(false))
    }, [router])

    const uploadVideo = async (file: File): Promise<string | null> => {
        const fd = new FormData()
        fd.append('file', file)
        try {
            const response = await fetch(`${API_BASE_URL}/api/upload/video`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${getAuthToken()}` }, body: fd
            })
            if (!response.ok) throw new Error('Upload failed')
            return (await response.json()).url
        } catch { toast({ title: "Upload failed", variant: "destructive" }); return null }
    }

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIsUploading(true)
        const url = await uploadVideo(file)
        if (url) updateVideo(index, 'video_url', url)
        setIsUploading(false)
    }

    const addVideo = () => setSettings(prev => ({ ...prev, videos: [...prev.videos, { name: "", video_url: "" }] }))
    const removeVideo = (index: number) => setSettings(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== index) }))
    const updateVideo = (index: number, field: keyof TestimonialVideo, value: string) => {
        setSettings(prev => ({ ...prev, videos: prev.videos.map((v, i) => i === index ? { ...v, [field]: value } : v) }))
    }

    const saveSettings = async () => {
        setIsSaving(true)
        try {
            await settingsAPI.updateTestimonials(settings)
            toast({ title: "Success", description: "Settings saved" })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally { setIsSaving(false) }
    }

    if (isLoading) return <div className="p-8 flex items-center justify-center"><p>Loading...</p></div>

    return (
        <div className="p-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Testimonials</h1>
                    <p className="text-muted-foreground">Manage "What Our Fellows Say" video section</p>
                </div>
                <Button onClick={saveSettings} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />{isSaving ? "Saving..." : "Save"}
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" /> Testimonial Videos</CardTitle>
                            <CardDescription>Customer video testimonials displayed on homepage</CardDescription>
                        </div>
                        <Switch checked={settings.enabled} onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Section Title</label>
                        <Input value={settings.title} onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))} />
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={addVideo} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Video</Button>
                    </div>

                    {settings.videos.map((video, idx) => (
                        <div key={idx} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Video {idx + 1}</span>
                                <Button variant="ghost" size="sm" onClick={() => removeVideo(idx)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Customer Name</label>
                                <Input value={video.name} onChange={(e) => updateVideo(idx, 'name', e.target.value)} placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Video URL</label>
                                <div className="flex gap-2">
                                    <input type="file" ref={(el) => { videoRefs.current[idx] = el }} accept="video/*" className="hidden" onChange={(e) => handleVideoUpload(e, idx)} />
                                    <Button type="button" variant="outline" size="sm" onClick={() => videoRefs.current[idx]?.click()} disabled={isUploading}>
                                        {isUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />} Upload
                                    </Button>
                                    <Input placeholder="Or paste video URL" value={video.video_url} onChange={(e) => updateVideo(idx, 'video_url', e.target.value)} className="flex-1" />
                                </div>
                                {video.video_url && <video src={video.video_url} controls className="mt-2 w-full max-w-sm rounded-lg" />}
                            </div>
                        </div>
                    ))}
                    {settings.videos.length === 0 && <div className="text-center py-8 text-muted-foreground">No videos. Click "Add Video" to add testimonials.</div>}
                </CardContent>
            </Card>
        </div>
    )
}
