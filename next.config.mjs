/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'brqumrnkcevzieqfvhsm.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async rewrites() {
    return [
      // Marketing home — / serves /public/index.html
      { source: '/', destination: '/index.html' },
      // Clean URL for the customer dashboard
      { source: '/account', destination: '/account.html' },
      // Legacy paths the plugin and inbound links still hit
      { source: '/login', destination: '/account.html' },
      { source: '/signup', destination: '/account.html' },
      { source: '/profile', destination: '/account.html' },
      { source: '/forgot-password', destination: '/account.html' },
      { source: '/reset-password', destination: '/account.html' },
      // /ZenMode is served by app/ZenMode/route.ts (server-side gated)
    ]
  },
  async headers() {
    const security = [
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
    ]
    return [
      { source: '/(.*)', headers: security },
      // No-cache + tighter referrer on the admin surface
      {
        source: '/ZenMode',
        headers: [
          ...security,
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
      {
        source: '/api/admin/:path*',
        headers: [
          ...security,
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ]
  },
}

export default nextConfig
