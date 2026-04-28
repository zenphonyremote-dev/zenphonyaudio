"use client"

import { ArrowUpRight, Sparkles, Mic, Radio, Music, Headphones } from "lucide-react"
import Link from "next/link"
import { TiltCard } from "./tilt-card"

const products = [
  {
    id: "listen-buddy",
    name: "Listen Buddy",
    tagline: "Audio Plugin",
    description: "AI-powered mix analysis and audio optimization plugin for professional producers.",
    icon: Headphones,
    price: "$19",
    popular: true,
  },
  {
    id: "voice-gen",
    name: "VoiceGen",
    tagline: "Voice Synthesis",
    description: "Create lifelike voiceovers using advanced neural voice models in 32+ languages.",
    icon: Mic,
    price: "$29",
    popular: false,
  },
  {
    id: "dub-master",
    name: "DubMaster",
    tagline: "Dubbing Studio",
    description: "Translate and dub videos with perfect lip-sync and emotion preservation.",
    icon: Radio,
    price: "$49",
    popular: false,
  },
  {
    id: "sound-forge",
    name: "SoundForge",
    tagline: "Sound Effects",
    description: "Generate unique sound effects and ambient soundscapes from text descriptions.",
    icon: Music,
    price: "$39",
    popular: false,
  },
]

export function ProductsSection() {
  return (
    <section className="relative py-24 px-6 lg:px-8">
      {/* ATLE floating glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ background: "hsla(var(--hue), 90%, 65%, 0.05)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px]" style={{ background: "hsla(var(--hue-sec), 85%, 55%, 0.05)" }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium mb-4 uppercase tracking-wider" style={{ color: "var(--lb-accent)" }}>Top category we have</p>
          <h2 className="text-5xl sm:text-6xl font-black text-foreground tracking-tight">
            Explore <span className="text-gradient-primary">Products</span>
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group">
              <TiltCard tiltMax={12} scale={1.03} className="h-full">
                <div className="relative lb-glass rounded-3xl p-6 h-full card-3d overflow-hidden">
                  {/* Background accent glow */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "hsla(var(--hue), 90%, 65%, 0.1)" }} />

                  {product.popular && (
                    <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 shadow-lg" style={{ background: "linear-gradient(135deg, var(--lb-primary), var(--lb-secondary))", boxShadow: "0 10px 25px var(--lb-glow)" }}>
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </div>
                  )}

                  {/* Icon with floating effect */}
                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 glow-md group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 icon-float"
                      style={{ background: "linear-gradient(135deg, var(--lb-primary), var(--lb-secondary))", transformStyle: "preserve-3d", transform: "translateZ(30px)" }}
                    >
                      <product.icon className="w-8 h-8 text-white" />
                    </div>
                    {/* Icon shadow */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/20 blur-md rounded-[100%] group-hover:w-14 group-hover:blur-lg transition-all duration-300" />
                  </div>

                  {/* Content */}
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{product.tagline}</p>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-gradient-primary transition-all">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.description}</p>

                  {/* Price + Arrow */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <span className="text-2xl font-black text-foreground">
                      {product.price}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </span>
                    <div className="w-10 h-10 rounded-full lb-glass flex items-center justify-center hover:bg-white/10 group-hover:scale-110 transition-all duration-300">
                      <ArrowUpRight className="w-5 h-5 transition-all" style={{ color: "var(--lb-accent)" }} />
                    </div>
                  </div>
                </div>
              </TiltCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
