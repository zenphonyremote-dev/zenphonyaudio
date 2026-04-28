import { Footer } from "@/components/footer"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

const solutions = [
  {
    title: "For Music Producers",
    description: "Elevate your mixes with AI-powered analysis, mastering tools, and spectral visualization.",
    features: [
      "Real-time mix analysis",
      "AI mastering assistant",
      "Spectral energy monitoring",
      "Reference track comparison",
    ],
    cta: "Explore Producer Tools",
    href: "/products/listen-buddy",
  },
  {
    title: "For Content Creators",
    description: "Generate voiceovers, dub videos, and create unique sound effects without recording.",
    features: ["500+ AI voice models", "Multi-language dubbing", "Custom voice cloning", "Sound effect generation"],
    cta: "Explore Creator Tools",
    href: "/products/voice-gen",
  },
  {
    title: "For Enterprises",
    description: "Scale your audio production with API access, team collaboration, and custom integrations.",
    features: ["RESTful API access", "Team workspaces", "Custom model training", "Priority support"],
    cta: "Contact Sales",
    href: "/contact",
  },
]

const useCases = [
  { title: "Podcasting", icon: "\uD83C\uDF99\uFE0F" },
  { title: "Audiobooks", icon: "\uD83D\uDCDA" },
  { title: "Video Production", icon: "\uD83C\uDFAC" },
  { title: "Music Production", icon: "\uD83C\uDFB5" },
  { title: "Game Development", icon: "\uD83C\uDFAE" },
  { title: "E-Learning", icon: "\uD83D\uDCD6" },
]

export default function SolutionsPage() {
  return (
    <div className="min-h-screen relative overflow-hidden lb-aurora">
      <div className="relative z-10">

        {/* Hero */}
        <section className="relative pt-40 pb-20 px-6 lg:px-8">
          {/* Floating glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 50% 50%, hsla(var(--hue), 90%, 65%, 0.15), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />
          <div className="relative max-w-4xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: "var(--lb-accent)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--lb-accent)" }}>Tailored for your workflow</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
              Solutions for <span className="text-gradient-primary">Every Creator</span>
            </h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: "var(--muted-foreground)" }}>
              Whether you're a solo producer or an enterprise team, we have the tools to transform your audio workflow.
            </p>
          </div>
        </section>

        <div className="lb-glow-rule" />

        {/* Solutions Grid */}
        <section className="relative py-20 px-6 lg:px-8">
          {/* Floating glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 30% 60%, hsla(var(--hue), 90%, 65%, 0.15), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />
          <div className="relative max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {solutions.map((solution, index) => (
                <div
                  key={index}
                  className="group relative"
                >
                  {/* Hover glow */}
                  <div
                    className="absolute -inset-2 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                    style={{
                      background: "radial-gradient(ellipse, var(--lb-glow), transparent)",
                    }}
                  />
                  <div
                    className="relative lb-glass rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">{solution.title}</h3>
                    <p style={{ color: "var(--muted-foreground)" }} className="mb-6">{solution.description}</p>

                    <ul className="space-y-3 mb-8">
                      {solution.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-white/80">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: "hsla(var(--hue), 90%, 65%, 0.2)" }}
                          >
                            <Check className="w-3 h-3" style={{ color: "var(--lb-accent)" }} />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link href={solution.href}>
                      <button className="w-full lb-talk-btn rounded-full font-semibold py-3 text-center cursor-pointer transition-all duration-200">
                        <span className="inline-flex items-center gap-2">
                          {solution.cta}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="lb-pearl-bar" />

        {/* Use Cases */}
        <section className="relative py-20 px-6 lg:px-8">
          {/* Floating glow orb */}
          <div className="absolute -inset-8 pointer-events-none" style={{
            background: "radial-gradient(50% 50% at 70% 40%, hsla(var(--hue), 90%, 65%, 0.15), transparent 70%)",
            transform: "translate(var(--atle-fx), var(--atle-fy))"
          }} />
          <div className="relative max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-black text-white text-center mb-16">
              Use <span className="text-gradient-primary">Cases</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="lb-glass rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105"
                >
                  <span className="text-4xl mb-3 block">{useCase.icon}</span>
                  <span className="text-white/80 font-medium">{useCase.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
