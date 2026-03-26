"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"
import { authClient, useSession } from "@/lib/auth-client"
import { createClient } from "@/lib/supabase/client"
import { Profile } from "@/lib/supabase/database.types"

interface AuthContextType {
  user: { id: string; email: string; name: string; image: string | null } | null
  profile: Profile | null
  session: { token: string } | null
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, isPending } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const supabase = createClient()

  const user = sessionData?.user
    ? {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name,
        image: sessionData.user.image ?? null,
      }
    : null

  const session = sessionData?.session
    ? { token: sessionData.session.token }
    : null

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }
    return data as Profile
  }, [supabase])

  // Fetch profile whenever user changes
  useEffect(() => {
    if (user?.id && !profile) {
      setProfileLoading(true)
      fetchProfile(user.id).then((p) => {
        setProfile(p)
        setProfileLoading(false)
      })
    }
    if (!user) {
      setProfile(null)
    }
  }, [user?.id])

  const handleSignUp = async (email: string, password: string, name?: string) => {
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: name || email.split("@")[0],
    })
    if (error) return { error: new Error(error.message ?? "Sign up failed") }
    return { error: null }
  }

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({
      email,
      password,
    })
    if (error) return { error: new Error(error.message ?? "Sign in failed") }
    return { error: null }
  }

  const handleSignInWithGoogle = async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/profile",
    })
    if (error) return { error: new Error(error.message ?? "Google sign in failed") }
    return { error: null }
  }

  const handleSignOut = async () => {
    setProfile(null)
    await authClient.signOut()
  }

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("No user logged in") }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)

    if (!error) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }

    return { error: error ? new Error(error.message) : null }
  }

  const handleRefreshProfile = async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading: isPending || profileLoading,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
        updateProfile: handleUpdateProfile,
        refreshProfile: handleRefreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
