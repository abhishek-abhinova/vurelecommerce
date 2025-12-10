"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { settingsAPI, SaleBannerSettings } from "@/lib/api"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function SaleTimer() {
  const [isVisible, setIsVisible] = useState(true)
  const [bannerSettings, setBannerSettings] = useState<SaleBannerSettings | null>(null)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    // Fetch banner settings from API
    settingsAPI.getSaleBanner()
      .then(settings => setBannerSettings(settings))
      .catch(() => {
        // Use defaults if API fails
        setBannerSettings({
          enabled: true,
          text: "LIMITED TIME OFFER - UP TO 50% OFF",
          end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        })
      })
  }, [])

  useEffect(() => {
    if (!bannerSettings) return

    const endDate = new Date(bannerSettings.end_date)

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const distance = endDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [bannerSettings])

  // Don't show if not loaded, disabled, or dismissed
  if (!bannerSettings || !bannerSettings.enabled || !isVisible) return null

  return (
    <div className="bg-[#0D2440] text-[#E7F0FA] py-2.5 sm:py-3 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0D2440] via-[#2E5E99]/20 to-[#0D2440] animate-pulse" />

      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center relative">
        <span className="text-xs sm:text-sm font-medium tracking-wide uppercase" style={{ fontFamily: "var(--font-body)" }}>
          {bannerSettings.text}
        </span>
        <div className="flex items-center gap-2 sm:gap-3">
          <TimeBlock value={timeLeft.days} label="Days" />
          <span className="text-lg sm:text-xl font-bold text-[#7BA4D0]">:</span>
          <TimeBlock value={timeLeft.hours} label="Hrs" />
          <span className="text-lg sm:text-xl font-bold text-[#7BA4D0]">:</span>
          <TimeBlock value={timeLeft.minutes} label="Min" />
          <span className="text-lg sm:text-xl font-bold text-[#7BA4D0]">:</span>
          <TimeBlock value={timeLeft.seconds} label="Sec" />
        </div>
        <button onClick={() => setIsVisible(false)} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-[#7BA4D0] hover:text-[#E7F0FA] transition-colors p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-[#2E5E99]/30 rounded-md px-2 py-1 sm:px-3 sm:py-1.5 min-w-[40px] sm:min-w-[50px]">
      <span className="text-base sm:text-lg font-bold tabular-nums">{value.toString().padStart(2, "0")}</span>
      <span className="text-[8px] sm:text-[10px] uppercase tracking-wider text-[#7BA4D0]" style={{ fontFamily: "var(--font-body)" }}>
        {label}
      </span>
    </div>
  )
}
