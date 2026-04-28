"use client"

import { Footer } from "@/components/footer"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

const plans = [
  {
    name: "Starter",
    price: "$19",
    description: "Perfect for individuals getting started",
    features: [
      "5 hours of processing/month",
      "Listen Buddy Plugin",
      "Audio Enhancer",
      "Basic support",
      "Export in MP3, WAV",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "$49",
    description: "For professional creators",
    features: [
      "25 hours of processing/month",
      "All Starter features",
      "VoiceGen access",
      "DubMaster access",
      "Priority support",
      "HD exports",
      "API access",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams and businesses",
    features: [
      "Unlimited processing",
      "All Pro features",
      "Custom voice models",
      "Dedicated support",
      "SLA guarantee",
      "White-label options",
      "Custom integrations",
    ],
    popular: false,
  },
]

export default function PricingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen relative overflow-hidden lb-aurora">
      <div className="relative z-10">

        {/* Hero */}
        <section className="pt-40 pb-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div className="lb-soundbars" style={{ height: "12px" }}>
                <span /><span /><span /><span /><span />
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--lb-accent)" }}>Simple, transparent pricing</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
              CHOOSE YOUR
              <br />
              <span className="text-gradient-primary">PLAN</span>
            </h1>
            <p className="text-xl max-w-xl mx-auto" style={{ color: "var(--muted-foreground)" }}>
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-10 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] ${
                    plan.popular ? "" : "lb-glass"
                  }`}
                  style={plan.popular ? {
                    background: "linear-gradient(135deg, var(--lb-primary), var(--lb-primary-dim), var(--lb-secondary))",
                    boxShadow: "0 8px 40px var(--lb-glow)",
                  } : {}}
                >
                  {plan.popular && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                      style={{
                        background: "#fff",
                        color: "var(--lb-primary-dim)",
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      MOST POPULAR
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-white mb-1">{plan.name}</h3>
                    <p className={plan.popular ? "text-white/70" : ""} style={!plan.popular ? { color: "var(--muted-foreground)" } : {}}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-white/70">/mo</span>}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-white">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            background: plan.popular
                              ? "rgba(255, 255, 255, 0.2)"
                              : "hsla(var(--hue), 90%, 65%, 0.2)",
                          }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className={plan.popular ? "" : "text-white/80"}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={
                    plan.price === "Custom"
                      ? "/contact"
                      : user
                        ? `/checkout?plan=${plan.name.toLowerCase()}`
                        : `/login?redirect=${encodeURIComponent(`/checkout?plan=${plan.name.toLowerCase()}`)}`
                  }>
                    <button
                      className={`w-full rounded-full font-bold py-4 text-center cursor-pointer transition-all duration-200 ${
                        plan.popular
                          ? "bg-white hover:bg-white/90"
                          : "lb-talk-btn"
                      }`}
                      style={plan.popular ? { color: "var(--lb-primary-dim)" } : {}}
                    >
                      <span className="inline-flex items-center gap-2">
                        {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Guarantees */}
            <div className="mt-16 text-center">
              <p className="mb-4" style={{ color: "var(--muted-foreground)" }}>All plans include:</p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="lb-chip px-4 py-2">30-day money-back guarantee</span>
                <span className="lb-chip px-4 py-2">Cancel anytime</span>
                <span className="lb-chip px-4 py-2">No credit card for trial</span>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
