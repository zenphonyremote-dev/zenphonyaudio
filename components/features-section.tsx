"use client"

import { Play, ArrowUpRight, Mic, Wand2, Languages, Activity, Waves, Headphones } from "lucide-react"
import Image from "next/image"

const voiceCards = [
  {
    title: "Voice Cloning",
    image: "/placeholder.svg?key=e8luc",
    tags: ["AI Powered", "Voice Cloning"],
    description: "Voices fit for all of your ideas.",
    icon: Mic,
  },
  {
    title: "Mix Analysis",
    image: "/placeholder.svg?key=svogq",
    tags: ["Listen Buddy"],
    description: "Engage your listeners with professionally mastered audio.",
    icon: Activity,
  },
  {
    title: "Sound Design",
    image: "/placeholder.svg?key=2x0wz",
    tags: ["SoundForge"],
    description: "Get access to all models and features.",
    icon: Waves,
  },
]

const stats = [
  { value: "42", label: "Voice Models", suffix: "" },
  { value: "204", label: "Countries Served", suffix: "" },
  { value: "24M", label: "Audio Files", suffix: "+" },
  { value: "112", label: "Projects Completed", suffix: "K" },
]

export function FeaturesSection() {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* ATLE floating glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-[120px]" style={{ background: "hsla(var(--hue), 90%, 65%, 0.06)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-[100px]" style={{ background: "hsla(var(--hue-sec), 85%, 55%, 0.05)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <p className="text-sm font-medium mb-4 tracking-wider uppercase" style={{ color: "var(--lb-accent)" }}>Take advantage of the entire</p>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-foreground tracking-tight">
            Audio AI <span className="text-gradient-primary">Platform</span>
          </h2>
        </div>

        {/* Voice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
          {voiceCards.map((card, index) => (
            <div
              key={index}
              className="group lb-glass rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.08]"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={card.image || "/placeholder.svg"}
                  alt={card.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-16 h-16 rounded-full flex items-center justify-center glow-md hover:scale-110 transition-transform" style={{ background: "linear-gradient(135deg, var(--lb-primary), var(--lb-secondary))" }}>
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </button>
                </div>
                {/* Arrow */}
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full lb-glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-5 h-5 text-foreground" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {card.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{ background: "hsla(var(--hue), 90%, 65%, 0.2)", border: "1px solid hsla(var(--hue), 90%, 65%, 0.3)", color: "var(--lb-accent)" }}
                    >
                      <card.icon className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{card.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{card.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="lb-glass rounded-3xl p-8 mb-32">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-2">Some reasons to <span className="text-gradient-primary">Choose Us</span></h3>
            <p className="text-muted-foreground">Trusted by creators worldwide</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-5xl sm:text-6xl font-black text-gradient-primary mb-2">
                  {stat.value}<span className="text-foreground">{stat.suffix}</span>
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Empowering Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
          <div className="relative">
            <div className="lb-glass rounded-3xl overflow-hidden card-tilt">
              <Image
                src="/placeholder.svg?key=4giop"
                alt="Empowering Businesses"
                width={600}
                height={500}
                className="w-full object-cover"
              />
            </div>
            {/* Floating accent cards */}
            <div className="absolute -bottom-6 -right-6 lb-glass rounded-2xl p-4 glow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--lb-primary), var(--lb-secondary))" }}>
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Scale globally without</p>
                  <p className="text-sm font-semibold text-foreground">compromising quality</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-sm font-medium tracking-wider" style={{ color: "var(--lb-accent)" }}>Make a plan right now</p>
            <h3 className="text-4xl sm:text-5xl font-black text-foreground leading-tight">
              Empowering businesses, and people <span className="text-gradient-primary">worldwide.</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Access our advanced models with dedicated support at a price-point that scales with you. Transform your audio workflow today.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground cursor-pointer transition-colors" style={{ ["--tw-text-opacity" as string]: 1 }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lb-accent)")} onMouseLeave={(e) => (e.currentTarget.style.color = "")}>Learn More →</span>
            </div>
          </div>
        </div>

        {/* AI Tools Section */}
        <div className="text-center mb-12">
          <h3 className="text-4xl sm:text-5xl font-black text-foreground">
            Reimagining audio tools<br />with the power of <span className="text-gradient-primary">AI</span>
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              name: "Dubbing Studio",
              desc: "Translate audio and video while preserving the emotion, timing, tone.",
              image: "/placeholder.svg?key=e0wkb",
              icon: Languages
            },
            {
              name: "Audio Native",
              desc: "Create a new medium for engagement with AI narrations by making every touchpoint unique.",
              image: "/placeholder.svg?key=ezeab",
              icon: Headphones
            },
          ].map((tool, i) => (
            <div key={i} className="lb-glass rounded-3xl overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.08]">
              <div className="relative aspect-video">
                <Image src={tool.image || "/placeholder.svg"} alt={tool.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ border: "1px solid hsla(var(--hue), 90%, 65%, 0.3)", color: "var(--lb-accent)" }}>
                    {tool.name}
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground transition-colors" style={{ ["--hover-color" as string]: "var(--lb-accent)" }} />
                </div>
                <p className="text-muted-foreground text-sm">{tool.desc}</p>
                <button className="mt-4 px-6 py-2 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, var(--lb-primary), var(--lb-secondary))" }}>
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
