"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-white/60 mb-6">{error.message}</p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
