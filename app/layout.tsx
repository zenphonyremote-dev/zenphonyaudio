import type React from "react"
import type { Metadata } from "next"
import { Outfit, Inter, JetBrains_Mono, Orbitron, Montserrat } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import { PageTransition } from "@/components/page-transition"
import { AuthProvider } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { AtleProvider } from "@/components/atle-provider"
import "./globals.css"

const sakana = localFont({
  src: [
    {
      path: "../public/fonts/Sakana.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-sakana",
  display: "swap",
})

const grandover = localFont({
  src: [
    {
      path: "../public/fonts/Grandover.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-grandover",
  display: "swap",
})

const alphacorsa = localFont({
  src: [
    {
      path: "../public/fonts/Alphacorsa-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-alphacorsa",
  display: "swap",
})

const milker = localFont({
  src: [
    {
      path: "../public/fonts/Milker.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-milker",
  display: "swap",
})

/* ATLE 2.5 primary fonts */
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "700"],
})

/* Legacy fonts kept for existing product pages */
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Zenphony Audio - AI-Powered Audio Platform",
  description:
    "Transform audio with AI. Create lifelike voices, enhance audio quality, and produce professional sound with Zenphony's AI-powered audio tools.",
  generator: "v0.app",
  icons: {
    icon: "/zenphony-icon.svg",
    shortcut: "/zenphony-icon.svg",
    apple: "/zenphony-icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} ${orbitron.variable} ${sakana.variable} ${grandover.variable} ${alphacorsa.variable} ${milker.variable} ${montserrat.variable} font-sans antialiased theme-radial`}>
        {/* ATLE liquid SVG filter — apply via filter:url(#atle-liquid) on hover */}
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <filter id="atle-liquid" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.015 0.025" numOctaves={2} seed={7} />
              <feDisplacementMap in="SourceGraphic" scale={6} />
            </filter>
          </defs>
        </svg>
        <AuthProvider>
          <AtleProvider>
            <Navigation />
            <PageTransition>{children}</PageTransition>
          </AtleProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
