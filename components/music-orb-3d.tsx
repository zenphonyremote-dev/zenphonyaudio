"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface MusicOrb3DProps {
  className?: string
  /** 0–1 proximity to next section (drives glow/ripple) */
  proximity?: number
}

export function MusicOrb3D({ className, proximity = 0 }: MusicOrb3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const [entered, setEntered] = useState(false)
  const [tiltX, setTiltX] = useState(0)
  const [tiltY, setTiltY] = useState(0)
  const [ripples, setRipples] = useState<number[]>([])
  const lastRippleRef = useRef(0)

  // Stagger entrance 100ms after mount
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Mouse parallax — subtle tilt toward cursor
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current
      if (!el) { rafRef.current = 0; return }
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (window.innerWidth / 2)
      const dy = (e.clientY - cy) / (window.innerHeight / 2)
      setTiltY(dx * 12)
      setTiltX(-dy * 8)
      rafRef.current = 0
    })
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [handleMouseMove])

  // Emit ripples when proximity crosses thresholds
  useEffect(() => {
    if (proximity > 0.3 && Date.now() - lastRippleRef.current > 1200) {
      lastRippleRef.current = Date.now()
      const id = Date.now()
      setRipples(prev => [...prev, id])
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r !== id))
      }, 1800)
    }
  }, [proximity])

  // Waveform speed multiplier based on proximity
  const waveSpeed = 1 + proximity * 1.5

  return (
    <div
      ref={containerRef}
      className={cn("relative flex items-center justify-center", className)}
      style={{ perspective: "600px" }}
    >
      {/* Outer wrapper: entrance + idle float */}
      <div
        className={cn(entered ? "animate-orb-pop-in" : "opacity-0")}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Idle float + mouse tilt */}
        <div
          className={cn(entered && "animate-orb-float-3d")}
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
            transition: "transform 0.15s ease-out",
          }}
        >
          <div
            className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Layer 1 (z:-20px): Ambient glow blur */}
            <div
              className="absolute inset-[-30%] rounded-full"
              style={{
                transform: "translateZ(-20px)",
                background: `radial-gradient(circle, oklch(0.7 0.25 290 / ${0.3 + proximity * 0.3}) 0%, oklch(0.6 0.26 300 / ${0.12 + proximity * 0.15}) 50%, transparent 70%)`,
                filter: "blur(20px)",
                transition: "background 0.4s ease",
              }}
            />

            {/* Layer 2 (z:-10px): Spinning outer ring */}
            <div
              className="absolute inset-[-8%] rounded-full animate-orb-ring-spin"
              style={{
                transform: "translateZ(-10px)",
                border: "1.5px solid oklch(1 0 0 / 0.1)",
                background: "conic-gradient(from 0deg, oklch(0.7 0.25 290 / 0.2), oklch(0.75 0.2 320 / 0.1), oklch(0.8 0.14 200 / 0.15), oklch(0.7 0.25 290 / 0.2))",
                mask: "radial-gradient(circle, transparent 60%, black 62%, black 100%)",
                WebkitMask: "radial-gradient(circle, transparent 60%, black 62%, black 100%)",
              }}
            />

            {/* Layer 3 (z:0): Core sphere with gradient + specular */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                transform: "translateZ(0px)",
                background: `
                  radial-gradient(circle at 35% 30%, oklch(1 0 0 / 0.15) 0%, transparent 40%),
                  radial-gradient(circle at 60% 70%, oklch(0.6 0.26 300 / 0.5) 0%, transparent 50%),
                  radial-gradient(circle at 40% 50%, oklch(0.65 0.25 290) 0%, oklch(0.50 0.22 300) 60%, oklch(0.35 0.18 285) 100%)
                `,
                boxShadow: `
                  inset 0 -4px 12px oklch(0 0 0 / 0.3),
                  inset 0 2px 8px oklch(1 0 0 / 0.08),
                  0 0 ${20 + proximity * 40}px oklch(0.7 0.25 290 / ${0.2 + proximity * 0.3})
                `,
                transition: "box-shadow 0.4s ease",
              }}
            />

            {/* Layer 4 (z:10px): Waveform bars */}
            <div
              className="absolute inset-0 flex items-center justify-center gap-[3px]"
              style={{ transform: "translateZ(10px)" }}
            >
              {[0.6, 0.9, 0.5, 1, 0.7, 0.85, 0.55].map((height, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full"
                  style={{
                    height: `${height * 28}px`,
                    background: `linear-gradient(to top, oklch(0.8 0.14 200 / 0.8), oklch(0.75 0.2 320 / 0.9), oklch(1 0 0 / 0.7))`,
                    animation: `orb-waveform-bar ${0.6 / waveSpeed + i * 0.08}s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>

            {/* Layer 5 (z:20px): Glass reflective highlight */}
            <div
              className="absolute rounded-full animate-orb-specular"
              style={{
                width: "55%",
                height: "35%",
                top: "8%",
                left: "18%",
                transform: "translateZ(20px)",
                background: "linear-gradient(180deg, oklch(1 0 0 / 0.18) 0%, oklch(1 0 0 / 0.02) 100%)",
                borderRadius: "50%",
                filter: "blur(2px)",
              }}
            />

            {/* Proximity ripples */}
            {ripples.map(id => (
              <div
                key={id}
                className="absolute inset-0 rounded-full animate-orb-ripple"
                style={{
                  border: "1.5px solid oklch(0.7 0.25 290 / 0.4)",
                  transform: "translateZ(5px)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Ground shadow */}
      <div
        className={cn(
          "absolute rounded-full animate-orb-shadow",
          entered ? "opacity-25" : "opacity-0"
        )}
        style={{
          width: "65%",
          height: "12%",
          bottom: "-8%",
          left: "17.5%",
          background: "radial-gradient(ellipse, oklch(0.7 0.25 290 / 0.4) 0%, transparent 70%)",
          filter: "blur(8px)",
          transition: "opacity 0.8s ease",
        }}
      />
    </div>
  )
}
