"use client"

import { useEffect, useState, useRef } from "react"

/**
 * Measures how close the orb element is to the bottom of the viewport.
 * Returns a 0–1 value: 0 = far from edge, 1 = touching/past.
 */
export function useOrbProximity(
  orbRef: React.RefObject<HTMLElement | null>,
  threshold = 300
) {
  const [proximity, setProximity] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const calculate = () => {
      const el = orbRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const viewportH = window.innerHeight

      // Distance from orb bottom to viewport bottom
      const distToBottom = viewportH - rect.bottom
      // Distance from orb top to viewport top
      const distToTop = rect.top

      // Use the closer edge
      const minDist = Math.min(
        Math.max(distToBottom, 0),
        Math.max(distToTop, 0)
      )

      const value = Math.max(0, Math.min(1, 1 - minDist / threshold))
      setProximity(value)
    }

    const onScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        calculate()
        rafRef.current = 0
      })
    }

    calculate()

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [orbRef, threshold])

  return proximity
}
