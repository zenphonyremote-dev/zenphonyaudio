import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden lb-aurora">
      {/* Floating ambient glow orbs — ATLE driven */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "60%",
          left: "-5%",
          width: "50vw",
          height: "50vh",
          background: "radial-gradient(circle, hsla(var(--hue), 85%, 60%, 0.07), transparent 60%)",
          filter: "blur(80px)",
          transform: "translate(var(--atle-fx), var(--atle-fy))",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: "120%",
          right: "-10%",
          width: "45vw",
          height: "45vh",
          background: "radial-gradient(circle, hsla(var(--hue-sec), 80%, 50%, 0.06), transparent 60%)",
          filter: "blur(70px)",
          transform: "translate(calc(var(--atle-fx) * -1), calc(var(--atle-fy) * -1))",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <HeroSection />
        <ServicesSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  )
}
