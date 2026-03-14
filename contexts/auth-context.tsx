"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { Profile } from '@/lib/supabase/database.types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  /** Incremented on every profile refresh — use as useEffect dependency to re-fetch related data */
  profileVersion: number
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileVersion, setProfileVersion] = useState(0)
  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data as Profile
  }, [supabase])

  // Fetch profile whenever the user changes.
  // Decoupled from onAuthStateChange to avoid a deadlock:
  // _notifyAllSubscribers awaits all callbacks, and if the callback calls
  // supabase.from().select() (which internally calls getSession() →
  // await initializePromise), it deadlocks when triggered during initialization.
  useEffect(() => {
    if (user) {
      fetchProfile(user.id).then((profileData) => {
        setProfile(profileData)
        setProfileVersion((v) => v + 1)
      })
    } else {
      setProfile(null)
    }
  }, [user?.id])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((err) => {
      console.error('[AuthContext] Error getting session:', err)
      setLoading(false)
    })

    // Listen for auth changes — intentionally NOT async to avoid deadlock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (!session?.user) {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name?: string) => {
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: name },
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      })
      return { error }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const signOut = async () => {
    // Clear local auth state immediately
    setUser(null)
    setSession(null)
    setProfile(null)

    try {
      const timeout = new Promise<void>((resolve) => setTimeout(resolve, 2000))
      await Promise.race([
        supabase.auth.signOut({ scope: 'local' }).then(() => {}),
        timeout,
      ])
    } catch (err) {
      console.error('[AuthContext] signOut exception:', err)
    }

    // Clear Supabase cookies
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim()
      if (name.startsWith('sb-')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      }
    })
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
      setProfileVersion((v) => v + 1)
    }

    return { error }
  }

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
      setProfileVersion((v) => v + 1)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        profileVersion,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
