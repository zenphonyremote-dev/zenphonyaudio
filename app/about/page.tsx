"use client"

import { Footer } from "@/components/footer"
import { Heart, Target, Lightbulb, Users, Zap } from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "Passion for Audio",
    description: "We live and breathe sound. Every feature we build comes from our deep love for audio creation.",
  },
  {
    icon: Target,
    title: "User-Focused",
    description: "Your workflow is our priority. We design tools that feel intuitive and empower creativity.",
  },
  {
    icon: Lightbulb,
    title: "Innovation First",
    description: "We push the boundaries of what's possible with AI and audio technology.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-hidden lb-aurora">
      <div className="relative z-10">

        {/* Hero Section with Waveform */}
        <section className="relative pt-32 pb-20 px-6 lg:px-8">
          <div className="relative max-w-4xl mx-auto text-center">
            {/* Horizontal Waveform Behind Headline */}
            {/* Waveform — ATLE DSP-driven, 8 channels cycle across 40 bars */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden">
              <div className="flex items-center justify-center gap-[3px] opacity-15 w-full px-4">
                {[...Array(40)].map((_, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full flex-shrink-0"
                    style={{
                      height: `calc(12px + var(--atle-dsp-abs-${i % 8}) * 100px)`,
                      background: "linear-gradient(to top, var(--lb-primary), var(--lb-secondary))",
                      transition: "height 0.05s linear",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Badge */}
            <div
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <Users className="w-4 h-4" style={{ color: "var(--lb-accent)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--lb-accent)" }}>Our Story</span>
            </div>

            <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              About{" "}
              <span className="text-gradient-primary">
                Zenphony Audio
              </span>
            </h1>

            <p className="relative text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: "var(--muted-foreground)" }}>
              Zenphony Audio was founded by two hybrid engineers and composers working across popular music and film.
            </p>

            {/* Stats */}
            <div
              className="relative inline-flex items-center gap-8 px-6 py-4 rounded-2xl"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-white">2025</p>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Founded</p>
              </div>
              <div className="w-px h-10" style={{ background: "rgba(255, 255, 255, 0.06)" }} />
              <div className="text-center">
                <p className="text-2xl font-bold text-gradient-primary">Clarity</p>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Our Focus</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div
              className="rounded-3xl p-8 lg:p-12 lb-glass"
              style={{ borderRadius: "24px", padding: "2rem" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "hsla(var(--hue), 90%, 65%, 0.15)" }}
                >
                  <Zap className="w-5 h-5" style={{ color: "var(--lb-accent)" }} />
                </div>
                <h2 className="text-2xl font-bold text-white">Our Mission</h2>
              </div>

              <div className="space-y-4 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                <p className="text-lg text-white/80">
                  We build tools that solve problems we've encountered repeatedly in our own work—problems existing audio software never fully addressed.
                </p>
                <p>
                  Our focus is clarity, perception, and decision-making: helping creators understand what they're hearing so they can move forward with confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Our Values
              </h2>
              <p style={{ color: "var(--muted-foreground)" }} className="max-w-xl mx-auto">
                The principles that guide everything we build
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <div
                    key={index}
                    className="group relative animate-float"
                    style={{ animationDelay: `${index * -2}s` }}
                  >
                    {/* Glow effect */}
                    <div
                      className="absolute -inset-2 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                      style={{
                        background: `radial-gradient(ellipse, var(--lb-glow), transparent)`,
                      }}
                    />

                    {/* Card */}
                    <div
                      className="relative rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                      style={{
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                        style={{ background: "hsla(var(--hue), 90%, 65%, 0.15)" }}
                      >
                        <Icon className="w-6 h-6" style={{ color: "var(--lb-accent)" }} />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{value.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
