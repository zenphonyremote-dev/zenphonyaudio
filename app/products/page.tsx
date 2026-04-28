"use client"

import { Footer } from "@/components/footer"
import { Headphones, Mic, Radio, Music, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

const featuredProduct = {
  id: "listen-buddy",
  name: "Listen Buddy",
  tagline: "AI Audio Plugin",
  description:
    "Engineered by Zenphony DSP Lab. Your track gets analyzed with AI-powered spectral intelligence for professional-grade mix feedback.",
  image: "/listen-buddy-interface-dark-purple-ui.jpg",
}

const products = [
  {
    id: "listen-buddy",
    name: "Listen Buddy",
    category: "Audio Plugin",
    description: "AI-powered mix analysis and audio optimization plugin for professional producers.",
    icon: Headphones,
    image: "/listen-buddy-plugin-interface-purple.jpg",
    price: "$19",
    popular: true,
  },
  {
    id: "voice-gen",
    name: "VoiceGen",
    category: "Voice Synthesis",
    description: "Create lifelike voiceovers using advanced neural voice models in 32+ languages.",
    icon: Mic,
    image: "/voice-synthesis-waveform-purple-neon.jpg",
    price: "$29",
    popular: false,
  },
  {
    id: "dub-master",
    name: "DubMaster",
    category: "Dubbing Studio",
    description: "Translate and dub videos with perfect lip-sync and emotion preservation.",
    icon: Radio,
    image: "/dubbing-studio-interface-dark-purple.jpg",
    price: "$49",
    popular: false,
  },
  {
    id: "sound-forge",
    name: "SoundForge",
    category: "Sound Effects",
    description: "Generate unique sound effects and ambient soundscapes from text descriptions.",
    icon: Music,
    image: "/sound-effects-generator-purple-ui.jpg",
    price: "$39",
    popular: false,
  },
]

export default function ProductsPage() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="min-h-screen relative overflow-hidden lb-aurora">
      <div className="relative z-10">

        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 lg:px-8">
          {/* Floating glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 50% 50%, hsla(var(--hue), 90%, 65%, 0.15), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />
          <div className="relative max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-white/40 text-sm">EST 2024</span>
                  <div className="w-12 h-px bg-white/20" />
                </div>
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight mb-2">ZENPHONY</h1>
                <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black text-gradient-primary tracking-tight mb-6">
                  PRODUCTS
                </h2>
                <p className="max-w-md mb-8 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  Professional audio tools created by highly skilled engineers. Excellence in each of our products.
                </p>
                <div className="flex gap-4">
                  <Link href="#products">
                    <button className="lb-talk-btn rounded-full font-semibold px-8 py-3 cursor-pointer transition-all duration-200">
                      BROWSE ALL
                    </button>
                  </Link>
                  <Link href="/pricing">
                    <button className="lb-chip rounded-full font-semibold px-8 py-3 text-white cursor-pointer transition-all duration-200 hover:bg-white/10">
                      PRICING
                    </button>
                  </Link>
                </div>
              </div>

              {/* Right - Featured Product Card */}
              <div className="relative">
                {/* Bloom glow behind featured card */}
                <div
                  className="absolute -inset-4 rounded-3xl lb-bloom pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse, var(--lb-glow), transparent)",
                    opacity: 0.6,
                  }}
                />
                <div className="relative lb-glass rounded-3xl p-6">
                  <div
                    className="absolute -top-3 right-6 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-white lb-talk-btn"
                  >
                    <Sparkles className="w-3 h-3" />
                    FEATURED
                  </div>
                  <div
                    className="aspect-video rounded-2xl overflow-hidden mb-4"
                    style={{ background: "hsla(var(--hue), 90%, 65%, 0.15)" }}
                  >
                    <Image
                      src={featuredProduct.image || "/placeholder.svg"}
                      alt={featuredProduct.name}
                      width={600}
                      height={340}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--lb-accent)" }}>{featuredProduct.tagline}</p>
                  <h3 className="text-2xl font-bold text-white mb-2">{featuredProduct.name}</h3>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{featuredProduct.description}</p>
                </div>

                {/* Decorative Star Rating */}
                <div className="absolute -bottom-6 -left-6 lb-glass rounded-2xl p-4">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-white text-xs font-medium">500+ 5-STAR REVIEWS</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="lb-glow-rule" />

        {/* Product Carousel */}
        <section className="relative py-20 px-6 lg:px-8" id="products">
          {/* Floating glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 30% 50%, hsla(var(--hue), 90%, 65%, 0.15), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />
          <div className="relative max-w-7xl mx-auto">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                  className="w-12 h-12 rounded-full lb-glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-white font-bold text-lg">AUDIO</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-white">Our Products</h2>

              <div className="flex items-center gap-4">
                <span className="text-white font-bold text-lg">TOOLS</span>
                <button
                  onClick={() => setActiveIndex(Math.min(products.length - 1, activeIndex + 1))}
                  className="w-12 h-12 rounded-full lb-glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => {
                const Icon = product.icon
                const isActive = index === activeIndex
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className={`group relative transition-all duration-500 ${isActive ? "scale-105 z-10" : "scale-100"}`}
                  >
                    <div
                      className={`lb-glass rounded-3xl p-4 transition-all duration-300 ${isActive ? "bg-white/10" : "hover:bg-white/[0.08]"}`}
                      style={isActive ? { boxShadow: "0 0 0 2px hsla(var(--hue), 90%, 65%, 0.5)" } : {}}
                    >
                      {product.popular && (
                        <div
                          className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10 lb-talk-btn"
                        >
                          <Headphones className="w-5 h-5 text-white" />
                        </div>
                      )}

                      <div
                        className="aspect-square rounded-2xl overflow-hidden mb-4"
                        style={{ background: "hsla(var(--hue), 90%, 65%, 0.1)" }}
                      >
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      <div
                        className={`text-center py-2 rounded-xl transition-all ${isActive ? "bg-white text-black" : "bg-white/5 text-white"}`}
                      >
                        <span className="font-bold text-sm">{product.name.toUpperCase()}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* See All Button */}
            <div className="flex justify-center mt-12">
              <button className="lb-chip rounded-full font-semibold px-8 py-3 text-white cursor-pointer transition-all duration-200 hover:bg-white/10 inline-flex items-center gap-2">
                SEE ALL PRODUCTS
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        <div className="lb-pearl-bar" />

        {/* Newest Products - Scattered Layout */}
        <section className="relative py-20 px-6 lg:px-8">
          {/* Floating glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 70% 40%, hsla(var(--hue), 90%, 65%, 0.15), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />
          <div className="relative max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-16">
              OUR NEWEST
              <br />
              <span className="text-gradient-primary">PRODUCTS</span>
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
              {products.slice(0, 3).map((product, index) => {
                const Icon = product.icon
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className={`group relative ${index === 1 ? "lg:translate-y-12" : ""}`}
                  >
                    <div className="lb-glass rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02]">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="p-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-white text-black text-xs font-bold mb-2">
                          {product.category.toUpperCase()}
                        </span>
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{product.price}/mo</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <div className="lb-glow-rule" />

        {/* CTA Section */}
        <section className="relative py-20 px-6 lg:px-8">
          {/* Floating glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 50% 50%, hsla(var(--hue), 90%, 65%, 0.15), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />
          <div className="relative max-w-4xl mx-auto text-center">
            <p className="font-medium mb-4" style={{ color: "var(--lb-accent)" }}>ZENPHONY AUDIO</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              GET YOUR
              <br />
              FAVORITE TOOLS
              <br />
              AND CREATE
              <br />
              <span className="text-gradient-primary">WITH US</span>
            </h2>
            <p className="max-w-lg mx-auto mb-8" style={{ color: "var(--muted-foreground)" }}>
              Professional audio tools created by highly skilled engineers. Excellence in each of our products.
            </p>
            <button className="lb-talk-btn rounded-full font-bold px-10 py-4 text-lg cursor-pointer transition-all duration-200">
              START CREATING
            </button>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
