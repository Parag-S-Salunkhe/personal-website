---
name: security-audit
description: "Security review for Parag's personal site (Next.js 14 route handlers, middleware JWT auth, Prisma, Vercel). Use before pushing any branch, after changing an API route, auth, middleware, forms, rendering of user/DB content, JSON-LD, images config, headers or dependencies, and whenever asked for a security check or security review. Combines Anthropic's security-review method (high-confidence, low-noise findings) with this project's known weak spots and a no-leak check for secrets."
---

# Security audit: paragsalunkhe.me

Parag's rule: "always validate security for crucial things". Run this before every push and at the end of each phase that touches routes, auth or rendering.

## Step 1: Try the built-in first
If the `/security-review` command or skill is available in this session, run it (it needs `origin/HEAD`, which is set). If it isn't available (for example in a headless run), follow `references/security-review-method.md` yourself with BASE = `main`:
- gather context: `git diff --name-only main...HEAD`, `git log --no-decorate main..HEAD`, `git diff main...HEAD`
- find candidates, then check each one for false positives in a fresh pass (a sonnet subagent is fine), and drop anything under confidence 8/10
- report each finding as `file:line`, severity, the exploit scenario and the fix

## Step 2: Project checks (always, even if the built-in ran)
| # | Check | How |
|---|---|---|
| 1 | **Every mutating route handler requires admin** | `grep -n -E 'export async function (POST\|PUT\|PATCH\|DELETE)' -r app/api`. Each must call `requireAdmin` (lib/auth.ts) before touching Prisma. Exceptions by design: `POST /api/guestbook`, `POST /api/mood`, `POST /api/pageviews` (public, rate-limited, validated), `POST /api/auth/login`, `POST /api/auth/logout`. Prove it with curl: no cookie → 401. |
| 2 | **Admin pages and middleware** | `middleware.ts` protects `/admin/:path*`; it must fail closed when `JWT_SECRET` is missing. No secret fallbacks anywhere: `grep -rn -E "\|\| *'(admin|your-secret|changeme)" app lib middleware.ts` returns nothing. |
| 3 | **Login** | Timing-safe compare, a per-IP throttle, no logging of the password or its match result. Cookie is `httpOnly`, `secure` in production, `sameSite=lax`, with a sensible max-age. |
| 4 | **Cron and OAuth** | `/api/cron/*` returns 401 when `CRON_SECRET` is unset or doesn't match. Google OAuth uses a `state` cookie, checks it in the callback, and is admin-only. No `error.message` or stack in responses. |
| 5 | **URL injection** | Any DB-sourced URL used in `href`/`src` (`projectUrl`, `githubUrl`, `imageUrl`, `posterUrl`, `videoUrl`) is validated `http(s)` on write **and** at render. No `javascript:` or `data:` URLs. |
| 6 | **XSS** | `dangerouslySetInnerHTML` is only allowed for JSON-LD with the `.replace(/</g,'\\u003c')` escape. `grep -rn dangerouslySetInnerHTML app components`. Blog content renders as text or through a sanitizing markdown renderer; never raw HTML. |
| 7 | **Data exposure** | Public GET routes don't return `ipHash`, emails or internal fields. Prisma `select` limits the fields. |
| 8 | **Input validation** | Length limits and type checks on every write body (guestbook name and message, ratings 0–10, dates). Rate limits on the public writes. Prisma only, no `$queryRawUnsafe`. |
| 9 | **Headers** | `next.config.js` `headers()`: HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `X-Frame-Options: DENY` / `frame-ancestors 'none'`, and a CSP (report-only until it has been tested on every page). Check with `curl -sI localhost:<port>/`. |
| 10 | **Image optimizer** | `images.remotePatterns` must not be `hostname: '**'` (an open proxy). Allow TMDB plus the specific hosts used. |
| 11 | **Dependencies** | `npm audit --omit=dev`: no high or critical. New packages pass the npm safety check (maintainers, downloads, repo, no install scripts, exact pin). |
| 12 | **No leaks** | See step 3. |

## Step 3: Leak scan (print variable NAMES only, never values)
1. `git log -p main..HEAD` on each branch to be pushed: grep for `-----BEGIN`, `github_pat_`, `ghp_`, `sk-`, `AKIA`, `xox[bap]-`, `eyJhbGci`, `postgres(ql)?://[^ ]*:[^ ]*@`, `password\s*[:=]\s*['"][^'"]{6,}`, `.env` files and `*.pem`. No matches is the pass.
2. Bundle check: a node script (keep it in `.claude/redesign/tools/`) reads `.env` and searches the diff and `.next/static/**` for each value longer than 8 characters. It prints only `LEAK: <VAR_NAME> in <file>` or `clean`.
3. No secret uses the `NEXT_PUBLIC_` prefix. `.env*` is untracked: `git ls-files | grep -E '(^|/)\.env'` prints only `.env.example`, and that file holds placeholders.
4. Never `cat`, `echo` or print `.env` values or tokens, in the transcript or in files.

## Step 4: Report
Write the findings to the decisions ledger, and to MORNING.md "Needs Parag" when they need him (rotating secrets, Vercel env vars, anything on production). Fix high and medium findings before pushing; list the low ones. Don't claim "secure"; state what was checked and the evidence.

## References
- `references/security-review-method.md`: Anthropic's `/security-review` command text (MIT, from anthropics/claude-code-security-review). Its auto-run shell lines were replaced with explicit read-only git steps.
