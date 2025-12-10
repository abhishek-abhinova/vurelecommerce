"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface OurStorySettings {
  enabled: boolean
  title: string
  description: string
  video_url: string
}

export function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [settings, setSettings] = useState<OurStorySettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/our-story`)
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Failed to fetch our story settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Don't render if disabled or no video
  if (isLoading) return null
  if (!settings?.enabled || !settings?.video_url) return null

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <p
            className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#2E5E99] mb-3 sm:mb-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Behind The Scenes
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-[#0D2440]">{settings.title || "Our Story"}</h2>
          {settings.description && (
            <p className="mt-4 text-[#0D2440]/70 max-w-2xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
              {settings.description}
            </p>
          )}
        </div>

        <div className="relative aspect-video max-w-5xl mx-auto rounded-lg sm:rounded-xl overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            loop
            muted={isMuted}
            playsInline
          >
            <source src={settings.video_url} type="video/mp4" />
          </video>

          {/* Overlay when not playing */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-[#0D2440]/40 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#2E5E99] text-[#E7F0FA] flex items-center justify-center hover:bg-[#7BA4D0] hover:scale-110 transition-all shadow-lg"
              >
                <Play className="h-6 w-6 sm:h-8 sm:w-8 ml-1" />
              </button>
            </div>
          )}

          {/* Controls */}
          {isPlaying && (
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between items-center">
              <button
                onClick={togglePlay}
                className="p-2 sm:p-2.5 bg-[#0D2440]/60 backdrop-blur-sm rounded-full hover:bg-[#0D2440]/80 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 sm:h-5 sm:w-5 text-[#E7F0FA]" />
                ) : (
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 text-[#E7F0FA]" />
                )}
              </button>
              <button
                onClick={toggleMute}
                className="p-2 sm:p-2.5 bg-[#0D2440]/60 backdrop-blur-sm rounded-full hover:bg-[#0D2440]/80 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 text-[#E7F0FA]" />
                ) : (
                  <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#E7F0FA]" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
