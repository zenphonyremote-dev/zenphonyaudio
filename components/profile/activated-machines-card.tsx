"use client"

// Activated Machines audit panel.
//
// Mounting target: the user-facing /profile page (app/profile/page.tsx),
// rendered AFTER <SubscriptionDetailsCard /> so the user can see their plan +
// machine limit, then audit/revoke active activations.
//
// At time of writing app/profile/page.tsx does not yet exist; this component
// is built ahead of the page for drop-in mounting once the page lands.
//
// Hits POST/GET /api/plugin/machines/{list,revoke}, which wrap the
// SECURITY DEFINER RPCs from migration 010_activated_machines.sql.

import { useCallback, useEffect, useState } from "react"
import { Loader2, Laptop, AlertCircle, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ActivatedMachine {
  id: string
  machine_id_hash: string
  hostname: string | null
  app_version: string | null
  source: "plugin" | "hub"
  registered_at: string
  last_seen_at: string
}

interface ListResponse {
  success: boolean
  machines?: ActivatedMachine[]
  machine_limit?: number
  error?: string
}

interface ActivatedMachinesCardProps {
  apiKey: string
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return "—"
  const deltaSec = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (deltaSec < 60) return "just now"
  if (deltaSec < 3600) {
    const m = Math.floor(deltaSec / 60)
    return `${m} minute${m === 1 ? "" : "s"} ago`
  }
  if (deltaSec < 86400) {
    const h = Math.floor(deltaSec / 3600)
    return `${h} hour${h === 1 ? "" : "s"} ago`
  }
  if (deltaSec < 86400 * 30) {
    const d = Math.floor(deltaSec / 86400)
    return `${d} day${d === 1 ? "" : "s"} ago`
  }
  const months = Math.floor(deltaSec / (86400 * 30))
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`
  const years = Math.floor(months / 12)
  return `${years} year${years === 1 ? "" : "s"} ago`
}

function shortHash(hash: string): string {
  if (!hash) return ""
  return hash.length > 12 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash
}

export function ActivatedMachinesCard({ apiKey }: ActivatedMachinesCardProps) {
  const [machines, setMachines] = useState<ActivatedMachine[]>([])
  const [machineLimit, setMachineLimit] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [revokingHash, setRevokingHash] = useState<string | null>(null)

  const fetchMachines = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!apiKey) {
        setError("Missing API key")
        setLoading(false)
        return
      }
      if (mode === "initial") setLoading(true)
      else setRefreshing(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/plugin/machines/list?api_key=${encodeURIComponent(apiKey)}`,
          { cache: "no-store" }
        )
        const data = (await res.json()) as ListResponse
        if (!res.ok || !data.success) {
          setError(data.error || `Failed to load machines (${res.status})`)
          return
        }
        setMachines(data.machines ?? [])
        setMachineLimit(data.machine_limit ?? 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [apiKey]
  )

  useEffect(() => {
    fetchMachines("initial")
  }, [fetchMachines])

  const handleRevoke = async (hash: string) => {
    setRevokingHash(hash)
    setError(null)
    try {
      const res = await fetch("/api/plugin/machines/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, machine_id_hash: hash }),
      })
      const data = (await res.json()) as { success: boolean; error?: string }
      if (!res.ok || !data.success) {
        setError(data.error || `Failed to revoke (${res.status})`)
        return
      }
      // Optimistic update + refresh from server to be safe
      setMachines((prev) => prev.filter((m) => m.machine_id_hash !== hash))
      await fetchMachines("refresh")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error")
    } finally {
      setRevokingHash(null)
    }
  }

  const activeCount = machines.length
  const headerCount = machineLimit > 0
    ? `${activeCount} of ${machineLimit} machines activated`
    : `${activeCount} machines activated`

  return (
    <div className="relative">
      <div className="absolute -inset-2 bg-cyan-500/10 rounded-3xl blur-xl" />
      <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Laptop className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Activated Machines</h3>
              <p className="text-xs text-white/40 mt-0.5">{headerCount}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchMachines("refresh")}
            disabled={loading || refreshing}
            className="text-white/60 hover:text-white hover:bg-white/[0.06]"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 py-2 px-3 mb-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-white/30" />
          </div>
        ) : machines.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Laptop className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-white/50 text-sm">No machines activated yet</p>
            <p className="text-white/30 text-xs mt-1">
              Activate Listen Buddy from the Software Hub or DAW plugin to see
              it here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {machines.map((m) => {
              const isHub = m.source === "hub"
              const sourceClasses = isHub
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/20"
                : "bg-violet-500/15 text-violet-300 border-violet-500/20"
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white text-sm font-medium truncate">
                        {m.hostname || "Unknown machine"}
                      </span>
                      <Badge
                        variant="outline"
                        className={`uppercase text-[10px] tracking-wide ${sourceClasses}`}
                      >
                        {isHub ? "Hub" : "Plugin"}
                      </Badge>
                      {m.app_version && (
                        <span className="text-white/40 text-xs font-mono">
                          v{m.app_version}
                        </span>
                      )}
                    </div>
                    <div className="text-white/40 text-xs mt-1 flex items-center gap-2 flex-wrap">
                      <span>Last seen {formatRelative(m.last_seen_at)}</span>
                      <span className="text-white/20">·</span>
                      <span className="font-mono text-white/30">
                        {shortHash(m.machine_id_hash)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevoke(m.machine_id_hash)}
                    disabled={revokingHash === m.machine_id_hash}
                    className="text-white/50 hover:text-red-400 hover:bg-red-500/10"
                  >
                    {revokingHash === m.machine_id_hash ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="ml-1.5 text-xs">Revoke</span>
                      </>
                    )}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}

        {/* Footer hint */}
        {!loading && machineLimit > 0 && activeCount >= machineLimit && (
          <div className="mt-4 text-center text-xs text-amber-300/80">
            You&apos;ve hit your plan&apos;s machine limit. Revoke a machine
            above to activate a new one.
          </div>
        )}
      </div>
    </div>
  )
}
