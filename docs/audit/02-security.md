# PixRaise — Security Audit (Phase 3)

**Date:** 2026-07-30  
**Auditor:** Claude Sonnet 4.6  
**Methodology:** OWASP-style review — authentication, authorization, RLS, API handlers, admin panel, secrets, XSS, CSRF, file uploads, rate limiting, cookie security  
**Prerequisite:** Phase 1 architecture audit (`01-architecture.md`)

---

## Severity Summary

| ID | Severity | Title |
|---|---|---|
| C1 | **Critical** | Messages RLS — conversation participants can rewrite each other's message content |
| C2 | **Critical** | Missing RLS on `reports` and `platform_settings` — open to all authenticated users |
| C3 | **Critical** | Open redirect in login page (post-login `?next=` parameter) |
| H1 | **High** | Profiles RLS — users can self-verify, self-unsuspend, and self-inflate their rating |
| H2 | **High** | Storage INSERT policies allow any authenticated user to upload into any user's folder |
| H3 | **High** | `documents` storage bucket readable by all authenticated users |
| H4 | **High** | `lib/supabase/admin.ts` missing `import 'server-only'` — service role key not compile-time guarded |
| H5 | **High** | OAuth callback open redirect via protocol-relative `?next=//evil.com` |
| H6 | **High** | Admin login uses non-constant-time string comparison (timing attack on credentials) |
| M1 | **Medium** | No rate limiting on admin login or any write endpoint |
| M2 | **Medium** | Admin session HMAC secret derived from credentials — no independent secret |
| M3 | **Medium** | `platform_settings` POST endpoint: no key/value validation (mass upsert) |
| M4 | **Medium** | `PATCH /api/pixo/users/[id]` passes raw request body to DB update (mass assignment) |
| M5 | **Medium** | User IP leaked to third-party `ipapi.co` without user consent |
| M6 | **Medium** | Debug `console.log` with full profile data left in production client code |
| L1 | **Low** | `devenir-vendeur` role upgrade has no admin approval or rate limiting |
| L2 | **Low** | No `Content-Security-Policy` header configured |
| L3 | **Low** | `x-forwarded-for` header spoofable in `/api/geo` |

---

## Critical Findings

---

### C1 — Messages RLS: Conversation Participants Can Rewrite Each Other's Message Content

**Severity:** Critical  
**File:** `supabase/messaging-migration.sql:136-148`

#### Evidence

The updated `messages_update_receiver` policy introduced in `messaging-migration.sql` reads:

```sql
DROP POLICY IF EXISTS "messages_update_receiver" ON public.messages;
CREATE POLICY "messages_update_receiver" ON public.messages
  FOR UPDATE USING (
    auth.uid() = receiver_id
    OR (
      conversation_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = conversation_id
          AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
      )
    )
  );
```

The `USING` clause allows **any conversation participant** (buyer or seller) to update **any message** in their shared conversation. There is no `WITH CHECK` clause restricting which columns can be modified, and no restriction that the updater must be the *receiver* of the message being updated.

In PostgreSQL, when `WITH CHECK` is absent on an UPDATE policy, the USING condition is reused for `WITH CHECK` — but it only validates that the updated row still satisfies the membership predicate, not that only specific columns changed.

#### Attack Scenario

1. Buyer and seller share a conversation (conv_id = `abc`).  
2. Seller sends a message (id = `msg123`) with content `"My price is 5000 DA"`.  
3. Buyer calls from the browser Supabase client:  
   ```js
   supabase.from("messages")
     .update({ content: "I never said that" })
     .eq("id", "msg123")
   ```
4. The RLS policy evaluates: is the buyer a participant in conv `abc`? Yes → UPDATE allowed.  
5. The seller's message content is permanently overwritten. No audit trail exists.

The same applies in reverse (seller can overwrite buyer messages). Additionally, a participant could update the `sender_id` field to make their own messages appear to come from the other party.

#### Fix

Add a `WITH CHECK` clause that permits updating only `read_at` and `is_read`, and only by a user who is *not* the sender:

```sql
CREATE POLICY "messages_update_receiver" ON public.messages
  FOR UPDATE
  USING (
    conversation_id IS NOT NULL
    AND sender_id <> auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  )
  WITH CHECK (
    conversation_id IS NOT NULL
    AND sender_id <> auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );
```

A safer complementary control: add a BEFORE UPDATE trigger on `messages` that raises an exception if any column other than `read_at` and `is_read` is changed.

---

### C2 — Missing RLS on `reports` and `platform_settings` Tables

**Severity:** Critical  
**File:** `supabase/admin-migration.sql:15-35`

#### Evidence

The admin migration creates both tables without enabling Row Level Security:

```sql
CREATE TABLE IF NOT EXISTS platform_settings (
  key         TEXT        PRIMARY KEY,
  value       JSONB,
  updated_at  TIMESTAMPTZ DEFAULT now()
);
-- No ENABLE ROW LEVEL SECURITY
-- No policies

CREATE TABLE IF NOT EXISTS public.reports (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type  TEXT        NOT NULL,
  target_id    UUID        NOT NULL,
  reason       TEXT        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- No ENABLE ROW LEVEL SECURITY
-- No policies
```

In Supabase, when RLS is **disabled** on a table, the anon and authenticated roles have full access by default (subject to Postgres table-level grants, but Supabase grants SELECT/INSERT/UPDATE/DELETE to the `authenticated` role on all public tables by default).

The architecture audit notes the 6 "core tables" have RLS, but `reports` and `platform_settings` were added in a later migration and were not included in that count.

#### Attack Scenarios

**Scenario A — Read all reports:**  
Any authenticated user calls:
```js
supabase.from("reports").select("*")
```
They receive every report ever filed: the reporter's identity, the target (user/service/product), and the reason. This de-anonymizes reporters and exposes content moderation data to all users.

**Scenario B — Write platform settings directly:**  
Any authenticated user calls:
```js
supabase.from("platform_settings")
  .upsert({ key: "maintenance_mode", value: true })
```
This puts the entire platform into maintenance mode without going through the admin panel.

**Scenario C — Self-clear a report:**  
A user who was reported can update their own report's status:
```js
supabase.from("reports")
  .update({ status: "dismissed" })
  .eq("target_id", "their_own_user_id")
```

#### Fix

Add to a new migration:

```sql
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- platform_settings: no direct user access (admin client bypasses RLS)
-- No SELECT policy = no access via anon/authenticated role

-- reports: reporters can insert, but nothing else is exposed
CREATE POLICY "reports_insert_auth" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- reporters can view their own reports
CREATE POLICY "reports_select_own" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);
```

---

### C3 — Open Redirect in Login Page (Post-Login `?next=` Parameter)

**Severity:** Critical  
**File:** `app/login/page.tsx:25, 47`

#### Evidence

```ts
// line 25
const next = searchParams.get("next") || "/dashboard";
// line 47
router.push(next);
```

The `next` parameter from the URL query string is passed directly to `router.push()` without validation. In Next.js App Router, `router.push("https://evil.com")` navigates the browser to the external URL.

The same value flows into the `next` search param from the middleware redirect (`middleware.ts:29-31`):
```ts
loginUrl.searchParams.set('next', pathname)
return NextResponse.redirect(loginUrl)
```
When an attacker crafts a URL like `https://pixraise.com/login?next=https://phishing-site.com`, a user who is prompted to log in will be seamlessly redirected to the attacker's domain after successful authentication.

#### Attack Scenario

1. Attacker sends phishing email: "Votre compte a été suspendu — connectez-vous" with link `https://pixraise.com/login?next=https://attacker.com/fake-login`.  
2. User trusts the PixRaise domain, logs in successfully.  
3. After authentication, `router.push("https://attacker.com/fake-login")` fires — user is now on the attacker's site.  
4. Attacker harvests credentials by displaying a fake "session expired" message.

#### Fix

Validate that `next` is a relative path:
```ts
const rawNext = searchParams.get("next") || "/dashboard"
const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard"
```

Apply the same validation in `app/auth/callback/route.ts:8`:
```ts
const rawNext = searchParams.get("next") ?? "/dashboard"
const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard"
```

---

## High Findings

---

### H1 — Profiles RLS: Users Can Self-Verify, Self-Unsuspend, and Inflate Their Own Rating

**Severity:** High  
**File:** `supabase/schema.sql:284-289`

#### Evidence

```sql
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

The policy allows any authenticated user to update **any column** of their own profile row. There is no column-level restriction. In Supabase, RLS does not restrict which columns are updated — only which rows.

Sensitive columns in `profiles` that users should not be able to set themselves:
- `is_verified` — platform verification badge
- `suspended` — admin-set suspension flag (set by `/api/pixo/users/[id]`)
- `rating` — aggregate rating computed by trigger
- `total_reviews` — aggregate count computed by trigger

#### Attack Scenario

Any authenticated user calls from the browser Supabase client:
```js
supabase.from("profiles")
  .update({ is_verified: true, rating: 4.99, total_reviews: 500, suspended: false })
  .eq("id", myUserId)
```

Result: The user appears as a trusted, highly-rated, unsuspended seller with a verified badge, even if an admin has suspended them. Admin suspensions are completely ineffective.

#### Fix

Add a BEFORE UPDATE trigger on `profiles` that prevents changes to protected columns by non-service-role callers:

```sql
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Allow service role to update anything
  IF current_setting('role') = 'service_role' THEN
    RETURN NEW;
  END IF;
  -- Prevent user from changing computed/admin-only fields
  NEW.is_verified   := OLD.is_verified;
  NEW.suspended     := OLD.suspended;
  NEW.rating        := OLD.rating;
  NEW.total_reviews := OLD.total_reviews;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_profile_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();
```

---

### H2 — Storage Bucket INSERT Policies Allow Any Authenticated User to Upload to Any Folder

**Severity:** High  
**Files:** `supabase/schema.sql:445-447, 462-466, 495-497`

#### Evidence

Three storage buckets have INSERT policies that only check `auth.role() = 'authenticated'` without verifying the upload path:

```sql
-- avatars bucket (schema.sql:445-447)
CREATE POLICY "avatars_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- service-images bucket (schema.sql:462-466)
CREATE POLICY "service_images_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'service-images' AND auth.role() = 'authenticated');

-- digital-products bucket (schema.sql:495-497)
CREATE POLICY "digital_products_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'digital-products' AND auth.role() = 'authenticated');
```

The UPDATE and DELETE policies correctly scope to `(storage.foldername(name))[1] = auth.uid()::text`, but INSERT has no such check.

#### Attack Scenarios

**Avatars/Service-Images:** User A uploads a file to path `{userB_id}/avatar.jpg`, overwriting user B's profile photo with offensive content.

**Digital-Products (most severe):** Any authenticated buyer can upload files to any seller's private product folder. If a seller's product download policy checks folder ownership to grant access, an attacker can upload a malicious file into the seller's folder and potentially confuse the download flow. Additionally, any authenticated user can fill a seller's quota.

#### Fix

Add the folder-owner check to all INSERT policies:
```sql
-- Replace avatars_insert_auth
CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Same pattern for service-images and digital-products
```

---

### H3 — `documents` Bucket: All Authenticated Users Can Read Any Document

**Severity:** High  
**File:** `supabase/schema.sql:508-511`

#### Evidence

```sql
CREATE POLICY "documents_select_auth"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
```

The SELECT policy for the `documents` bucket (used for KYC / identity documents) allows any authenticated user to read any document object in the bucket. The bucket is private (`public: false`), but the RLS policy grants read access to all logged-in users.

#### Attack Scenario

User authenticates with a free buyer account. They enumerate document filenames (guessable pattern `{userId}/document.pdf` or visible in any public profile metadata) and download other users' identity documents, including passport scans and proof-of-address files.

#### Fix

Restrict document access to the document's own uploader:
```sql
DROP POLICY IF EXISTS "documents_select_auth" ON storage.objects;
CREATE POLICY "documents_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

### H4 — `lib/supabase/admin.ts` Missing `import 'server-only'`

**Severity:** High  
**File:** `lib/supabase/admin.ts:1-9`

#### Evidence

```ts
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

The file references `SUPABASE_SERVICE_ROLE_KEY` (a server-only secret) but does not import `'server-only'`. The `server-only` package causes a build-time error if the module is imported from a client component, preventing the secret from being bundled into client-side JavaScript. Without it, the guard is absent.

`lib/supabase/server.ts` and `lib/auth/role.server.ts` both correctly use `import 'server-only'`. The admin client is the only server utility that does not.

#### Attack Scenario

A developer adds `import { createAdminClient } from '@/lib/supabase/admin'` to a component marked `"use client"`. Without the `server-only` guard, Next.js bundles `SUPABASE_SERVICE_ROLE_KEY` into the client JavaScript bundle. Any user who inspects the page source or JS files retrieves the service role key, which bypasses all RLS and gives full database access.

#### Fix

Add as the first line of `lib/supabase/admin.ts`:
```ts
import 'server-only'
```

---

### H5 — OAuth Callback Open Redirect via Protocol-Relative URL

**Severity:** High  
**File:** `app/auth/callback/route.ts:8, 30`

#### Evidence

```ts
const next = searchParams.get("next") ?? "/dashboard"
// ...
return NextResponse.redirect(`${origin}${next}`)
```

The redirect URL is constructed as `${origin}${next}` — e.g., `https://pixraise.com${next}`. If `next = "//evil.com/path"`, the resulting URL is `https://pixraise.com//evil.com/path`. Many browsers and HTTP clients normalize double-slash paths and redirect to `https://evil.com/path` (treating `//` as protocol-relative).

The `next` value arrives in this handler from Supabase's OAuth redirect (which preserves query params set on the `redirectTo` option). An attacker can set `redirectTo` to include `?next=//evil.com` at the start of the flow.

#### Attack Scenario

1. Attacker crafts: `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'https://pixraise.com/auth/callback?next=//attacker.com' } })` (can be triggered from an attacker-controlled page or modified request).
2. After Google OAuth, the callback constructs `https://pixraise.com//attacker.com`.
3. Browser follows and lands on `https://attacker.com` while still in the legitimate auth flow.

#### Fix

Same as C3 — validate `next`:
```ts
const rawNext = searchParams.get("next") ?? "/dashboard"
const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard"
return NextResponse.redirect(`${origin}${next}`)
```

---

### H6 — Admin Login: Non-Constant-Time Credential Comparison

**Severity:** High  
**File:** `app/api/pixo/login/route.ts:7-9`

#### Evidence

```ts
if (
  username !== process.env.ADMIN_USERNAME ||
  password !== process.env.ADMIN_PASSWORD
) {
  return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
}
```

JavaScript's `!==` operator is **not** constant-time. String comparison short-circuits on the first mismatched character. This means the time taken to reject an incorrect credential varies with how many leading characters match the correct value. A remote timing attack can exploit this to recover the admin credentials character by character.

The `verifyToken()` function in `lib/pixo-auth.ts` correctly uses `timingSafeEqual`, but the credential check at login does not.

#### Attack Scenario

An attacker sends thousands of login attempts with different first characters of the password and measures response times (sub-millisecond differences are measurable with statistical aggregation over many requests). The shortest response time reveals the correct first character. The attack is then repeated for each subsequent character. Given no rate limiting (see M1), this attack is unconstrained.

#### Fix

```ts
import { timingSafeEqual } from 'crypto'

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

if (
  !safeCompare(username, process.env.ADMIN_USERNAME ?? '') ||
  !safeCompare(password, process.env.ADMIN_PASSWORD ?? '')
) { ... }
```

---

## Medium Findings

---

### M1 — No Rate Limiting on Admin Login or Any Write Endpoint

**Severity:** Medium  
**Files:** `app/api/pixo/login/route.ts`, `app/api/conversations/route.ts`, all `/api/pixo/**` routes

There is no rate limiting on any API route handler. The admin login endpoint (`POST /api/pixo/login`) accepts unlimited attempts, enabling brute-force attacks (especially dangerous when combined with H6). The conversations endpoint accepts unlimited POSTs, enabling spam creation.

**Fix:** Add Vercel's built-in rate limiting in `middleware.ts`, or use a middleware package (e.g., `@upstash/ratelimit`) keyed on IP or user ID. Specifically: limit `/api/pixo/login` to 5 attempts per IP per 15 minutes.

---

### M2 — Admin Session HMAC Secret is Derived from Admin Credentials

**Severity:** Medium  
**File:** `lib/pixo-auth.ts:5-7`

```ts
function getSecret() {
  return (process.env.ADMIN_PASSWORD ?? '') + (process.env.ADMIN_USERNAME ?? '')
}
```

The HMAC signing key for the `pixo_session` cookie is a concatenation of the admin password and username. Two problems:
1. If either env var is missing or empty (misconfiguration), the HMAC key is weak or empty — session tokens become forgeable by anyone who guesses the pattern.
2. Rotating the admin password immediately invalidates all active admin sessions and vice versa — the secret should be independent of credentials.

**Fix:** Add a dedicated `ADMIN_SESSION_SECRET` env var (at least 32 random bytes, base64-encoded) and use it as the HMAC key instead.

---

### M3 — `platform_settings` POST: No Key/Value Validation

**Severity:** Medium  
**File:** `app/api/pixo/settings/route.ts:17-23`

```ts
const { key, value } = await req.json()
const sb = createAdminClient()
const { error } = await sb.from('platform_settings')
  .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
```

The key and value from the request body are directly upserted without validation against an allowed list. An admin with a compromised session could insert arbitrary keys, potentially being used for stored XSS if the settings are later rendered in the admin UI without escaping. The `value` field is JSONB and could be any structure.

**Fix:** Validate `key` against a hardcoded allowlist (`['maintenance_mode', 'featured_freelancers']`) and validate `value` schema accordingly before upserting.

---

### M4 — `PATCH /api/pixo/users/[id]`: Full Request Body Passed to DB Update (Mass Assignment)

**Severity:** Medium  
**File:** `app/api/pixo/users/[id]/route.ts:19-22`

```ts
const body = await req.json()
const sb = createAdminClient()
const { error } = await sb.from('profiles').update(body).eq('id', id)
```

The entire deserialized request body is passed directly to the Supabase update. Any field in `profiles` can be overwritten, including `id`, `created_at`, or foreign-key-like fields. While this requires a valid admin session, it is poor hygiene and increases blast radius if admin credentials are compromised.

**Fix:** Whitelist the allowed update fields:
```ts
const { full_name, bio, wilaya, role, suspended, is_verified } = await req.json()
await sb.from('profiles').update({ full_name, bio, wilaya, role, suspended, is_verified }).eq('id', id)
```

---

### M5 — User IP Forwarded to Third-Party `ipapi.co` Without User Consent

**Severity:** Medium  
**File:** `app/api/geo/route.ts:34`

```ts
const res = await fetch(`https://ipapi.co/${ip}/json/`, {
  signal: AbortSignal.timeout(5000),
})
```

In non-Vercel environments (or when Vercel geo headers are absent), the user's real IP is sent to `ipapi.co`, a third-party service. This IP processing constitutes personal data transfer under GDPR (Algeria does not currently have equivalent legislation, but EU users may be affected). No API key is used, which means requests are rate-limited and the IP is logged by ipapi.co.

**Fix:** Either remove the external fallback (return `{ detected: false }` when Vercel headers are absent), or document the data processing and add user consent. If keeping the fallback, use a paid ipapi.co API key which provides better privacy guarantees.

---

### M6 — Debug `console.log` with Full Profile Data Left in Production Client Code

**Severity:** Medium  
**File:** `app/profile/page.tsx:286-287`

```ts
console.log('Profile data:', profileData)
console.log('Profile error:', profileError)
```

These statements (and several others throughout the profile page) emit the full user profile object — including `bio`, `role`, `rating`, `suspended` status — to the browser console in production. Any user with DevTools open can read sensitive data from the console; malicious browser extensions can also capture it.

**Fix:** Remove all debug `console.log` statements from the profile page before production deployment. Use structured logging behind an `if (process.env.NODE_ENV !== 'production')` guard if needed for development.

---

## Low Findings

---

### L1 — `devenir-vendeur` Role Upgrade: No Admin Approval Required

**Severity:** Low  
**File:** `app/devenir-vendeur/page.tsx:67-81`

Any buyer can upgrade their account to seller status in a single click with no admin review, identity verification, or waiting period. The RLS policy (`profiles_update_own`) permits updating the `role` column. While this appears to be the intended product design ("gratuit et sans engagement"), it means the platform cannot vet sellers.

**Fix:** If seller vetting is ever desired, add an `admin_approved` flag to `profiles` and require admin approval before seller-only features are unlocked. If open signup is intentional, no action needed — document the design decision.

---

### L2 — No Content-Security-Policy (CSP) Header

**Severity:** Low  
**File:** `next.config.ts` (missing configuration)

No CSP headers are configured. While no `dangerouslySetInnerHTML` usage was found in the codebase, the absence of a CSP means that any future XSS vulnerability (e.g., from a third-party library or an overlooked injection point) has no secondary defense. The app loads external resources (Google Fonts, Supabase CDN) that should be whitelisted.

**Fix:** Add CSP headers in `next.config.ts`:
```ts
async headers() {
  return [{
    source: '/(.*)',
    headers: [{
      key: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' 'unsafe-inline'; ..."
    }]
  }]
}
```

---

### L3 — `x-forwarded-for` Header Spoofable in `/api/geo`

**Severity:** Low  
**File:** `app/api/geo/route.ts:27-28`

```ts
const forwarded = request.headers.get('x-forwarded-for')
const ip = forwarded ? forwarded.split(',')[0].trim() : ''
```

The `x-forwarded-for` header can be set by the client to any value. On Vercel, the real client IP is available via `x-real-ip` or Vercel's own headers, and the last entry in `x-forwarded-for` (not the first) represents the Vercel edge IP. An attacker can set `x-forwarded-for: 8.8.8.8` to get geolocation data for any IP.

**Risk:** Low — the geolocation is used only for UX (auto-detecting the user's city for their profile). It is not used for any security decision.

**Fix:** In production on Vercel, the Vercel geo headers (`x-vercel-ip-city`) are used first (line 17-24) and are not spoofable. The `x-forwarded-for` path only runs as a fallback in development. The risk is negligible in production.

---

## Sections Without Findings

### XSS (Cross-Site Scripting)
No `dangerouslySetInnerHTML` usage found in any component. All user-supplied content (message text, bio, full name, review comments) is rendered through React JSX which automatically HTML-escapes content. No XSS vectors identified.

### CSRF (Cross-Site Request Forgery)
Supabase session cookies set by `@supabase/ssr` use `SameSite=Lax` by default. The admin `pixo_session` cookie explicitly uses `sameSite: 'strict'` (`app/api/pixo/login/route.ts:21`). Combined, CSRF risk for most write operations is low. The `/api/conversations` POST endpoint is protected by the `SameSite=Lax` Supabase cookie and requires a valid Supabase session. No additional CSRF tokens are needed given the current architecture.

### Messaging System — Authorization (Thread Access)
The `app/messages/[id]/page.tsx` Server Component correctly checks that the requesting user is a participant before rendering the thread. This check is server-side and cannot be bypassed:
```ts
if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
  redirect("/messages")
}
```
The Realtime subscription filter (`conversation_id=eq.${convId}`) is further protected by the `messages_select_participants` RLS policy, which requires conversation membership.

### API Route Authorization
All `/api/pixo/**` routes correctly call `isValidAdminRequest(req)` at the top of each handler before any DB access. The `/api/conversations` route correctly calls `sb.auth.getUser()` and returns 401 if no session. No unprotected admin or user routes were found.

### Environment Variables / Secret Exposure
`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` are correctly non-`NEXT_PUBLIC_` prefixed and are not exposed to the client bundle directly (though H4 covers the compile-time guard gap). No secrets found hardcoded in source files. `.env.local` is in `.gitignore` (standard Next.js default).

### Cookie Security
Admin `pixo_session` cookie: `httpOnly: true`, `secure: true` (production), `sameSite: 'strict'`, `maxAge: 86400`. These are all correct.
Supabase session cookies: managed by `@supabase/ssr` with `httpOnly: true` and `secure: true` in production.

---

## Appendix — RLS Coverage Map

| Table | RLS Enabled | Policies | Notes |
|---|---|---|---|
| `profiles` | Yes | select/insert/update (own) | UPDATE has no column restrictions — see H1 |
| `services` | Yes | select/insert(seller role)/update/delete | Correct |
| `digital_products` | Yes | select/insert(seller role)/update/delete | Correct |
| `orders` | Yes | select/insert/update (participants) | Not exposed in UI (SHOW_ORDERS=false) |
| `reviews` | Yes | select/insert(completed order)/update/delete | Correct |
| `conversations` | Yes | select/insert (participants) | Correct |
| `messages` | Yes | select/insert/update/delete | UPDATE policy overly permissive — see C1 |
| `reports` | **No** | None | **Critical gap — see C2** |
| `platform_settings` | **No** | None | **Critical gap — see C2** |

| Storage Bucket | Public | INSERT policy scoped to user? | Notes |
|---|---|---|---|
| `avatars` | Yes | No — any authenticated user | See H2 |
| `service-images` | Yes | No — any authenticated user | See H2 |
| `digital-products` | No | No — any authenticated user | See H2 (highest severity) |
| `documents` | No | No — any authenticated user | SELECT also open — see H3 |
| `covers` | Yes | Yes — folder = uid | Correct (fix-lot1.sql) |
| `services` (legacy) | Yes | Partially | Cleanup pending |
| `products-previews` (legacy) | Yes | Partially | Cleanup pending |
| `products-files` (legacy) | No | Partially | Cleanup pending |
