"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
        <p className="text-white/60 mb-6">{error.message}</p>
        <button
          onClick={() => reset()}
          className="lb-talk-btn px-6 py-3"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
