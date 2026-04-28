"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ZenphonyLogo } from "@/components/zenphony-logo"
import { Menu, X, User, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Hide navigation on auth pages
  const hiddenRoutes = ['/login', '/signup', '/signup/success', '/forgot-password', '/reset-password']
  if (hiddenRoutes.includes(pathname)) {
    return null
  }

  const navItems = [
    { name: "Listen Buddy", href: "/products/listen-buddy" },
    { name: "Pricing", href: "/products/listen-buddy#pricing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
      <nav
        className={`fixed top-0 left-0 right-0 transition-all duration-300 ${
          scrolled
            ? "py-2 backdrop-blur-xl border-b shadow-lg shadow-black/30"
            : "py-4 bg-transparent"
        }`}
        style={{
          zIndex: 99999,
          ...(scrolled ? {
            background: "rgba(26, 22, 37, 0.92)",
            borderColor: "rgba(255, 255, 255, 0.06)",
          } : {}),
        }}
      >
        {/* Glow rule under scrolled nav */}
        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 lb-glow-rule" />
        )}

        <div className="w-full px-6 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between">
            {/* Logo - Left with margin */}
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity ml-2 lg:ml-4">
              <ZenphonyLogo className="h-11 sm:h-12 lg:h-14 w-auto" variant="light" />
            </Link>

            {/* Center Navigation - Frosted Pill */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
              <div
                className="flex items-center gap-0.5 lg:gap-1 px-2 lg:px-3 py-1.5 rounded-full transition-all duration-300"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split('#')[0]))
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative flex items-center gap-1.5 px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? "text-[var(--lb-accent)]"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/[0.06]"
                      }`}
                    >
                      {isActive && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: "var(--lb-primary)",
                            boxShadow: "0 0 8px var(--lb-glow)",
                          }}
                        />
                      )}
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right Side - User Avatar or Login */}
            <div className="hidden md:flex items-center gap-3 mr-2 lg:mr-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200"
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{
                        background: "linear-gradient(135deg, var(--lb-primary), var(--lb-secondary))",
                        boxShadow: "0 0 10px var(--lb-glow)",
                      }}
                    >
                      {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl overflow-hidden z-50"
                      style={{
                        background: "rgba(26, 22, 37, 0.95)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
                      }}
                    >
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Profile</span>
                      </Link>
                      <button
                        onClick={async () => {
                          try {
                            await signOut()
                            setUserMenuOpen(false)
                            window.location.href = "/"
                          } catch (error) {
                            console.error('Sign out error:', error)
                            window.location.href = "/"
                          }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="rounded-full font-medium px-5 py-2 text-sm transition-all duration-200 hover:bg-white/10"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <button
                      className="rounded-full text-white font-semibold px-5 py-2 text-sm transition-all duration-200 border-0 cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, var(--lb-primary), var(--lb-primary-dim))",
                        boxShadow: "0 4px 16px var(--lb-glow)",
                      }}
                    >
                      Get Started
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-all duration-200"
              style={{ color: "var(--muted-foreground)" }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 mt-2">
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "rgba(26, 22, 37, 0.95)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
              }}
            >
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split('#')[0]))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors duration-200 ${
                      isActive
                        ? "text-[var(--lb-accent)]"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/[0.05]"
                    }`}
                  >
                    {isActive && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: "var(--lb-primary)",
                          boxShadow: "0 0 8px var(--lb-glow)",
                        }}
                      />
                    )}
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
              <div className="mt-3 pt-3 space-y-2" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] rounded-xl">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{
                          background: "linear-gradient(135deg, var(--lb-primary), var(--lb-secondary))",
                          boxShadow: "0 0 10px var(--lb-glow)",
                        }}
                      >
                        {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {profile?.full_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{user.email}</p>
                      </div>
                    </div>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full rounded-xl hover:bg-white/10 font-medium py-3"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                    </Link>
                    <button
                      onClick={async () => {
                        try {
                          await signOut()
                          setMobileMenuOpen(false)
                          window.location.href = "/"
                        } catch (error) {
                          console.error('Sign out error:', error)
                          window.location.href = "/"
                        }
                      }}
                      className="w-full rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-medium py-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full rounded-xl hover:bg-white/10 font-medium py-3"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <button
                        className="w-full rounded-xl text-white font-semibold py-3 transition-all duration-200 cursor-pointer"
                        style={{
                          background: "linear-gradient(135deg, var(--lb-primary), var(--lb-primary-dim))",
                          boxShadow: "0 4px 16px var(--lb-glow)",
                        }}
                      >
                        Get Started
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
  )
}
