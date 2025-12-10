"use client"

import { ChevronUp } from "lucide-react"

export function ScrollIndicator() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      className="hidden sm:flex fixed bottom-6 sm:bottom-8 right-4 sm:right-8 z-40 flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-all cursor-pointer group"
      aria-label="Scroll to top"
    >
      <div className="bg-[#2E5E99]/10 group-hover:bg-[#2E5E99] p-2.5 rounded-full transition-colors">
        <ChevronUp className="h-5 w-5 text-[#2E5E99] group-hover:text-white transition-colors" />
      </div>
      <span
        className="text-[10px] uppercase tracking-[0.15em] text-[#2E5E99]/70 group-hover:text-[#2E5E99] transition-colors"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Top
      </span>
    </button>
  )
}
