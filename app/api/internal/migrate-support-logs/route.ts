import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { readFile } from "node:fs/promises"
import path from "node:path"

// =====================================================================
// /api/internal/migrate-support-logs
//
// ONE-SHOT migration runner for 011_support_logs.sql. Deleted in a
// follow-up commit once it's been run.
//
// Auth: requires Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>.
// Uses DATABASE_DIRECT_URL (Better Auth's connection) — the pooler
// breaks DDL with prepared statements.
//
// Idempotent: 011_support_logs.sql uses IF NOT EXISTS everywhere.
// =====================================================================

export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization") || ""
  const expected = "Bearer " + (process.env.SUPABASE_SERVICE_ROLE_KEY || "")
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const dbUrl = process.env.DATABASE_DIRECT_URL
  if (!dbUrl) {
    return NextResponse.json(
      { error: "DATABASE_DIRECT_URL not set" },
      { status: 500 },
    )
  }

  let sql: string
  try {
    sql = await readFile(
      path.join(process.cwd(), "supabase", "migrations", "011_support_logs.sql"),
      "utf8",
    )
  } catch (e) {
    return NextResponse.json(
      { error: "could_not_read_migration", detail: String(e) },
      { status: 500 },
    )
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await pool.query(sql)
  } catch (e) {
    return NextResponse.json(
      { error: "sql_failed", detail: (e as Error).message },
      { status: 500 },
    )
  } finally {
    await pool.end().catch(() => {})
  }

  // Verify by checking that the table exists.
  const pool2 = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  })
  let tableExists = false
  try {
    const r = await pool2.query(
      "SELECT to_regclass('public.support_logs') IS NOT NULL AS exists",
    )
    tableExists = !!r.rows[0]?.exists
  } catch (e) {
    // non-fatal
  } finally {
    await pool2.end().catch(() => {})
  }

  return NextResponse.json({
    success: true,
    table_exists: tableExists,
    migration: "011_support_logs.sql",
    sql_bytes: sql.length,
  })
}
