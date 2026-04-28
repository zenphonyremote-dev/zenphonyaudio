"use client"

import { Footer } from "@/components/footer"
import { ArrowLeft, Sparkles, Music, Mic, Radio, Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const timeline = [
  {
    year: "2024",
    title: "The Vision",
    description:
      "In a small studio apartment, our founders discovered their shared passion for democratizing audio creation. They believed everyone deserves access to professional-grade audio tools.",
    icon: Sparkles,
  },
  {
    year: "2025",
    title: "First Product",
    description:
      "Listen Buddy was born - our revolutionary audio plugin that would change how creators experience sound. Within months, thousands of musicians and podcasters adopted it.",
    icon: Music,
  },
  {
    year: "2025",
    title: "AI Integration",
    description:
      "We launched VoiceGen, our AI voice synthesis platform, making lifelike voiceovers accessible to everyone. The response was overwhelming.",
    icon: Mic,
  },
  {
    year: "2026",
    title: "Global Expansion",
    description:
      "With DubMaster and SoundForge joining our suite, Zenphony Audio became a complete ecosystem. Today, we serve creators in over 100 countries.",
    icon: Radio,
  },
]

const values = [
  {
    title: "Innovation First",
    description: "We push the boundaries of what's possible in audio technology, constantly exploring new frontiers.",
  },
  {
    title: "Creator Focused",
    description: "Every feature we build starts with one question: How does this help creators make better content?",
  },
  {
    title: "Quality Obsessed",
    description: "We never compromise on audio quality. Crystal clear sound is our non-negotiable standard.",
  },
  {
    title: "Community Driven",
    description: "Our users shape our roadmap. We listen, iterate, and deliver what creators actually need.",
  },
]

export default function BackstoryPage() {
  return (
    <main className="min-h-screen bg-background lb-aurora">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Floating glow orb */}
        <div className="absolute -inset-8 pointer-events-none" style={{
          background: "radial-gradient(50% 50% at 30% 40%, hsla(var(--hue), 90%, 65%, 0.15), transparent 70%)",
          transform: "translate(var(--atle-fx), var(--atle-fy))"
        }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-[color:var(--lb-accent)] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-6">
            OUR <span className="text-gradient-primary">STORY</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            From a passion project to a global audio platform. This is the journey of how we&apos;re transforming the
            way creators work with sound.
          </p>
        </div>
      </section>

      {/* The Beginning */}
      <section className="py-20 lb-glass">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--lb-primary), var(--lb-primary-dim))" }}>
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--lb-accent)" }}>The Beginning</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-8">It started with a simple question</h2>

          <div className="space-y-6">
            <p className="text-xl leading-relaxed" style={{ color: "var(--lb-accent)" }}>
              &ldquo;Why is professional audio creation so inaccessible?&rdquo;
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our founders, both audio engineers and software developers, noticed a gap in the market. Professional
              audio tools were either too expensive, too complex, or both. Small creators, independent musicians, and
              content makers were left behind.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Zenphony Audio was born from the belief that exceptional audio should be accessible to everyone. We set
              out to build tools that combine professional-grade quality with intuitive design, powered by cutting-edge
              AI technology.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative py-20 overflow-hidden">
        {/* Floating glow orb */}
        <div className="absolute -inset-8 pointer-events-none" style={{
          background: "radial-gradient(50% 50% at 60% 50%, hsla(var(--hue-sec), 85%, 55%, 0.12), transparent 70%)",
          transform: "translate(calc(var(--atle-fx) * -1), var(--atle-fy))"
        }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-16 text-center">
            Our <span className="text-gradient-primary">Journey</span>
          </h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px hidden sm:block" style={{ background: "linear-gradient(to bottom, var(--lb-primary), var(--lb-secondary), var(--lb-accent))" }} />

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className="relative flex gap-8">
                  {/* Icon */}
                  <div className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 glow-md" style={{ background: "linear-gradient(135deg, var(--lb-primary), var(--lb-primary-dim))" }}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="relative flex-1 pb-8 lb-glass rounded-2xl p-6">
                    {/* Floating glow orb behind timeline item */}
                    <div className="absolute -inset-4 pointer-events-none -z-10 rounded-2xl" style={{
                      background: "radial-gradient(circle at 50% 50%, hsla(var(--hue), 90%, 65%, 0.06), transparent 70%)",
                      transform: `translate(calc(var(--atle-fx) * ${0.3 + index * 0.1}), calc(var(--atle-fy) * ${0.3 + index * 0.1}))`
                    }} />
                    <span className="text-sm font-bold" style={{ color: "var(--lb-accent)" }}>{item.year}</span>
                    <h3 className="text-2xl font-black text-foreground mt-1 mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lb-glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-16 text-center">
            What We <span className="text-gradient-primary">Believe</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div key={index} className="lb-glass rounded-3xl p-8 hover:scale-[1.02] transition-transform">
                <h3 className="text-xl font-black text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden">
        {/* Floating glow orb */}
        <div className="absolute -inset-8 pointer-events-none" style={{
          background: "radial-gradient(50% 50% at 50% 50%, hsla(var(--hue), 90%, 65%, 0.12), transparent 70%)",
          transform: "translate(var(--atle-fx), calc(var(--atle-fy) * -1))"
        }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-6">
            Join Our <span className="text-gradient-primary">Story</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of the audio revolution. Start creating with Zenphony Audio today.
          </p>
          <Link href="/signup">
            <Button className="rounded-full text-white font-bold px-10 py-6 text-lg lb-talk-btn">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
