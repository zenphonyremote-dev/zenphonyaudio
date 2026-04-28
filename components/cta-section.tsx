"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="relative py-24 px-6 lg:px-8 overflow-hidden">
      <div className="relative max-w-6xl mx-auto z-10">

        {/* ATLE 2.5 Orb with conic ring + sound bars */}
        <div className="flex justify-center mb-12">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
            {/* Outer aurora glow — no blur filter, larger soft gradient instead */}
            <div
              className="absolute -inset-20 pointer-events-none"
              style={{
                background: `
                  radial-gradient(50% 50% at 50% 50%, hsla(var(--hue), 90%, 65%, 0.2), transparent 70%),
                  radial-gradient(40% 40% at 30% 60%, hsla(var(--hue-sec), 85%, 55%, 0.15), transparent 70%)
                `,
              }}
            />

            {/* Rotating conic ring - outer */}
            <div className="absolute inset-0 animate-spin-slow">
              <div
                className="absolute inset-4 rounded-full"
                style={{
                  border: "1px solid transparent",
                  borderImage: "conic-gradient(from 0deg, var(--lb-primary), var(--lb-secondary), var(--lb-primary)) 1",
                  borderRadius: "50%",
                  opacity: 0.3,
                  transform: "rotateX(75deg)",
                }}
              />
            </div>
            <div className="absolute inset-0 animate-spin-slow-reverse">
              <div
                className="absolute inset-8 rounded-full"
                style={{
                  border: "1px solid hsla(var(--hue-sec), 85%, 55%, 0.4)",
                  borderRadius: "50%",
                  transform: "rotateX(75deg)",
                }}
              />
            </div>

            {/* Floating orb */}
            <div className="absolute inset-12 animate-float">
              {/* Core sphere */}
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `linear-gradient(135deg,
                    hsla(var(--hue), 90%, 65%, 0.8),
                    hsla(var(--hue-sec), 85%, 55%, 0.6),
                    hsla(var(--hue), 80%, 52%, 0.8))`,
                  boxShadow: "0 0 60px var(--lb-glow), inset 0 -20px 40px rgba(0, 0, 0, 0.3)",
                }}
              >
                {/* Inner specular highlight */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/20" />

                {/* Waveform bars on sphere — driven by ATLE DSP channels */}
                <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-white/80 rounded-full"
                      style={{
                        height: `calc(20% + var(--atle-dsp-abs-${i % 8}) * 50%)`,
                        transformOrigin: "bottom",
                        transition: "height 0.05s linear",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Orbiting sparkle dots — ATLE spin-driven */}
            <div className="absolute inset-0 animate-spin-slow">
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full lb-sparkle-dot"
              />
            </div>
            <div className="absolute inset-0 animate-spin-slow-reverse">
              <div
                className="absolute bottom-4 right-4 w-4 h-4 rounded-full"
                style={{
                  background: "var(--lb-secondary)",
                  boxShadow: "0 0 12px hsla(var(--hue-sec), 85%, 55%, 0.6)",
                }}
              />
            </div>
            <div className="absolute inset-0 animate-spin-slow">
              <div
                className="absolute top-1/4 left-0 w-2 h-2 rounded-full"
                style={{
                  background: "var(--lb-accent)",
                  boxShadow: "0 0 8px var(--lb-glow)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to{" "}
            <span className="text-gradient-primary">
              Transform
            </span>
            <br />
            Your Sound?
          </h2>

          <p className="text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Join creators who trust Zenphony to elevate their audio with AI-powered intelligence.
          </p>

          {/* Pearl bar accent */}
          <div className="flex justify-center mb-10">
            <div className="lb-pearl-bar w-32" style={{ height: "4px" }} />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products/listen-buddy">
              <button className="lb-talk-btn text-lg px-10 py-4 inline-flex items-center gap-2">
                Explore Listen Buddy
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/contact">
              <button className="lb-chip text-lg px-10 py-4 font-semibold">
                Get in Touch
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
