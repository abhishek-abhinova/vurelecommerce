"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Save, Upload, Loader2, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { settingsAPI, getCurrentUser, authAPI, getAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function AdminOurStory() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const videoRef = useRef<HTMLInputElement>(null)
    const [settings, setSettings] = useState({ enabled: true, title: "Our Story", description: "", video_url: "" })

    useEffect(() => {
        const user = getCurrentUser()
        if (!user || !user.is_admin) { router.push("/login"); return }
        settingsAPI.getOurStory().then(setSettings).catch(() => { }).finally(() => setIsLoading(false))
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

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIsUploading(true)
        const url = await uploadVideo(file)
        if (url) setSettings(prev => ({ ...prev, video_url: url }))
        setIsUploading(false)
    }

    const saveSettings = async () => {
        setIsSaving(true)
        try {
            await settingsAPI.updateOurStory(settings)
            toast({ title: "Success", description: "Settings saved" })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally { setIsSaving(false) }
    }

    if (isLoading) return <div className="p-8 flex items-center justify-center"><p>Loading...</p></div>

    return (
        <div className="p-8 max-w-3xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Our Story</h1>
                    <p className="text-muted-foreground">Manage the Our Story video section on homepage</p>
                </div>
                <Button onClick={saveSettings} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />{isSaving ? "Saving..." : "Save"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" /> Video Section</CardTitle>
                    <CardDescription>Long format video displayed in the Our Story section</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                            <h4 className="font-medium">Enable Section</h4>
                            <p className="text-sm text-muted-foreground">Show/hide on homepage</p>
                        </div>
                        <Switch checked={settings.enabled} onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))} />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Section Title</label>
                        <Input value={settings.title} onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))} />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Description</label>
                        <Textarea value={settings.description} onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))} rows={3} />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Video URL (Long Format 16:9)</label>
                        <div className="flex gap-2 mb-2">
                            <input type="file" ref={videoRef} accept="video/*" className="hidden" onChange={handleVideoUpload} />
                            <Button type="button" variant="outline" onClick={() => videoRef.current?.click()} disabled={isUploading}>
                                {isUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />} Upload Video
                            </Button>
                            <Input placeholder="Or paste video URL" value={settings.video_url} onChange={(e) => setSettings(prev => ({ ...prev, video_url: e.target.value }))} className="flex-1" />
                        </div>
                        {settings.video_url && (
                            <div className="rounded-lg overflow-hidden bg-black aspect-video">
                                <video src={settings.video_url} controls className="w-full h-full" />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
