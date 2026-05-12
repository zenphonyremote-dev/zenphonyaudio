import { readFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { checkAdmin } from "@/lib/admin-auth"
import {
  ZENMODE_COOKIE_NAME,
  verifyElevationCookie,
} from "@/lib/zenmode-elevate"

export const dynamic = "force-dynamic"

// Inline form served when the elevation cookie is missing/expired. Keeps
// the dependency surface minimal (no extra file, no client-side framework
// — just a vanilla fetch on submit). The form posts to /api/admin/zen-elevate
// and on success reloads /ZenMode, which now sees the cookie and serves
// the admin shell.
function elevationForm(reason: string, prefilledEmail: string): string {
  const safeEmail = prefilledEmail.replace(/"/g, "&quot;")
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ZenMode · Confirm credentials</title>
  <style>
    :root { color-scheme: dark; }
    body {
      margin: 0; min-height: 100vh; display: grid; place-items: center;
      font-family: -apple-system, "SF Pro Text", system-ui, sans-serif;
      background: radial-gradient(ellipse at top, #1b1530 0%, #0a0712 100%);
      color: #f4f3fa;
    }
    .card {
      width: min(420px, 92vw);
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 28px 28px 24px;
      backdrop-filter: blur(16px);
      box-shadow: 0 24px 64px -32px rgba(0,0,0,0.7);
    }
    h1 { font-size: 18px; margin: 0 0 6px; font-weight: 600; letter-spacing: -0.01em; }
    .sub { font-size: 13px; color: #aaa3c4; margin: 0 0 22px; line-height: 1.45; }
    label { display: block; font-size: 12px; color: #c5bee0; margin: 14px 0 6px; letter-spacing: 0.02em; text-transform: uppercase; }
    input {
      width: 100%; box-sizing: border-box; padding: 11px 14px;
      background: rgba(0,0,0,0.35); color: #fff; font-size: 14px;
      border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
      outline: none; transition: border-color 0.15s;
    }
    input:focus { border-color: rgba(192, 38, 211, 0.55); }
    button {
      width: 100%; margin-top: 22px; padding: 12px;
      background: linear-gradient(135deg, #7c3aed, #c026d3);
      color: #fff; font-weight: 600; font-size: 14px; letter-spacing: 0.01em;
      border: 0; border-radius: 10px; cursor: pointer;
      transition: transform 0.08s, opacity 0.15s;
    }
    button:hover { transform: translateY(-1px); }
    button:active { transform: translateY(0); }
    button:disabled { opacity: 0.5; cursor: progress; }
    .err {
      display: none; margin-top: 14px; padding: 10px 12px;
      background: rgba(220, 38, 38, 0.12); border: 1px solid rgba(220, 38, 38, 0.4);
      color: #fca5a5; border-radius: 8px; font-size: 12.5px;
    }
    .err.show { display: block; }
    .hint { margin-top: 18px; font-size: 11.5px; color: #6e6789; text-align: center; }
  </style>
</head>
<body>
  <main class="card">
    <h1>Confirm credentials</h1>
    <p class="sub">${reason}</p>
    <form id="f" autocomplete="on">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" required autocomplete="username" value="${safeEmail}" />
      <label for="password">Password</label>
      <input id="password" name="password" type="password" required autocomplete="current-password" autofocus />
      <button id="btn" type="submit">Enter ZenMode</button>
      <div id="err" class="err"></div>
    </form>
    <p class="hint">Even with an active session, ZenMode requires explicit re-auth on every entry.</p>
  </main>
  <script>
    const f = document.getElementById("f");
    const btn = document.getElementById("btn");
    const err = document.getElementById("err");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      err.classList.remove("show");
      btn.disabled = true; btn.textContent = "Verifying…";
      try {
        const res = await fetch("/api/admin/zen-elevate", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
          }),
        });
        if (res.ok) {
          window.location.replace("/ZenMode");
          return;
        }
        err.textContent = "Invalid credentials.";
        err.classList.add("show");
      } catch (e) {
        err.textContent = "Network error. Try again.";
        err.classList.add("show");
      } finally {
        btn.disabled = false; btn.textContent = "Enter ZenMode";
      }
    });
  </script>
</body>
</html>`
}

export async function GET(request: Request) {
  // First gate: must have a Better Auth session at all, and that session's
  // user must be flagged is_admin in profiles. This is the existing check;
  // unchanged.
  const check = await checkAdmin()
  if (!check.ok) {
    const url = new URL("/account", request.url)
    if (check.reason === "expired") url.searchParams.set("reauth", "1")
    return NextResponse.redirect(url, { status: 302 })
  }

  // Second gate (new): even with a fresh session + is_admin, we require an
  // explicit password re-verify on every /ZenMode entry. The verify mints
  // a 30-minute HMAC-signed cookie; while the cookie is fresh, navigation
  // within ZenMode is allowed without re-prompting. After it expires or
  // on a fresh /ZenMode visit without the cookie, we serve the elevation
  // form instead of the admin shell.
  const cookieStore = await cookies()
  const elevCookie = cookieStore.get(ZENMODE_COOKIE_NAME)?.value
  const elev = verifyElevationCookie(elevCookie)

  if (!elev.ok || elev.userId !== check.user.id) {
    const reason =
      elev.ok === false && elev.reason === "expired"
        ? "Your ZenMode session has expired. Re-enter your password to continue."
        : "Please confirm your password to enter ZenMode."
    return new NextResponse(elevationForm(reason, check.user.email), {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store, max-age=0",
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      },
    })
  }

  const html = await readFile(
    path.join(process.cwd(), "lib", "admin-shell.html"),
    "utf8",
  )

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  })
}
