"use client"

import Link from "next/link"
import { ZenphonyLogo } from "./zenphony-logo"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Listen Buddy", href: "/products/listen-buddy" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

export function Footer() {
  return (
    <footer className="py-12" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <ZenphonyLogo className="h-8 w-auto" variant="light" />
          </Link>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm transition-colors hover:text-[var(--foreground)]"
                style={{ color: "var(--muted-foreground)" }}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Glow rule divider */}
        <div className="mt-8 lb-glow-rule" />

        {/* Bottom */}
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            © {new Date().getFullYear()} Zenphony Audio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
