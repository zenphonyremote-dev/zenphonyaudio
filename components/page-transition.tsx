"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { MusicOrb3D } from "./music-orb-3d"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    setIsLoading(true)
    setShowContent(false)

    const timer = setTimeout(() => {
      setIsLoading(false)
      setShowContent(true)
    }, 800)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <>
      {/* Loading Overlay with 3D Orb */}
      {isLoading && (
        <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center">
          {/* Animated gradient background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "-1s" }} />
          </div>

          {/* 3D Orb — center stage */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            <MusicOrb3D className="w-40 h-40 sm:w-48 sm:h-48" />

            {/* Subtle loading text */}
            <div className="flex items-center gap-2 opacity-50">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Page content */}
      <div
        className={`transition-all duration-500 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {children}
      </div>
    </>
  )
}
