"use client"

import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function ServicesSection() {

  return (
    <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-[1400px] mx-auto relative z-10 px-4 sm:px-8 lg:px-12">
        {/* Split Layout - Editorial Style */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center">

          {/* Left Content Block */}
          <div className="space-y-8 lg:pr-8 text-center lg:text-left">
            {/* Eyebrow Label */}
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-violet-500 to-transparent" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
                Audio Intelligence
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-violet-500 to-transparent lg:hidden" />
            </div>

            {/* Large Editorial Headline */}
            <div className="px-2 sm:px-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight">
                <span className="block pb-1">Meet your</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-300">
                  new buddy
                </span>
              </h2>
            </div>

            {/* Supporting Copy */}
            <p className="text-lg lg:text-xl text-white/50 leading-relaxed max-w-lg mx-auto lg:mx-0">
              AI-powered mix feedback engineered by Zenphony DSP Lab. Real-time spectral intelligence that elevates your sound.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <Link href="/products/listen-buddy">
                <Button
                  size="lg"
                  className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold px-8 py-6 text-base shadow-[0_8px_32px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_40px_rgba(139,92,246,0.6)] transition-all duration-300 border-0"
                >
                  Explore Listen Buddy
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-white/40 hover:text-white transition-colors flex items-center gap-2 group"
              >
                Learn more
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Subtle Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-6 border-t border-white/10">
              <div>
                <p className="text-2xl font-black text-white">Real-time</p>
                <p className="text-xs text-white/40 uppercase tracking-wider">Processing</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-black text-white">VST3/AU</p>
                <p className="text-xs text-white/40 uppercase tracking-wider">Compatible</p>
              </div>
            </div>
          </div>

          {/* Right Visual Block - Product Mockup */}
          <div className="relative w-full lg:w-[120%] lg:-mr-[20%] aspect-[4/3]">

            {/* Floating Decorative Elements */}
            {/* Top Right - Frequency Badge */}
            <div className="absolute -top-4 -right-2 lg:right-8 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-sm font-semibold text-white">AI Powered</span>
            </div>

            {/* Top Left - Floating Card */}
            <div className="absolute -top-6 -left-4 lg:-left-8 z-20 p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Mix Analysis</p>
                  <p className="text-xs text-white/50">Real-time feedback</p>
                </div>
              </div>
            </div>

            {/* Bottom Left - Stats Card */}
            <div className="absolute -bottom-4 -left-4 lg:-left-6 z-20 p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-violet-400">98%</p>
                  <p className="text-xs text-white/50">Accuracy</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">0.1s</p>
                  <p className="text-xs text-white/50">Latency</p>
                </div>
              </div>
            </div>

            {/* Bottom Right - Waveform Card */}
            <div className="absolute -bottom-6 -right-2 lg:right-4 z-20 p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex items-end gap-0.5 h-8">
                  <div className="w-1.5 bg-gradient-to-t from-violet-500 to-fuchsia-500 rounded-full animate-pulse" style={{ height: '60%' }} />
                  <div className="w-1.5 bg-gradient-to-t from-violet-500 to-fuchsia-500 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.1s' }} />
                  <div className="w-1.5 bg-gradient-to-t from-violet-500 to-fuchsia-500 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.2s' }} />
                  <div className="w-1.5 bg-gradient-to-t from-violet-500 to-fuchsia-500 rounded-full animate-pulse" style={{ height: '80%', animationDelay: '0.3s' }} />
                  <div className="w-1.5 bg-gradient-to-t from-violet-500 to-fuchsia-500 rounded-full animate-pulse" style={{ height: '50%', animationDelay: '0.4s' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Spectral</p>
                  <p className="text-xs text-white/50">Analysis</p>
                </div>
              </div>
            </div>

            {/* Orbiting Dots */}
            <div className="absolute top-1/2 -left-8 w-3 h-3 rounded-full bg-violet-500 blur-[2px] animate-pulse" />
            <div className="absolute top-1/4 -right-4 w-2 h-2 rounded-full bg-fuchsia-500 blur-[1px] animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-1/4 -left-6 w-2 h-2 rounded-full bg-cyan-500 blur-[1px] animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Animated Glow Ring */}
            <div className="absolute -inset-6 bg-gradient-to-r from-violet-600/40 via-fuchsia-500/30 to-indigo-600/40 rounded-3xl blur-3xl animate-pulse" />

            {/* Secondary Glow */}
            <div className="absolute -inset-3 bg-gradient-to-br from-violet-500/30 to-transparent rounded-3xl blur-2xl" />

            {/* Connecting Lines - Decorative */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(139, 92, 246, 0)" />
                  <stop offset="50%" stopColor="rgba(139, 92, 246, 0.5)" />
                  <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
                </linearGradient>
              </defs>
            </svg>

            {/* Main Image Container */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-white/20 bg-black/20 backdrop-blur-sm shadow-2xl shadow-violet-500/30">
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

              {/* Top Highlight */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent" />
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-violet-500/20 to-transparent" />

              {/* Inner Floating Elements */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-white">Live</span>
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/80 backdrop-blur-md border border-violet-400/30">
                <span className="text-xs font-semibold text-white">PRO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
