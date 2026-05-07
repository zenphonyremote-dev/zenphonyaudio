import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Zenphony Audio — Intelligence for sound",
  description:
    "Tools that help producers, engineers, and composers hear more clearly, decide faster, and trust the mix in front of them.",
  icons: {
    icon: "/zenphony-icon.svg",
    shortcut: "/zenphony-icon.svg",
    apple: "/zenphony-icon.svg",
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
