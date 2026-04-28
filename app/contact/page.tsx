"use client"

import { Footer } from "@/components/footer"
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen relative overflow-hidden lb-aurora">
      <div className="relative z-10">

        <main className="pt-32 pb-20 px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <MessageCircle className="w-4 h-4" style={{ color: "var(--lb-accent)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--lb-accent)" }}>Get in Touch</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                Contact{" "}
                <span className="text-gradient-primary">Us</span>
              </h1>

              <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--muted-foreground)" }}>
                Have questions about our audio tools? We'd love to hear from you.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="order-2 lg:order-1">
                <div
                  className="rounded-3xl p-8 lb-glass"
                >
                  <h2 className="text-xl font-bold text-white mb-6">Send us a message</h2>
                  <form className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>First Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none transition-all"
                          style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                          }}
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>Last Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none transition-all"
                          style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                          }}
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none transition-all"
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                        }}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>Subject</label>
                      <select
                        className="w-full px-4 py-3 rounded-xl text-white focus:outline-none transition-all"
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                        }}
                      >
                        <option value="" style={{ background: "#1a1625" }}>Select a topic</option>
                        <option value="sales" style={{ background: "#1a1625" }}>Sales Inquiry</option>
                        <option value="support" style={{ background: "#1a1625" }}>Technical Support</option>
                        <option value="partnership" style={{ background: "#1a1625" }}>Partnership</option>
                        <option value="other" style={{ background: "#1a1625" }}>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>Message</label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none transition-all resize-none"
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                        }}
                        placeholder="Tell us how we can help..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="lb-talk-btn w-full inline-flex items-center justify-center gap-2 py-4"
                    >
                      Send Message
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 order-1 lg:order-2">
                {/* Email */}
                <div
                  className="rounded-2xl p-6 lb-glass transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "hsla(var(--hue), 90%, 65%, 0.15)" }}
                    >
                      <Mail className="w-5 h-5" style={{ color: "var(--lb-accent)" }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Email Us</h3>
                      <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>We'll respond within 24 hours</p>
                      <a href="mailto:hello@zenphony.audio" className="transition-colors" style={{ color: "var(--lb-accent)" }}>
                        hello@zenphony.audio
                      </a>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div
                  className="rounded-2xl p-6 lb-glass transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "hsla(var(--hue-sec), 85%, 55%, 0.15)" }}
                    >
                      <Phone className="w-5 h-5" style={{ color: "var(--lb-secondary)" }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Call Us</h3>
                      <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>Mon-Fri from 9am to 6pm PST</p>
                      <a href="tel:+15551234567" className="transition-colors" style={{ color: "var(--lb-secondary)" }}>
                        +1 (555) 123-4567
                      </a>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div
                  className="rounded-2xl p-6 lb-glass transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "hsla(var(--hue), 95%, 72%, 0.15)" }}
                    >
                      <MapPin className="w-5 h-5" style={{ color: "var(--lb-accent)" }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Visit Us</h3>
                      <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>Our headquarters</p>
                      <p style={{ color: "var(--lb-accent)" }}>
                        123 Audio Lane<br />
                        San Francisco, CA 94103
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
