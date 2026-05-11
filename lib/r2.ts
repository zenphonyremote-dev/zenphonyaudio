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
): Promise<string> {
  const client = getR2Client()
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: supportLogsBucket(),
      Key: key,
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
