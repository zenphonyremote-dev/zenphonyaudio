"use client"

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function ServicesSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 xl:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-[1400px] mx-auto relative z-10 px-2 sm:px-4 lg:px-8 xl:px-12">
        {/* Split Layout - Editorial Style */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 xl:gap-24 items-center">

          {/* Left Content Block */}
          <div className="space-y-5 sm:space-y-6 lg:space-y-8 lg:pr-8 text-center lg:text-left">
            {/* Eyebrow Label */}
            <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3">
              <div className="h-px w-6 sm:w-8" style={{ background: "linear-gradient(90deg, var(--lb-primary), transparent)" }} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em]" style={{ color: "var(--lb-accent)" }}>
                Audio Intelligence
              </span>
              <div className="h-px w-6 sm:w-8 lg:hidden" style={{ background: "linear-gradient(270deg, var(--lb-primary), transparent)" }} />
            </div>

            {/* Large Editorial Headline */}
            <div className="px-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black text-white leading-[1.05] tracking-tight">
                <span className="block pb-1">Meet your</span>
                <span className="block text-gradient-primary">
                  new buddy
                </span>
              </h2>
            </div>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg lg:text-xl leading-relaxed max-w-lg mx-auto lg:mx-0 px-2" style={{ color: "var(--muted-foreground)" }}>
              AI-powered mix feedback engineered by Zenphony DSP Lab. Real-time spectral intelligence that elevates your sound.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2 sm:pt-4 px-2">
              <Link href="/products/listen-buddy" className="w-full sm:w-auto">
                <button
                  className="lb-talk-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  Explore Listen Buddy
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium transition-colors flex items-center gap-2 group"
                style={{ color: "var(--muted-foreground)" }}
              >
                Learn more
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Subtle Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 pt-4 sm:pt-6" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-black text-white">Real-time</p>
                <p className="text-xs uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Processing</p>
              </div>
              <div className="w-px h-8 sm:h-10" style={{ background: "rgba(255, 255, 255, 0.06)" }} />
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-black text-white">VST3/AU</p>
                <p className="text-xs uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Compatible</p>
              </div>
            </div>
          </div>

          {/* Right Visual Block - Product Mockup */}
          <div className="relative w-full lg:w-[120%] lg:-mr-[20%] aspect-[4/3]">
            {/* ATLE bloom glow — opacity from ATLE scale */}
            <div
              className="absolute -inset-6 rounded-3xl animate-pulse-glow"
              style={{
                background: `
                  radial-gradient(ellipse at 30% 30%, hsla(var(--hue), 90%, 65%, 0.4), transparent 60%),
                  radial-gradient(ellipse at 70% 70%, hsla(var(--hue-sec), 85%, 55%, 0.3), transparent 60%)
                `,
              }}
            />

            {/* Main Image Container */}
            <div
              className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
              style={{
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 40px 120px rgba(0, 0, 0, 0.5), 0 0 80px hsla(var(--hue), 90%, 65%, 0.06)",
              }}
            >
              {/* Plugin Interface Image */}
              <Image
                src="/listen-buddy-plugin-interface-purple.jpg"
                alt="Listen Buddy Plugin Interface"
                fill
                className="object-cover"
                priority
              />

              {/* Subtle Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

              {/* Glow rule at top */}
              <div className="absolute top-0 left-0 right-0 lb-glow-rule" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
