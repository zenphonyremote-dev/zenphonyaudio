"use client"

import { useAtle } from "@/hooks/use-atle"

export function AtleProvider({ children }: { children: React.ReactNode }) {
  useAtle(1.0)
  return <>{children}</>
}
