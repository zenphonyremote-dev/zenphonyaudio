import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    console.log('[Auth Callback] Received request:', { 
      hasCode: !!code, 
      hasError: !!error, 
      errorDescription,
      next 
    })

    // Handle OAuth errors
    if (error) {
      console.error('[Auth Callback] OAuth error:', { error, errorDescription })
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent(errorDescription || error)}`
      )
    }

    if (code) {
      const supabase = await createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('[Auth Callback] Exchange code error:', exchangeError)
        return NextResponse.redirect(
          `${origin}/auth/auth-code-error?error=${encodeURIComponent(exchangeError.message || 'Failed to exchange code')}`
        )
      }
      
      console.log('[Auth Callback] Successfully exchanged code for session')
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('[Auth Callback] No code or error provided')
    // Return user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent('No authentication code provided')}`)
  } catch (err) {
    console.error('[Auth Callback] Unexpected error:', err)
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent('An unexpected error occurred')}`
    )
  }
}
