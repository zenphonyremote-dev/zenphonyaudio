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
      // Clean URLs for the new static pages
      { source: '/account', destination: '/account.html' },
      { source: '/ZenMode', destination: '/zenmode.html' },
      // Legacy paths the plugin and inbound links still hit
      { source: '/login', destination: '/account.html' },
      { source: '/signup', destination: '/account.html' },
      { source: '/profile', destination: '/account.html' },
      { source: '/forgot-password', destination: '/account.html' },
      { source: '/reset-password', destination: '/account.html' },
    ]
  },
}

export default nextConfig
