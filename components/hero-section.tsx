"use client"

import { useState, useEffect } from "react"
import { Play } from "lucide-react"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center px-6 mt-32">

      {/* Large ATLE-driven glow orb behind hero */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "15%",
          left: "50%",
          width: "80vw",
          height: "60vh",
          transform: "translate(calc(-50% + var(--atle-fx)), calc(-30% + var(--atle-fy)))",
          background: "radial-gradient(ellipse at center, hsla(var(--hue), 90%, 65%, 0.12) 0%, hsla(var(--hue-sec), 85%, 55%, 0.06) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Secondary orb — bottom right */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "10%",
          right: "5%",
          width: "40vw",
          height: "40vh",
          transform: "translate(calc(var(--atle-fx) * -1.5), calc(var(--atle-fy) * -1.5))",
          background: "radial-gradient(circle, hsla(var(--hue-sec), 85%, 55%, 0.10), transparent 60%)",
          filter: "blur(50px)",
        }}
      />

      {/* Main Content */}
      <div className={`relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Badge */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full mb-4 lb-glass"
        >
          {/* Sound bars in badge */}
          <div className="lb-soundbars" style={{ height: "12px" }}>
            <span /><span /><span /><span /><span />
          </div>
          <span className="text-sm font-medium" style={{ color: "var(--lb-accent)" }}>Audio Intelligence</span>
        </div>

        {/* Main Headline */}
        <div className="relative pt-6 sm:pt-8 lg:pt-10 w-full flex flex-col items-center justify-center">
          {/* Glow behind headline text */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(50% 50% at 50% 50%, hsla(var(--hue), 90%, 65%, 0.08), transparent 70%)",
              transform: "scale(var(--atle-scale))",
            }}
          />
          <h1 className="relative text-white leading-[1.1] mb-8 sm:mb-10 lg:mb-12 text-center w-full flex flex-col items-center">
            <span className="inline-block text-center text-gradient-primary font-[family-name:var(--font-milker)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl pb-4 sm:pb-6 pr-2 animate-gradient bg-[length:200%_200%] hero-3d-text text-shadow-glow">
              Intelligence
            </span>
            <span className="inline-block text-center text-gradient-primary font-[family-name:var(--font-milker)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl pr-2 animate-gradient bg-[length:200%_200%] hero-3d-text">
              for Sound
            </span>
          </h1>
        </div>

        {/* Subheadline */}
        <p className="text-base sm:text-lg lg:text-xl max-w-2xl mb-8 sm:mb-10 leading-relaxed px-6 text-center w-full" style={{ color: "var(--muted-foreground)" }}>
          Zenphony Audio builds intelligent tools that help humans hear more clearly, decide faster, and trust their sound.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 px-6 w-full">
          <a
            href="/products/listen-buddy"
            className="lb-talk-btn inline-flex items-center justify-center gap-2 text-sm sm:text-base no-underline"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
            Explore Listen Buddy
          </a>
          <a
            href="/about"
            className="lb-chip inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold no-underline"
          >
            Who We Are
          </a>
        </div>
      </div>

      {/* ATLE 2.5 Conic Ring + Mascot */}
      <div className={`relative z-10 mt-16 lg:mt-20 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative flex items-center justify-center">

          {/* Aurora glow behind */}
          <div
            className="absolute -inset-24 pointer-events-none"
            style={{
              background: `
                radial-gradient(45% 50% at 50% 50%, hsla(var(--hue), 90%, 65%, 0.30), transparent 70%),
                radial-gradient(35% 40% at 30% 60%, hsla(var(--hue-sec), 85%, 55%, 0.20), transparent 70%)
              `,
              filter: "blur(50px)",
              transform: "scale(var(--atle-scale))",
            }}
          />

          {/* Conic Ring — ATLE spin-driven */}
          <div
            className="relative z-10 animate-float"
            style={{ width: "160px", height: "160px" }}
          >
            <div
              className="w-full h-full rounded-full p-1"
              style={{
                background: `conic-gradient(from 0deg,
                  var(--lb-primary), var(--lb-secondary), var(--lb-primary))`,
                transform: "rotate(var(--atle-spin))",
                willChange: "transform",
              }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{ background: "rgba(13, 10, 20, 0.95)" }}
              >
                {/* Listen Buddy Mascot SVG */}
                <svg viewBox="0 0 64 64" fill="none" style={{ width: "80px", height: "80px" }}>
                  <path d="M10 30 Q10 12 32 12 Q54 12 54 30" stroke="var(--lb-primary-dim)" strokeWidth="5" strokeLinecap="round" fill="none"/>
                  <rect x="4" y="25" width="13" height="20" rx="4" fill="var(--lb-primary-dim)"/>
                  <rect x="6" y="28" width="9" height="14" rx="3" fill="var(--lb-secondary)"/>
                  <rect x="47" y="25" width="13" height="20" rx="4" fill="var(--lb-primary-dim)"/>
                  <rect x="49" y="28" width="9" height="14" rx="3" fill="var(--lb-secondary)"/>
                  <circle cx="32" cy="34" r="18" fill="#e4e6ec" stroke="rgba(180,160,220,0.3)" strokeWidth="0.5"/>
                  <rect x="18" y="22" width="28" height="22" rx="6" fill="#0a1018"/>
                  <path d="M24 36 L27 30 L30 36" stroke="var(--lb-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M34 36 L37 30 L40 36" stroke="var(--lb-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M26 40 Q32 46 38 40" stroke="var(--lb-primary)" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
            </div>

            {/* Glow shadow beneath */}
            <div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-4 rounded-full animate-orb-shadow"
              style={{
                background: `radial-gradient(ellipse, var(--lb-glow), transparent)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Pearl bar accent */}
      <div className={`mt-12 w-48 sm:w-64 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="lb-pearl-bar" style={{ height: "4px" }} />
      </div>

      {/* Scroll indicator */}
      <div className={`mt-8 sm:mt-12 flex flex-col items-center gap-2 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-6 h-10 rounded-full flex justify-center pt-2" style={{ border: "2px solid rgba(255, 255, 255, 0.12)" }}>
          <div className="w-1 h-2 rounded-full animate-scroll-wheel" style={{ background: "var(--muted-foreground)" }} />
        </div>
        <span className="text-xs uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Scroll</span>
      </div>
    </section>
  )
}
