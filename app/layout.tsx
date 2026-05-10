import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Zenphony Audio — Intelligence for sound",
  description:
    "A second pair of ears, trained on yours. Listen Buddy is a real-time mix companion for producers, engineers, and composers — plain-English insight with the dB and kHz to back it up.",
  icons: {
    icon: "/zenphony-icon.svg",
    shortcut: "/zenphony-icon.svg",
    apple: "/zenphony-icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Zenphony Audio",
    title: "Zenphony Audio — Intelligence for sound",
    description:
      "A second pair of ears, trained on yours. A real-time mix companion that reads your signal and tells you what's happening in the spectrum.",
    url: "https://zenphonyaudio.com/",
    images: [
      {
        url: "https://zenphonyaudio.com/assets/lb-hero-2026.png",
        width: 1025,
        height: 647,
        alt: "Listen Buddy plugin — analysis view",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zenphony Audio — Intelligence for sound",
    description:
      "A second pair of ears, trained on yours. A real-time mix companion that reads your signal and tells you what's happening in the spectrum.",
    images: ["https://zenphonyaudio.com/assets/lb-hero-2026.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
