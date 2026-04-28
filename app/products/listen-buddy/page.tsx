"use client"

import { Footer } from "@/components/footer"
import { ArrowRight, Check, Headphones, BarChart3, Waves, Zap, Music, Mic, Download, Play, Sparkles, MessageCircle, Library, Settings2, Film, Megaphone, Crown, AudioWaveform } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

const galleryImages = [
  { src: "/listen-buddy-film.jpg", alt: "Listen Buddy - Film Mode Analysis" },
  { src: "/listen-buddy-commercial.jpg", alt: "Listen Buddy - Commercial Mode Analysis" },
  { src: "/listen-buddy-mix.jpg", alt: "Listen Buddy - Mix Mode Analysis" },
]

const listeningModes = [
  { icon: Music, label: "Mixing", desc: "Balance, clarity, and translation" },
  { icon: AudioWaveform, label: "Production", desc: "Instrumentation and Arrangement" },
  { icon: Crown, label: "Mastering", desc: "Final polish and consistency" },
  { icon: Mic, label: "Podcast", desc: "Clarity and presence" },
  { icon: Film, label: "Film", desc: "Dialogue and cinematic balance" },
  { icon: Megaphone, label: "Commercial", desc: "Attention-focused sound" },
]

const exampleInsights = [
  "The vocal is competing with the synth pad in the 2-4kHz range. Consider ducking the pad during vocal phrases or carving out space with a dynamic EQ.",
  "Stereo image instability is occurring because transient content is pulling center information leftward during the chorus sections.",
  "Compression timing is reducing rhythmic definition. Consider adjusting attack and release to let more transients through.",
]

const features = [
  {
    icon: Waves,
    title: "Spectral Visualization",
    description: "See your sound in stunning detail",
    image: "/sound-wave-visualization-purple-cyan-abstract.jpg",
    gradientStyle: "linear-gradient(135deg, #06b6d4, #14b8a6, #10b981)",
    glowStyle: "rgba(6, 182, 212, 0.3)",
  },
  {
    icon: Headphones,
    title: "References",
    description: "Compare against professional tracks",
    image: "/abstract-3d-purple-headphones-floating-neon-glow.jpg",
    gradientStyle: "linear-gradient(135deg, #f59e0b, #f97316, #ef4444)",
    glowStyle: "rgba(249, 115, 22, 0.3)",
  },
  {
    icon: BarChart3,
    title: "Mix Analysis",
    description: "Real-time spectral analysis of your audio mix",
    image: "/audio-spectrum-analyzer-purple-neon-visualization.jpg",
    gradientStyle: "linear-gradient(135deg, #7c3aed, #8b5cf6, #6366f1)",
    glowStyle: "rgba(139, 92, 246, 0.3)",
  },
  {
    icon: Zap,
    title: "AI Feedback",
    description: "Get intelligent suggestions to improve your mix",
    image: "/futuristic-audio-interface-purple-holographic-ui.jpg",
    gradientStyle: "linear-gradient(135deg, #d946ef, #ec4899, #f43f5e)",
    glowStyle: "rgba(236, 72, 153, 0.3)",
  },
]

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    color: "cyan",
    minutes: 10,
    cloudMinutes: 5,
    pricePerMin: null, // Free tier
    features: ["All listening modes", "Limited plugin chat"],
  },
  {
    id: "basic",
    name: "Basic",
    price: 7.99,
    yearlyPrice: 85,
    color: "emerald",
    minutes: 60,
    cloudMinutes: 30,
    pricePerMin: 0.133,
    features: ["All listening modes", "Unlimited plugin chat"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29.99,
    yearlyPrice: 320,
    popular: true,
    color: "violet",
    minutes: 240,
    cloudMinutes: 120,
    pricePerMin: 0.125,
    features: ["All listening modes", "Unlimited plugin chat"],
  },
  {
    id: "max",
    name: "Max",
    price: 69.99,
    yearlyPrice: 780,
    color: "amber",
    minutes: 700,
    cloudMinutes: 350,
    pricePerMin: 0.100,
    features: ["All listening modes", "Unlimited plugin chat"],
  },
]

const topUps = [
  {
    id: "small",
    name: "Small",
    price: 4.99,
    minutes: 20,
    pricePerMin: 0.25,
    color: "cyan",
  },
  {
    id: "medium",
    name: "Medium",
    price: 9.99,
    minutes: 45,
    pricePerMin: 0.222,
    color: "violet",
    popular: true,
  },
  {
    id: "large",
    name: "Large",
    price: 19.99,
    minutes: 80,
    pricePerMin: 0.25,
    color: "amber",
  },
]

export default function ListenBuddyPage() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState("pro")
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="min-h-screen relative overflow-x-hidden lb-aurora">

      <div className="relative z-10">

        {/* Hero Section */}
        <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8">
          {/* Hero glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 50% 50%, hsla(var(--hue), 90%, 65%, 0.15), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />

          <div className="relative max-w-4xl mx-auto text-center">
            {/* Listen Buddy Logo */}
            <div className="inline-flex flex-col items-center mb-6 sm:mb-8 lg:mb-10">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">LISTEN</span>
                {/* Listen Buddy Icon */}
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 overflow-hidden">
                  <Image
                    src="/listen-buddy-icon.png"
                    alt="Listen Buddy Icon"
                    fill
                    className="object-cover object-left"
                    priority
                  />
                </div>
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-primary">BUDDY</span>
              </div>
              <span className="text-xs sm:text-sm md:text-base text-white/60 font-medium uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1 sm:mt-2">Audio Analysis Plugin</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
              Make faster, more confident{" "}
              <span className="text-gradient-primary">
                mix decisions.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/60 max-w-2xl mx-auto mb-6 sm:mb-8 lg:mb-10 leading-relaxed px-2">
              Listen Buddy is an AI-powered audio analysis plugin that helps your track translate, hit harder, and get to &quot;done&quot; sooner.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 lg:mb-16 px-2">
              {user ? (
                <Link href="/checkout?plan=free" className="w-full sm:w-auto">
                  <button className="lb-talk-btn w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 text-sm sm:text-base lg:text-lg">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    Start Free Trial
                  </button>
                </Link>
              ) : (
                <Link href="/login" className="w-full sm:w-auto">
                  <button className="lb-talk-btn w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 text-sm sm:text-base lg:text-lg">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    Start Free Trial
                  </button>
                </Link>
              )}
              <button
                onClick={() => document.getElementById('what-you-get')?.scrollIntoView({ behavior: 'smooth' })}
                className="lb-chip w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 text-sm sm:text-base lg:text-lg border-white/20 text-white hover:bg-white/5"
              >
                See How It Works
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </button>
            </div>

            {/* Product Gallery Carousel */}
            <div className="relative max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
              {/* ATLE-driven glow effects */}
              <div className="absolute -inset-8 rounded-[3rem] pointer-events-none" style={{
                background: "radial-gradient(ellipse, var(--lb-glow), transparent)",
                transform: "scale(var(--atle-scale))",
                opacity: "calc(0.3 + var(--atle-scale) * 0.2)"
              }} />
              <div className="absolute -inset-4 rounded-3xl pointer-events-none" style={{
                background: "radial-gradient(ellipse at 30% 50%, hsla(var(--hue), 90%, 65%, 0.2), transparent 70%)",
                transform: "translate(var(--atle-fx), var(--atle-fy))"
              }} />

              <Carousel
                opts={{
                  align: "center",
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 4000,
                  }),
                ]}
                className="w-full"
              >
                <CarouselContent>
                  {galleryImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden">
                        {/* Main Image Container */}
                        <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-white/20 glow-md">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover"
                            priority={index === 0}
                          />

                          {/* Overlay Gradients */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                          {/* Top Highlight */}
                          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

                          {/* Left Highlight */}
                          <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-white/40 via-white/10 to-transparent" />

                          {/* Corner Accents */}
                          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent" />
                          <div className="absolute bottom-0 right-0 w-32 h-32" style={{ background: "linear-gradient(to top left, hsla(var(--hue), 90%, 65%, 0.3), transparent)" }} />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-2 sm:-left-4 lg:-left-6 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-black/60 border-white/20 text-white hover:border-[color:var(--lb-primary)] transition-all shadow-lg" style={{ ["--tw-shadow-color" as string]: "var(--lb-glow)" }} />
                <CarouselNext className="-right-2 sm:-right-4 lg:-right-6 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-black/60 border-white/20 text-white hover:border-[color:var(--lb-primary)] transition-all shadow-lg" style={{ ["--tw-shadow-color" as string]: "var(--lb-glow)" }} />
              </Carousel>

              {/* Slide Indicators Text */}
              <div className="flex justify-center mt-6 gap-2">
                <span className="text-sm text-white/40">Swipe or use arrows to explore</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section - 2x2 Grid on Mobile, 3D Spread on Desktop */}
        <section className="relative py-20 px-6 lg:px-8">
          {/* Section glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 50% 40%, hsla(var(--hue-sec), 85%, 55%, 0.1), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />

          <div className="relative max-w-6xl mx-auto">
            {/* Mobile: 2x2 Grid Layout */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:hidden">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="relative">
                    <div
                      className="absolute -inset-2 rounded-2xl blur-xl opacity-30"
                      style={{ background: feature.glowStyle }}
                    />
                    <div className="relative rounded-2xl overflow-hidden lb-glass shadow-xl shadow-black/30">
                      <div className="relative h-28 sm:h-36 overflow-hidden">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          className="object-cover"
                        />
                        <div
                          className="absolute inset-0 opacity-40 mix-blend-overlay"
                          style={{ background: feature.gradientStyle }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div
                          className="absolute bottom-2 left-2 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shadow-lg"
                          style={{ background: feature.gradientStyle }}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                      </div>
                      <div className="p-3 sm:p-4">
                        <h4 className="text-sm sm:text-base font-bold text-white mb-1">{feature.title}</h4>
                        <p className="text-xs sm:text-sm text-white/50 leading-snug line-clamp-2">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop: 3D Perspective Spread Layout */}
            <div className="hidden lg:flex relative items-center justify-center h-[550px] perspective-[1500px]">
              {features.map((feature, index) => {
                const Icon = feature.icon

                const transforms = {
                  0: "translateX(-120%) translateZ(-100px) rotateY(25deg) scale(0.85)",
                  1: "translateX(-55%) translateZ(0px) rotateY(8deg) scale(0.95)",
                  2: "translateX(55%) translateZ(0px) rotateY(-8deg) scale(0.95)",
                  3: "translateX(120%) translateZ(-100px) rotateY(-25deg) scale(0.85)",
                }

                const zIndexes = { 0: 1, 1: 3, 2: 3, 3: 1 }
                const blurs = { 0: "blur-[1px]", 1: "", 2: "", 3: "blur-[1px]" }
                const opacities = { 0: "opacity-70", 1: "opacity-100", 2: "opacity-100", 3: "opacity-70" }

                return (
                  <div
                    key={index}
                    className={`absolute w-[380px] xl:w-[420px] transition-all duration-500 ease-out cursor-pointer hover:scale-105 ${blurs[index as keyof typeof blurs]} ${opacities[index as keyof typeof opacities]}`}
                    style={{
                      transform: transforms[index as keyof typeof transforms],
                      zIndex: zIndexes[index as keyof typeof zIndexes],
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div
                      className="absolute -inset-4 rounded-[2rem] blur-2xl opacity-50"
                      style={{ background: feature.glowStyle }}
                    />
                    <div className="relative rounded-3xl overflow-hidden lb-glass shadow-2xl shadow-black/40">
                      <div className="relative h-64 xl:h-72 overflow-hidden">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          className="object-cover"
                        />
                        <div
                          className="absolute inset-0 opacity-40 mix-blend-overlay"
                          style={{ background: feature.gradientStyle }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div
                          className="absolute bottom-3 left-3 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                          style={{ background: feature.gradientStyle }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5" style={{ color: "var(--lb-accent)" }} />
                          <span className="text-sm uppercase tracking-wider font-semibold" style={{ color: "var(--lb-accent)" }}>Pro Feature</span>
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-1">{feature.title}</h4>
                        <p className="text-lg text-white/50 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* AI Audio Analysis Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          {/* Section glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 30% 50%, hsla(var(--hue), 90%, 65%, 0.12), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />

          <div className="relative max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-10 items-start">
              {/* Left Content - Bigger Card */}
              <div className="lb-glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 lb-bloom">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6" style={{ background: "hsla(var(--hue), 90%, 65%, 0.1)", borderWidth: 1, borderStyle: "solid", borderColor: "hsla(var(--hue), 90%, 65%, 0.2)" }}>
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "var(--lb-accent)" }} />
                  <span className="text-sm sm:text-base lg:text-lg font-medium" style={{ color: "var(--lb-accent)" }}>AI Audio Analysis</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
                  This is where Listen Buddy{" "}
                  <span className="text-gradient-primary">
                    actually listens.
                  </span>
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-white/70 font-medium mb-6 sm:mb-8">
                  Upload your track and receive:
                </p>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {["Detailed Mix Analysis", "Stereo field diagnostics", "Dynamic range assessment", "Actionable feedback on what needs attention"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl lb-glass">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsla(var(--hue), 90%, 65%, 0.2)" }}>
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "var(--lb-accent)" }} />
                      </div>
                      <span className="text-sm sm:text-base lg:text-lg xl:text-xl text-white/70 font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 sm:p-6 rounded-lg sm:rounded-xl" style={{ background: "hsla(var(--hue), 90%, 65%, 0.1)", borderWidth: 1, borderStyle: "solid", borderColor: "hsla(var(--hue), 90%, 65%, 0.2)" }}>
                  <p className="text-base sm:text-lg lg:text-xl text-white/70 font-medium">
                    Try <Link href="/checkout?plan=free" className="font-semibold hover:opacity-80 underline underline-offset-2 transition-colors" style={{ color: "var(--lb-accent)" }}>10 minutes</Link> of listening completely free.
                  </p>
                </div>
              </div>

              {/* Right - Listening Modes */}
              <div className="lg:flex-1">
                <p className="text-base sm:text-lg lg:text-xl text-white/70 mb-4 sm:mb-6 font-semibold">Listening Modes</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  {listeningModes.map((mode, i) => (
                    <div key={i} className="lb-glass rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 lg:px-10 hover:border-[color:var(--lb-primary)] transition-all duration-300">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-5" style={{ background: "hsla(var(--hue), 90%, 65%, 0.15)" }}>
                        <mode.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" style={{ color: "var(--lb-accent)" }} />
                      </div>
                      <h4 className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white font-semibold mb-1 sm:mb-2 lg:mb-3">{mode.label}</h4>
                      <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-white/70 font-medium">{mode.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Download CTA */}
        <section className="relative py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          {/* Section glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 50% 50%, hsla(var(--hue), 90%, 65%, 0.1), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />

          <div className="relative max-w-xl mx-auto">
            <div className="lb-glass lb-bloom rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center">
              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="lb-talk-btn flex items-center justify-center gap-2 mx-auto px-6 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 text-base sm:text-lg mb-6 sm:mb-8"
              >
                <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                Download Listen Buddy
              </button>
              <div className="space-y-2 sm:space-y-3">
                {["Free plugin assistant (forever)", "Free audio analysis trial", "Install and start immediately"].map((text, i) => (
                  <div key={i} className="flex items-center justify-center gap-2 sm:gap-3 text-white/70 text-sm sm:text-base lg:text-lg font-medium">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* For Producers Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          {/* Section glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 60% 40%, hsla(var(--hue-sec), 85%, 55%, 0.1), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />

          <div className="relative max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 px-2">
              You can{" "}
              <span className="text-gradient-primary">
                feel the problem
              </span>
              ---but can&apos;t name it yet.
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/60 mb-8 sm:mb-10 lg:mb-12 max-w-2xl mx-auto px-2">
              Listen Buddy turns that instinct into clarity. Insert it, hit Analyze, and get precise feedback you can apply immediately.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {[
                { num: "1", label: "Capture", desc: "Capture the audio and Listen automatically" },
                { num: "2", label: "Analyze", desc: "One click to get feedback" },
                { num: "3", label: "Apply", desc: "Actionable moves, immediately" },
              ].map((item, i) => (
                <div key={i} className="lb-glass rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 glow-sm">
                  <div className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3" style={{ color: "var(--lb-accent)" }}>{item.num}</div>
                  <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-1 sm:mb-2">{item.label}</h4>
                  <p className="text-sm sm:text-base lg:text-lg text-white/70 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Musical Focus Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          {/* Section glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 40% 60%, hsla(var(--hue), 90%, 65%, 0.1), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />

          <div className="relative max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
                Built for{" "}
                <span className="text-gradient-primary">
                  translation-first listening.
                </span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-white/70 font-medium max-w-2xl mx-auto px-2">
                Balance, clarity, punch, width, and emotional read---not genre templates.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8 lg:mb-10">
              {[
                { label: "Balance", icon: BarChart3 },
                { label: "Clarity", icon: Sparkles },
                { label: "Punch", icon: Zap },
                { label: "Width", icon: Waves },
                { label: "Emotion", icon: Music },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 lb-glass rounded-full">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "var(--lb-accent)" }} />
                  <span className="text-white/70 text-sm sm:text-base lg:text-lg font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 text-center glow-sm" style={{ background: "hsla(var(--hue), 90%, 65%, 0.1)", borderWidth: 1, borderStyle: "solid", borderColor: "hsla(var(--hue), 90%, 65%, 0.2)" }}>
              <p className="text-base sm:text-lg lg:text-xl text-white/70 font-medium mb-3 sm:mb-4">Choose the lens that matches the job:</p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {["Mix", "Mastering", "Production", "Podcast", "Film", "Commercial"].map((mode, i) => (
                  <span key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 rounded-full text-sm sm:text-base lg:text-lg font-medium text-white/70">
                    {mode}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Plugin Assistant Chat Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          {/* Section glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 70% 50%, hsla(var(--hue), 90%, 65%, 0.1), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />

          <div className="relative max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
                Designed to stay{" "}
                <span className="text-gradient-primary">
                  fast and intuitive.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
              {/* Buddy Selector */}
              <div className="lb-glass rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 glow-sm">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-4 sm:mb-5 lg:mb-6">Choose Your Buddy</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-4 sm:p-5 rounded-lg sm:rounded-xl" style={{ background: "hsla(var(--hue), 90%, 65%, 0.1)", borderWidth: 1, borderStyle: "solid", borderColor: "hsla(var(--hue), 90%, 65%, 0.2)" }}>
                    <h4 className="font-semibold text-base sm:text-lg lg:text-xl mb-1 sm:mb-2" style={{ color: "var(--lb-accent)" }}>Velvet</h4>
                    <p className="text-sm sm:text-base lg:text-lg text-white/70 font-medium">Warm, detailed, thoughtful analysis.</p>
                  </div>
                  <div className="p-4 sm:p-5 bg-emerald-500/10 rounded-lg sm:rounded-xl border border-emerald-500/20">
                    <h4 className="font-semibold text-emerald-400 text-base sm:text-lg lg:text-xl mb-1 sm:mb-2">Verde</h4>
                    <p className="text-sm sm:text-base lg:text-lg text-white/70 font-medium">Fast, big-picture, clear direction.</p>
                  </div>
                </div>
              </div>

              {/* Plugin Assistant Chat */}
              <div className="lb-glass rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 glow-sm">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-4 sm:mb-5 lg:mb-6">Plugin Assistant Chat</h3>
                <p className="text-sm sm:text-base lg:text-lg text-white/70 font-medium mb-4 sm:mb-5 lg:mb-6">
                  Move from &quot;what&apos;s wrong&quot; to &quot;what do I do with my tools.&quot;
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {["Knows what's installed", "Recommends practical moves", "Provides reliable starting points"].map((text, i) => (
                    <div key={i} className="flex items-center gap-2 sm:gap-3">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                      <span className="text-sm sm:text-base lg:text-lg text-white/70 font-medium">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What You Get Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8" id="what-you-get">
          {/* Section glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 50% 30%, hsla(145, 85%, 55%, 0.08), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />

          <div className="relative max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 sm:mb-6">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                <span className="text-sm sm:text-base lg:text-lg text-emerald-300 font-medium">What You Get</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 px-2">
                Free Plugin Assistant ---{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Yours Forever
                </span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-white/70 font-medium max-w-xl mx-auto px-2">
                The moment you install Listen Buddy, you get:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
              {[
                { icon: MessageCircle, title: "Real-time mixing guidance", desc: "Ask questions and get immediate, practical answers." },
                { icon: Settings2, title: "Plugin workflow advice", desc: "Learn how your tools interact effectively." },
                { icon: Library, title: "Complete plugin knowledgebase", desc: "Every plugin you own, searchable and explained." },
              ].map((item, i) => (
                <div key={i} className="lb-glass rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:border-emerald-500/30 transition-all duration-300 glow-sm">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-emerald-600/20 flex items-center justify-center mb-3 sm:mb-4 lg:mb-5">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-white mb-2 sm:mb-3">{item.title}</h3>
                  <p className="text-sm sm:text-base lg:text-lg text-white/70 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 text-sm sm:text-base lg:text-lg">
              {["No subscription required", "No credit card", "Just install and use"].map((text, i) => (
                <div key={i} className="flex items-center gap-2 text-white/70 font-medium">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Message from Listen Buddy - Chat Style */}
            <div className="mt-12 sm:mt-16 lg:mt-20 max-w-3xl mx-auto">
              {/* Section Label */}
              <p className="text-center text-white/30 text-sm sm:text-base font-medium tracking-wide mb-4 sm:mb-6">
                Message from Listen Buddy
              </p>
              <div className="relative">
                {/* ATLE-driven floating glow effects */}
                <div className="absolute -inset-4 rounded-[2rem] pointer-events-none lb-bloom" style={{
                  background: "radial-gradient(ellipse, var(--lb-glow), transparent)",
                  transform: "scale(var(--atle-scale))",
                  opacity: "calc(0.25 + var(--atle-scale) * 0.15)"
                }} />

                {/* Chat container with 3D effect */}
                <div className="relative lb-glass-strong overflow-hidden"
                  style={{ transform: 'perspective(1000px) rotateX(2deg)', transformStyle: 'preserve-3d' }}>

                  {/* Chat header */}
                  <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-white/10 bg-white/[0.03]">
                    <div className="relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center glow-md" style={{ background: "linear-gradient(135deg, var(--lb-primary), var(--lb-secondary))" }}>
                        <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-black" style={{ boxShadow: "0 0 6px rgba(34, 197, 94, 0.6)" }} />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        Listen Buddy
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </h4>
                      <p className="text-xs sm:text-sm text-white/50">typing...</p>
                    </div>
                  </div>

                  {/* Chat message content */}
                  <div className="p-5 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
                    {/* Message bubble */}
                    <div className="relative">
                      <div className="rounded-2xl rounded-tl-sm p-4 sm:p-5" style={{ background: "linear-gradient(135deg, hsla(var(--hue), 90%, 65%, 0.2), hsla(var(--hue), 95%, 72%, 0.1))", borderWidth: 1, borderStyle: "solid", borderColor: "hsla(var(--hue), 90%, 65%, 0.2)" }}>
                        <p className="text-base sm:text-lg text-white/90 leading-relaxed mb-4">
                          Hey! Thanks for asking---let me give you the real story behind this.
                        </p>
                        <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                          First and most importantly: <span className="font-semibold" style={{ color: "var(--lb-accent)" }}>I&apos;m not some AI bot spitting out templates.</span> My architecture actually cares about music, records actual sounds with multiple inputs so my responses feel like a session on your desk.
                        </p>
                      </div>
                      {/* Tail */}
                      <div className="absolute top-0 -left-2 w-4 h-4 rotate-45 -translate-y-1/2" style={{ background: "linear-gradient(135deg, hsla(var(--hue), 90%, 65%, 0.2), hsla(var(--hue), 95%, 72%, 0.1))", borderLeft: "1px solid hsla(var(--hue), 90%, 65%, 0.2)", borderTop: "1px solid hsla(var(--hue), 90%, 65%, 0.2)", clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                    </div>

                    {/* Plugin highlight */}
                    <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Settings2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                        <span className="text-emerald-400 font-semibold">I use YOUR plugin list:</span> If you have plugins installed (see above), I&apos;ll give YOU specific recommendations---not what some random engineer thought might work.
                      </p>
                    </div>

                    {/* Origin Story */}
                    <div className="relative">
                      <div className="lb-glass rounded-2xl rounded-tl-sm p-4 sm:p-5">
                        <h5 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2" style={{ color: "var(--lb-accent)" }}>
                          <Music className="w-4 h-4" />
                          My Origin Story
                        </h5>
                        <ul className="space-y-2 text-sm sm:text-base text-white/70">
                          <li className="flex items-start gap-2">
                            <span className="mt-1" style={{ color: "var(--lb-accent)" }}>&#8226;</span>
                            <span>Built by record producers who actually make music, not tech companies</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-1" style={{ color: "var(--lb-accent)" }}>&#8226;</span>
                            <span>Designed so every response is practical and immediate</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-1" style={{ color: "var(--lb-accent)" }}>&#8226;</span>
                            <span>Knows about hundreds of different sounds from real sessions</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Advantage for You */}
                    <div className="relative">
                      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl rounded-tl-sm p-4 sm:p-5 border border-amber-500/20">
                        <h5 className="text-sm sm:text-base font-bold text-amber-400 mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          The Advantage for You
                        </h5>
                        <ul className="space-y-2 text-sm sm:text-base text-white/70">
                          <li className="flex items-start gap-2">
                            <span className="text-amber-400 mt-1">&#8226;</span>
                            <span><span className="text-amber-400 font-semibold">Practical:</span> I give specific techniques based on the plugins you have.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-400 mt-1">&#8226;</span>
                            <span><span className="text-amber-400 font-semibold">Contextual:</span> Answers fit your situation instead of one-size-fits-all blurbs.</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* ATLE-driven typing indicator dots */}
                    <div className="flex items-center gap-2 text-white/40 text-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: "var(--lb-primary)", height: `calc(8px + var(--atle-dsp-abs-0) * 12px)`, transition: "height 0.1s linear" }} />
                        <div className="w-2 h-2 rounded-full" style={{ background: "var(--lb-primary)", height: `calc(8px + var(--atle-dsp-abs-1) * 12px)`, transition: "height 0.1s linear" }} />
                        <div className="w-2 h-2 rounded-full" style={{ background: "var(--lb-primary)", height: `calc(8px + var(--atle-dsp-abs-2) * 12px)`, transition: "height 0.1s linear" }} />
                      </div>
                      <span className="italic">Ready to help with your next session...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Example Insights */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          {/* Section glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 50% 50%, hsla(var(--hue), 90%, 65%, 0.08), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />

          <div className="relative max-w-3xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-4 sm:mb-6 px-2">
                Real mix moves, not vague advice.
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-white/70 font-medium px-2">Example feedback from Listen Buddy:</p>
            </div>

            <div className="space-y-3 sm:space-y-4 lg:space-y-5">
              {exampleInsights.map((insight, i) => (
                <div key={i} className="lb-glass rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 glow-sm">
                  <p className="text-sm sm:text-base lg:text-lg text-white/70 italic leading-relaxed">&quot;{insight}&quot;</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8" id="pricing">
          {/* Pricing glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 50% 30%, hsla(var(--hue), 90%, 65%, 0.12), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />

          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
                Choose your{" "}
                <span className="text-gradient-primary">
                  listening level
                </span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-white/70 font-medium px-2 mb-6 sm:mb-8">
                The assistant is always free. Upgrade for more listening time.
              </p>

              {/* Billing Period Toggle */}
              <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-white/5 border border-white/10">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-all ${
                    billingPeriod === "monthly"
                      ? "text-white shadow-lg"
                      : "text-white/60 hover:text-white/80"
                  }`}
                  style={billingPeriod === "monthly" ? { background: "var(--lb-primary)" } : undefined}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-all flex items-center gap-2 ${
                    billingPeriod === "yearly"
                      ? "text-white shadow-lg"
                      : "text-white/60 hover:text-white/80"
                  }`}
                  style={billingPeriod === "yearly" ? { background: "var(--lb-primary)" } : undefined}
                >
                  Yearly
                  <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500 text-white rounded-full">Save</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {plans.map((plan) => {
                const colorMap: Record<string, { accent: string; bg: string }> = {
                  cyan: { accent: "text-cyan-400", bg: "bg-cyan-500" },
                  emerald: { accent: "text-emerald-400", bg: "bg-emerald-500" },
                  violet: { accent: "text-violet-400", bg: "bg-violet-500" },
                  amber: { accent: "text-amber-400", bg: "bg-amber-500" },
                }
                const colors = colorMap[plan.color]
                const displayPrice = billingPeriod === "monthly" ? plan.price : plan.yearlyPrice
                const priceLabel = billingPeriod === "monthly" ? "/mo" : "/yr"

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative lb-glass rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 border-2 cursor-pointer transition-all duration-300 ${
                      selectedPlan === plan.id ? "" : "border-white/10 hover:border-white/20"
                    } ${plan.popular ? "lg:-mt-2 lg:mb-2" : ""}`}
                    style={selectedPlan === plan.id ? { borderColor: "var(--lb-primary)", boxShadow: "0 8px 24px var(--lb-glow)" } : undefined}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 sm:py-1.5 text-white text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap" style={{ background: "var(--lb-primary)" }}>
                        Popular
                      </div>
                    )}
                    <div className="text-center mb-4 sm:mb-5 lg:mb-6">
                      <h3 className={`text-sm sm:text-base lg:text-xl font-semibold uppercase tracking-wider mb-3 sm:mb-4 ${colors.accent}`}>
                        {plan.name}
                      </h3>
                      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                        ${displayPrice.toFixed(2)}
                        <span className="text-sm sm:text-base lg:text-xl text-white/60 font-medium">{priceLabel}</span>
                      </div>
                      {billingPeriod === "yearly" && plan.price > 0 && (
                        <p className="text-xs sm:text-sm text-emerald-400 mt-2">
                          Save ${((plan.price * 12) - plan.yearlyPrice).toFixed(0)}/year
                        </p>
                      )}
                      {plan.pricePerMin !== null && (
                        <p className="text-xs sm:text-sm text-white/50 mt-2">
                          ${plan.pricePerMin.toFixed(3)}/min
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-start gap-1.5 sm:gap-2 mb-5 sm:mb-6 lg:mb-7 px-2 sm:px-3 lg:px-4">
                      {/* Highlighted Minutes */}
                      <div className="flex items-center gap-1.5">
                        <Check className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${colors.accent} shrink-0`} />
                        <span className={`text-[11px] sm:text-xs lg:text-sm ${colors.accent}`}>
                          <span className="font-bold">{plan.minutes}</span> <span className="font-bold">min/mo local</span> · <span className="font-bold">{plan.cloudMinutes}</span> <span className="font-bold">min/mo cloud</span>
                        </span>
                      </div>
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Check className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${colors.accent} shrink-0`} />
                          <span className="text-[11px] sm:text-xs lg:text-sm text-white/60 font-medium whitespace-nowrap">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link href={user ? `/checkout?plan=${plan.id}&billing=${billingPeriod}` : `/login?redirect=${encodeURIComponent(`/checkout?plan=${plan.id}&billing=${billingPeriod}`)}`}>
                      <button
                        className={`w-full rounded-lg sm:rounded-xl py-3.5 sm:py-4 lg:py-6 text-sm sm:text-base font-semibold transition-all ${
                          selectedPlan === plan.id
                            ? `${colors.bg} text-white`
                            : "bg-white/10 text-white/60 hover:bg-white/20"
                        }`}
                      >
                        Choose Plan
                      </button>
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* Top-ups Section */}
            <div className="mt-12 sm:mt-16">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                  Need more minutes?
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-white/60">
                  Top up anytime with extra analysis minutes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-4xl mx-auto">
                {topUps.map((topUp) => {
                  const colorMap: Record<string, { accent: string; bg: string }> = {
                    cyan: { accent: "text-cyan-400", bg: "bg-cyan-500" },
                    violet: { accent: "text-violet-400", bg: "bg-violet-500" },
                    amber: { accent: "text-amber-400", bg: "bg-amber-500" },
                  }
                  const colors = colorMap[topUp.color]

                  return (
                    <div
                      key={topUp.id}
                      className={`relative lb-glass rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-7 border-2 transition-all duration-300 ${
                        topUp.popular ? "" : "border-white/10 hover:border-white/20"
                      }`}
                      style={topUp.popular ? { borderColor: "hsla(var(--hue), 90%, 65%, 0.5)" } : undefined}
                    >
                      {topUp.popular && (
                        <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 text-white text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap" style={{ background: "var(--lb-primary)" }}>
                          Best Value
                        </div>
                      )}
                      <div className="text-center">
                        <h4 className={`text-sm sm:text-base lg:text-lg font-semibold uppercase tracking-wider mb-3 sm:mb-4 ${colors.accent}`}>
                          {topUp.name}
                        </h4>
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                          ${topUp.price.toFixed(2)}
                        </div>
                        <p className="text-base sm:text-lg lg:text-xl text-white/70 font-medium mb-1">
                          {topUp.minutes} minutes
                        </p>
                        <p className="text-sm sm:text-base text-white/50 mb-4 sm:mb-5">
                          ${topUp.pricePerMin.toFixed(3)}/min
                        </p>
                        <Link href={user ? `/checkout?topup=${topUp.id}` : `/login?redirect=${encodeURIComponent(`/checkout?topup=${topUp.id}`)}`}>
                          <button
                            className={`w-full rounded-lg sm:rounded-xl py-3 sm:py-4 text-sm sm:text-base font-semibold transition-all ${colors.bg} text-white hover:opacity-90`}
                          >
                            Buy Now
                          </button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          {/* CTA glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 50% 50%, hsla(var(--hue), 90%, 65%, 0.15), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />

          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
              Stop second-guessing.{" "}
              <span className="text-gradient-primary">
                Start finishing.
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/60 mb-6 sm:mb-8 lg:mb-10 max-w-xl mx-auto px-2">
              Listen Buddy is the &quot;extra set of ears&quot; that fits right into your session---quick, clear, and always on your side.
            </p>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="lb-talk-btn inline-flex items-center gap-2 px-6 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 text-sm sm:text-base lg:text-lg"
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              Start with Listen Buddy
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </section>

        {/* About Footer Note */}
        <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-white/70 text-sm sm:text-base lg:text-lg font-medium">
              Listen Buddy is developed by <span className="text-white/80 font-semibold">Zenphony</span>.
            </p>
            <p className="text-white/60 text-sm sm:text-base lg:text-lg mt-2">
              We build tools for people who care about how music actually sounds.
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
