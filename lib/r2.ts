// ============================================================
// lib/r2.ts — Cloudflare R2 client for support log storage
//
// R2 is S3-compatible, so we use the AWS S3 SDK with R2's endpoint.
// Credentials live in environment variables:
//
//   R2_ACCOUNT_ID            Cloudflare account ID (used to build the endpoint URL)
//   R2_ACCESS_KEY_ID         R2 API token access key
//   R2_SECRET_ACCESS_KEY     R2 API token secret
//   R2_SUPPORT_LOGS_BUCKET   bucket name, e.g. "zenphony-support-logs"
//
// Used by:
//   - /api/support/upload-log   — plugin -> backend, PUT object
//   - /api/admin/support/logs/[id]/download — admin signed GET URL
//
// Only call these helpers from server routes (API + server components).
// Never expose R2 credentials to the client.
// ============================================================

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_SUPPORT_LOGS_BUCKET = process.env.R2_SUPPORT_LOGS_BUCKET || "zenphony-support-logs"

let cachedClient: S3Client | null = null

function getR2Client(): S3Client {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error(
      "R2 credentials missing. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in env.",
    )
  }
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    })
  }
  return cachedClient
}

export function supportLogsBucket(): string {
  return R2_SUPPORT_LOGS_BUCKET
}

/**
 * Upload a gzipped JSONL log buffer to R2 under the support-logs bucket.
 * Returns the object key that was written.
 *
 * Key format: support-logs/{user_id}/{yyyymmdd-HHMMSS}-{short-uuid}.jsonl.gz
 */
export async function uploadSupportLog(
  userId: string,
  body: Buffer | Uint8Array,
  opts?: { contentEncoding?: string; contentType?: string; metadata?: Record<string, string> },
): Promise<string> {
  const now = new Date()
  const stamp =
    now.getUTCFullYear().toString() +
    String(now.getUTCMonth() + 1).padStart(2, "0") +
    String(now.getUTCDate()).padStart(2, "0") +
    "-" +
    String(now.getUTCHours()).padStart(2, "0") +
    String(now.getUTCMinutes()).padStart(2, "0") +
    String(now.getUTCSeconds()).padStart(2, "0")

  const shortId = Math.random().toString(36).slice(2, 10)
  const key = `support-logs/${userId}/${stamp}-${shortId}.jsonl.gz`

  const client = getR2Client()
  await client.send(
    new PutObjectCommand({
      Bucket: supportLogsBucket(),
      Key: key,
      Body: body,
      ContentType: opts?.contentType || "application/x-ndjson",
      ContentEncoding: opts?.contentEncoding || "gzip",
      Metadata: opts?.metadata,
    }),
  )
  return key
}

/**
 * Generate a signed GET URL for an R2 object. TTL defaults to 5 minutes.
 * Used by admin download flow.
 */
export async function signedDownloadUrl(
  key: string,
  ttlSeconds = 5 * 60,
  opts?: { downloadFilename?: string },
): Promise<string> {
  const client = getR2Client()
  // The R2 object is stored gzipped (e.g. `support-logs/.../20260512-...jsonl.gz`)
  // but we want admins to download a plain `.jsonl` file that opens in any
  // editor without a manual `gunzip` step. The HTTP-level fix:
  //
  //   ResponseContentEncoding=gzip  → browser auto-decompresses on receipt
  //   ResponseContentDisposition=attachment; filename="...jsonl"  ← no .gz
  //   ResponseContentType=application/x-ndjson  ← JSON Lines MIME
  //
  // Bonus side-effect: Chrome's Safe Browsing was silently flagging the
  // `.jsonl.gz` extension as "potentially dangerous" and aborting downloads
  // with the misleading "Check internet connection" message. Renaming the
  // download to `.jsonl` makes Chrome happy.
  //
  // Override on the signed URL — no need to re-upload existing R2 objects.
  // The key still points at the .gz blob; the signed URL just instructs the
  // client to treat the bytes as transparently-decoded JSONL.
  // Filename ends in `.json` (not `.jsonl` or `.jsonl.gz`) — Chrome's Safe
  // Browsing was even flagging `.jsonl` as an unfamiliar extension and
  // refusing the download. `.json` is universally trusted. The content is
  // still newline-delimited JSON (one event per line), which every editor
  // and `jq -c` reads cleanly even though the extension isn't strictly
  // "JSON Lines" anymore.
  const sourceName = key.split("/").pop() ?? "log.jsonl.gz"
  const baseName =
    opts?.downloadFilename ??
    sourceName.replace(/\.jsonl?\.gz$/, "").replace(/\.gz$/, "")
  const safeName = (baseName + ".json").replace(/"/g, "")
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: supportLogsBucket(),
      Key: key,
      ResponseContentDisposition: `attachment; filename="${safeName}"`,
      ResponseContentEncoding: "gzip",
      ResponseContentType: "application/json",
    }),
    { expiresIn: ttlSeconds },
  )
}

/**
 * Sanity-check the R2 config without making a request. Throws if missing.
 */
export function assertR2ConfigPresent(): void {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error(
      "R2 credentials missing. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in env.",
    )
  }
}
