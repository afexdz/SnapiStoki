# PixRaise — Architecture Audit (Phase 1)

**Date:** 2026-07-29  
**Auditor:** Claude Sonnet 4.6  
**Codebase root:** `/Users/abdennour/Desktop/SnapiStoki`  
**Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Supabase (`@supabase/ssr` ^0.12), Vercel

---

## 1. Identity & Naming

The project has a split identity worth knowing upfront:

| Layer | Name |
|---|---|
| Git repo / macOS folder | `SnapiStoki` |
| `package.json` → `name` | `pixraise` |
| App title / branding | **PixRaise** |
| Admin panel codename | **Pixo** |

All internal code references "PixRaise" (or "Pixo" for admin). The folder name `SnapiStoki` appears to be an older working name that was never updated at the filesystem level.

---

## 2. Folder Structure

```
SnapiStoki/
├── app/                        # Next.js App Router — all routes
│   ├── api/                    # Route handlers (REST-style endpoints)
│   │   ├── conversations/      # POST — create/find conversation
│   │   ├── geo/                # GET  — IP geolocation
│   │   └── pixo/               # Admin API (login, logout, dashboard, CRUD)
│   │       ├── dashboard/
│   │       ├── login/
│   │       ├── logout/
│   │       ├── orders/
│   │       ├── products/ [id]/
│   │       ├── reports/ [id]/
│   │       ├── reviews/ [id]/
│   │       ├── services/ [id]/
│   │       ├── settings/
│   │       └── users/ [id]/
│   ├── auth/callback/          # OAuth PKCE exchange handler
│   ├── dashboard/              # Protected user dashboards
│   │   ├── client/             # Buyer dashboard (overview, orders, favorites)
│   │   ├── freelance/          # Seller dashboard (overview, services, products, orders)
│   │   └── messages/           # Redirect → /messages
│   ├── devenir-vendeur/        # Role-upgrade landing page
│   ├── freelances/             # Service listings (browse, filter, sort)
│   ├── login/                  # Email + Google auth
│   ├── marketplace/            # Digital product listings
│   ├── messages/               # Inbox list
│   │   └── [id]/               # Message thread (Server + Client hybrid)
│   ├── pixo/                   # Admin panel
│   │   ├── (panel)/            # Authenticated admin routes (route group)
│   │   │   ├── AdminShell.tsx  # Admin sidebar + toast context
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── services/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── reviews/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   └── page.tsx            # Admin login form
│   ├── products/ [id]/         # Digital product detail
│   │   └── new/                # Create digital product (protected)
│   ├── profile/                # Own profile (edit)
│   │   └── [id]/               # Public profile view
│   ├── register/               # Registration form
│   ├── search/                 # Search results
│   ├── services/ [id]/         # Service detail
│   │   └── new/                # Create service (protected)
│   ├── globals.css
│   ├── layout.tsx              # Root layout (fonts, theme script)
│   └── page.tsx                # Landing page (Server Component)
│
├── components/                 # Shared presentational components
│   ├── Categories.tsx
│   ├── Footer.tsx
│   ├── GetStarted.tsx
│   ├── Hero.tsx
│   ├── HowItWorks.tsx
│   ├── Marketplace.tsx
│   ├── Navbar.tsx              # Sticky nav with auth state + dark mode
│   ├── ProductCard.tsx
│   ├── ServiceCard.tsx
│   ├── TopFreelancers.tsx
│   └── UnreadBadge.tsx         # Live unread message counter (Realtime)
│
├── lib/                        # Shared server/client utilities
│   ├── auth/
│   │   ├── role.server.ts      # Server-only: getUserRole() hits DB
│   │   └── role.ts             # Client-safe: UserRole type + isSeller()
│   ├── supabase/
│   │   ├── admin.ts            # Service-role client (bypasses RLS)
│   │   ├── client.ts           # Browser client (SSR cookie-aware)
│   │   └── server.ts           # Server client (cookie store)
│   ├── types/
│   │   └── db.ts               # Canonical TypeScript DB types
│   ├── features.ts             # Feature flags (SHOW_ORDERS)
│   ├── geolocation.ts          # IP→wilaya via /api/geo
│   ├── location.ts             # formatLocation helper
│   ├── pixo-auth.ts            # Admin HMAC session token helpers
│   ├── ranking.ts              # Score-based ranking for services/products
│   └── wilayas.ts              # Algerian wilaya list + coordinates
│
├── supabase/                   # SQL migrations (run manually in Supabase Dashboard)
│   ├── schema.sql              # Base schema (v1 — partially outdated, see §8)
│   ├── admin-migration.sql     # Adds: suspended, wilaya, cover, reports, platform_settings
│   ├── publishing-migration.sql # Adds: packages, gallery, tags, avg_rating, buckets
│   ├── fix-lot1.sql            # Fixes trigger, adds covers bucket, hardens RLS
│   └── messaging-migration.sql # Adds: conversations table, rewrites messages RLS
│
├── utils/
│   └── distance.ts             # Haversine-based distance sort
│
├── middleware.ts               # Route protection via Supabase session refresh
├── next.config.ts              # Minimal (no custom config)
├── package.json
└── .env.local                  # Supabase keys + admin credentials
```

---

## 3. Overall Architecture

PixRaise is a **Algerian creative marketplace** with two user-facing tracks and a separate admin panel:

- **Public/consumer side** — landing page, service/product browsing, messaging
- **User dashboards** — role-based: buyer (client) or seller (freelance)
- **Admin panel** (`/pixo`) — standalone auth, manages all entities

The rendering strategy is **mixed**:

| Pattern | Where |
|---|---|
| Server Component + server Supabase client | `app/page.tsx`, `app/messages/[id]/page.tsx`, `app/pixo/(panel)/layout.tsx` |
| Client Component + browser Supabase client (useEffect fetch) | All dashboard pages, listing pages (`/freelances`, `/marketplace`), `/messages/page.tsx`, `/services/[id]`, `/products/[id]` |
| Route Handler (API) | `app/api/**` |

The app **does not use Next.js Server Actions** anywhere. Data mutations go either through direct Supabase browser-client calls in Client Components, or through route handlers in `app/api/`.

---

## 4. Authentication Flow (User — Supabase)

### 4.1 Registration

`app/register/page.tsx` — Client Component.

1. User fills form and chooses `buyer` or `seller` role.
2. Calls `supabase.auth.signUp({ email, password, options: { data: { full_name, role }, emailRedirectTo: 'https://pixraise.com/auth/callback' } })`.
3. On success, shows "check email" screen.
4. User clicks email link → lands on `/auth/callback`.

**DB trigger on `auth.users` INSERT** (`handle_new_user` in `fix-lot1.sql`):
- Auto-inserts a row in `public.profiles` with `id`, `full_name`, `role` (extracted from `raw_user_meta_data`), and `wilaya`.
- Uses `ON CONFLICT (id) DO NOTHING` so it is idempotent.

**Important nuance:** `register/page.tsx` checks `data.user.identities.length === 0` to detect Supabase's anti-enumeration behavior (when the email already exists, Supabase still returns a user object but with an empty `identities` array).

### 4.2 Login

`app/login/page.tsx` — Client Component, uses `Suspense` to wrap `LoginForm` (needed because `useSearchParams()` is called inside).

Two paths:
- **Email/password:** `supabase.auth.signInWithPassword()` → `router.push(next)` → `router.refresh()`.
- **Google OAuth:** `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '...origin.../auth/callback' } })` → browser redirects to Google → returns to `/auth/callback`.

### 4.3 OAuth Callback

`app/auth/callback/route.ts` — Route Handler (GET).

- Receives `?code=<pkce_code>` from Supabase OAuth redirect.
- Calls `supabase.auth.exchangeCodeForSession(code)`.
- Redirects to `?next=` param (default `/dashboard`).
- On error, redirects to `/login?error=auth`.

### 4.4 Middleware Session Refresh

`middleware.ts` runs on:
```
/profile/:path*, /dashboard/:path*, /services/new, /products/new, /devenir-vendeur
```

On every matched request:
1. Constructs a server Supabase client (cookie-aware via `NextRequest`).
2. Calls `supabase.auth.getUser()` — this **refreshes the session** if the access token is expired and the refresh token is valid.
3. If no user, redirects to `/login?next=<pathname>`.

**Important:** The middleware does not distinguish roles — it only checks if a Supabase user exists. Role-based routing is handled at the page level.

### 4.5 Sign-out

Multiple places call `supabase.auth.signOut()`:
- `Navbar.tsx` — `handleSignOut()`
- `dashboard/freelance/page.tsx` — logout button
- `dashboard/client/page.tsx` — logout button
- Admin panel — calls `DELETE /api/pixo/logout` (clears `pixo_session` cookie)

### 4.6 Session State in Components

All Client Components that need the current user call:
```ts
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
```
inside a `useEffect`. If `user` is null they `router.push('/login')`.

This means **protected dashboard pages perform a double auth check**: middleware already verified the session server-side, then the client component re-verifies after hydration. This is safe but adds a waterfall Supabase round-trip on every page load.

The `Navbar.tsx` additionally subscribes to `supabase.auth.onAuthStateChange()` to keep the avatar/user state reactive.

---

## 5. Authentication Flow (Admin — Pixo)

The admin system at `/pixo` is **completely separate from Supabase Auth**. It uses a custom HMAC-signed session cookie.

**Credentials:** `ADMIN_USERNAME` and `ADMIN_PASSWORD` env vars (plaintext comparison).

### Flow

1. Admin visits `/pixo` → rendered by `app/pixo/page.tsx` (Client Component, no `"use server"`).
2. Form submits credentials via `POST /api/pixo/login`.
3. Route handler (`app/api/pixo/login/route.ts`) compares against env vars. On match, calls `generateToken()` from `lib/pixo-auth.ts`.
4. `generateToken()` — creates a `randomBytes(32)` token, signs it with HMAC-SHA256 using `(ADMIN_PASSWORD + ADMIN_USERNAME)` as the key, returns `{token}.{sig}`.
5. Sets `pixo_session` cookie: `httpOnly: true`, `secure: true` in production, `sameSite: strict`, `maxAge: 86400`.
6. Subsequent requests to `/pixo/(panel)/**` are protected by:
   - **Layout-level check** (`app/pixo/(panel)/layout.tsx`): reads `pixo_session` from `cookies()`, calls `verifyToken()` (timing-safe comparison), redirects to `/pixo` if invalid.
   - **API-level check** (all `/api/pixo/**` routes): calls `isValidAdminRequest(req)` which extracts the cookie from the raw `Cookie` header and runs `verifyToken()`.

The admin client uses `createAdminClient()` from `lib/supabase/admin.ts` which holds the **service role key** and bypasses all RLS.

---

## 6. Database Schema

### 6.1 Tables (production state — after all migrations)

| Table | Added in | Key columns |
|---|---|---|
| `profiles` | `schema.sql` + migrations | `id` (FK → auth.users), `full_name`, `bio`, `wilaya`, `location_city`, `location_country`, `role` (enum: buyer/seller/both), `avatar_url`, `cover_url`, `cover_position`, `rating`, `total_reviews`, `suspended`, `created_at` |
| `services` | `schema.sql` + `publishing-migration.sql` | `id`, `seller_id`, `title`, `description`, `category`, `price`, `delivery_days`, `images[]`, `gallery` (JSONB), `packages` (JSONB), `faq` (JSONB), `tags[]`, `is_active`, `avg_rating`, `reviews_count`, `orders_count`, `total_orders`, `video_url` |
| `digital_products` | `schema.sql` + `publishing-migration.sql` | `id`, `seller_id`, `title`, `description`, `category`, `price`, `is_free`, `format`, `file_format`, `preview_urls` (JSONB), `preview_images[]`, `license`, `tags[]`, `is_active`, `avg_rating`, `reviews_count`, `sales_count`, `downloads` |
| `orders` | `schema.sql` + `admin-migration.sql` | `id`, `buyer_id`, `seller_id`, `service_id`, `product_id`, `order_type` (enum), `status` (enum: pending/active/completed/cancelled), `total_price`, `payment_status` (enum) |
| `reviews` | `schema.sql` | `id`, `reviewer_id`, `reviewed_id`, `order_id`, `rating`, `comment` |
| `conversations` | `messaging-migration.sql` | `id`, `buyer_id`, `seller_id`, `listing_type` (service/product), `listing_id` (UUID, **polymorphic — no FK by design**), `last_message_at`, unique on (buyer_id, seller_id, listing_type, listing_id) |
| `messages` | `schema.sql` + `messaging-migration.sql` | `id`, `sender_id`, `receiver_id` (nullable post-migration), `conversation_id`, `content`, `read_at`, `is_read`, `order_id` |
| `reports` | `admin-migration.sql` | `id`, `reporter_id`, `target_type`, `target_id`, `reason`, `status` |
| `platform_settings` | `admin-migration.sql` | `key` (PK), `value` (JSONB), `updated_at` |

### 6.2 Enums

`user_role` (`buyer`, `seller`, `both`), `account_type` (`freelance`, `digital`, `both`), `order_type_enum` (`service`, `product`), `order_status` (`pending`, `active`, `completed`, `cancelled`), `payment_status` (`pending`, `paid`, `refunded`).

### 6.3 Triggers

| Trigger | Table | Effect |
|---|---|---|
| `profiles_updated_at` | `profiles` | Updates `updated_at` on every UPDATE |
| `on_auth_user_created` | `auth.users` | Calls `handle_new_user()` — auto-creates profile row |
| `on_review_change_update_profile` | `reviews` | Recomputes `profiles.rating` and `profiles.total_reviews` |
| `on_order_complete_update_stats` | `orders` | Increments `services.total_orders` or `digital_products.downloads` when order → `completed` |
| `trg_conv_last_message_at` | `messages` | Updates `conversations.last_message_at` on new message INSERT |

### 6.4 Row Level Security (RLS)

All 6 core tables have RLS enabled. Summary:

| Table | Read | Write |
|---|---|---|
| `profiles` | Public (any) | Own row only |
| `services` | Active ones public; own always | Own row, seller/both role required for INSERT |
| `digital_products` | Active ones public; own always | Own row, seller/both role required for INSERT |
| `orders` | Participants (buyer or seller) | Buyer can INSERT; both can UPDATE |
| `reviews` | Public | Own reviewer_id, order must be completed |
| `conversations` | Participants (buyer or seller) | Buyer can INSERT |
| `messages` | Sender, receiver, or conversation participant | Sender can INSERT; conversation participant can UPDATE (markRead) |

The admin client (`createAdminClient` with service role key) **bypasses all RLS** — all Pixo admin API routes use it.

### 6.5 Storage Buckets

| Bucket | Public | Size limit | Used for |
|---|---|---|---|
| `avatars` | Yes | 5 MB | Profile photos |
| `service-images` | Yes | 10 MB | Service listing images |
| `digital-products` | No | 500 MB | Digital product files (paid buyers only) |
| `documents` | No | 50 MB | KYC / upload documents |
| `services` | Yes | — | (legacy — cleanup pending) |
| `products-previews` | Yes | — | (legacy — cleanup pending) |
| `products-files` | No | — | (legacy — cleanup pending) |
| `covers` | Yes | 10 MB | Profile cover images |

---

## 7. Supabase Client Patterns

Three clients exist, each with a specific scope:

### 7.1 Browser Client — `lib/supabase/client.ts`

```ts
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
```

Used in: all `"use client"` components and pages. Uses the anon key. RLS enforced by the authenticated user's JWT.

### 7.2 Server Client — `lib/supabase/server.ts`

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(URL, ANON_KEY, { cookies: { getAll, setAll } })
}
```

Used in: Server Components, Route Handlers, middleware. Reads session from cookies. The `setAll` silently ignores errors when called from a Server Component (cannot set cookies there — by design).

### 7.3 Admin Client — `lib/supabase/admin.ts`

```ts
import { createClient } from '@supabase/supabase-js'
export function createAdminClient() {
  return createClient(URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
}
```

Used in: all `/api/pixo/**` route handlers. Uses the service role key. Bypasses all RLS. Never used client-side.

### 7.4 Realtime Subscriptions

Two components use Supabase Realtime:

- **`ThreadClient.tsx`** (`app/messages/[id]/ThreadClient.tsx`): subscribes to `postgres_changes` on the `messages` table filtered by `conversation_id`. Handles INSERT events to append new messages; auto-marks as read on receipt.
- **`UnreadBadge.tsx`** (`components/UnreadBadge.tsx`): subscribes to `postgres_changes` on `messages` (INSERT → increment, UPDATE → refetch count). Creates a channel named `unread-badge-{userId}`.

Both clean up their channels on unmount via the return of `useEffect`.

---

## 8. API Architecture

### 8.1 Route Handlers

All live under `app/api/`. There are no Next.js Server Actions.

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/conversations` | POST | Supabase user (server client) | Find or create a conversation for a buyer/seller/listing triple |
| `/api/geo` | GET | None | IP geolocation — tries Vercel headers first, falls back to `ipapi.co` |
| `/api/pixo/login` | POST | ADMIN_USERNAME/PASSWORD | Issues `pixo_session` HMAC cookie |
| `/api/pixo/logout` | POST | None | Clears `pixo_session` cookie |
| `/api/pixo/dashboard` | GET | pixo_session | Aggregate stats + registration chart (admin client) |
| `/api/pixo/users` | GET/PATCH | pixo_session | List users, suspend/unsuspend |
| `/api/pixo/users/[id]` | GET/PATCH/DELETE | pixo_session | User detail, edit, delete |
| `/api/pixo/services` | GET/PATCH | pixo_session | List services, approve/deactivate |
| `/api/pixo/services/[id]` | PATCH/DELETE | pixo_session | Edit/delete individual service |
| `/api/pixo/products` | GET/PATCH | pixo_session | List digital products |
| `/api/pixo/products/[id]` | PATCH/DELETE | pixo_session | Edit/delete individual product |
| `/api/pixo/orders` | GET | pixo_session | List orders |
| `/api/pixo/reviews` | GET | pixo_session | List reviews |
| `/api/pixo/reviews/[id]` | DELETE | pixo_session | Delete review |
| `/api/pixo/reports` | GET | pixo_session | List reports |
| `/api/pixo/reports/[id]` | PATCH | pixo_session | Update report status |
| `/api/pixo/settings` | GET/POST | pixo_session | Read/write `platform_settings` |

### 8.2 Auth on Route Handlers

- **User routes** (`/api/conversations`): uses server Supabase client → `supabase.auth.getUser()` → returns 401 if no session.
- **Admin routes** (`/api/pixo/**`): calls `isValidAdminRequest(req)` from `lib/pixo-auth.ts` which extracts `pixo_session` cookie from the raw `Cookie` header and verifies HMAC.

---

## 9. Routing & Middleware

### 9.1 Route Groups

- `app/pixo/(panel)/` — route group with its own `layout.tsx` that guards all admin sub-routes. Not a URL segment (`(panel)` does not appear in the URL).

### 9.2 Middleware matcher

```ts
matcher: [
  '/profile/:path*',
  '/dashboard/:path*',
  '/services/new',
  '/products/new',
  '/devenir-vendeur',
]
```

Notably absent from middleware protection:
- `/messages` — protected by client-side redirect in the page component
- `/messages/[id]` — protected by server-side redirect in the Server Component at the top of the page
- `/pixo/**` — protected by the route-group layout (not middleware)

### 9.3 Role-Based Routing

`app/dashboard/page.tsx` is a Server Component that:
1. Gets the user from Supabase.
2. Reads `profiles.role`.
3. `redirect('/dashboard/freelance')` for seller/both.
4. `redirect('/dashboard/client')` otherwise.

The individual dashboard pages (`freelance/page.tsx`, `client/page.tsx`) additionally check role on the client and cross-redirect if the user ends up on the wrong one.

---

## 10. State Management

There is **no global state management library** (no Redux, Zustand, Jotai, etc.).

State is entirely local to each page/component via React `useState` + `useEffect`. The only cross-component shared state is:

- **Supabase session**: read independently by each component via `supabase.auth.getUser()`. The Navbar subscribes to `onAuthStateChange` for reactivity.
- **Toast context**: scoped to the admin panel. `AdminShell.tsx` provides a `ToastContext` with a `useToast()` hook used by child admin pages.
- **Theme (dark mode)**: stored in `localStorage` and applied to `document.documentElement.classList` by the Navbar and a blocking inline script in `app/layout.tsx` (to prevent flash of wrong theme on load).
- **Wilaya geolocation**: cached in `localStorage` by `lib/geolocation.ts`; read by `freelances/page.tsx`.

---

## 11. Component Hierarchy

```
app/layout.tsx (Root Layout — Server)
├── [inline script: theme init from localStorage]
└── {children}
    │
    ├── app/page.tsx (Landing — Server Component)
    │   ├── Navbar (Client — fetches user + avatar from Supabase)
    │   ├── Hero (receives servicesCount + profilesCount as props)
    │   ├── Categories (static)
    │   ├── TopFreelancers (Client — fetches profiles)
    │   ├── Marketplace (Client — fetches digital products)
    │   ├── HowItWorks (static)
    │   ├── GetStarted (static)
    │   └── Footer
    │
    ├── app/freelances/page.tsx (Client Component)
    │   └── ServiceCard (per result)
    │
    ├── app/messages/[id]/page.tsx (Server Component — fetches initial messages)
    │   └── ThreadClient.tsx (Client Component — Realtime + send)
    │       └── ConversationsSidebar.tsx (Client Component — desktop sidebar)
    │
    ├── app/dashboard/freelance/page.tsx (Client Component)
    │   └── UnreadBadge (Client — Realtime unread count)
    │
    └── app/pixo/(panel)/layout.tsx (Server — guards admin)
        └── AdminShell.tsx (Client — sidebar, ToastContext)
            └── {admin page children}
```

---

## 12. Data Flow Patterns

### 12.1 Public Listings (e.g., `/freelances`)

```
Component mounts
  → useEffect fires
  → createClient() [browser]
  → supabase.from("services").select(...).eq("is_active", true)
  → data set in state
  → rankItems() applied client-side
  → user filters/sorts in state via useMemo
  → renders ServiceCard grid
```

All filtering and sorting is **client-side** after a single bulk fetch (`.limit(100)`). No pagination.

### 12.2 Service/Product Detail

```
useEffect → supabase queries for: service, reviews, related services
  → all via browser client (Client Component)
  → handleContact() → POST /api/conversations → creates conversation → router.push(/messages/{id})
```

### 12.3 Messaging Thread

```
Server Component (page.tsx):
  → createClient() [server]
  → auth check → access control (buyer or seller only)
  → fetch initial messages + interlocutor profile
  → pass as props to ThreadClient

ThreadClient (Client Component):
  → useState(initialMessages)
  → useEffect: markRead for received messages (fire-and-forget)
  → useEffect: subscribe to Realtime postgres_changes for new messages
  → sendMessage() → supabase.from("messages").insert()
```

### 12.4 Admin Panel

```
AdminShell (Client) renders admin page (Client)
Admin page useEffect:
  → fetch("/api/pixo/{resource}")
  → API route checks isValidAdminRequest()
  → uses createAdminClient() to query Supabase bypassing RLS
  → returns JSON
Admin page renders data
Mutations (PATCH/DELETE) → fetch() to same API routes
```

---

## 13. Feature Flags

`lib/features.ts`:
```ts
export const SHOW_ORDERS = false
```

When `false`, all order-related UI is hidden from both buyer and seller dashboards:
- "Commandes" nav items removed from sidebar
- Order stat cards replaced with messaging stats
- Order row tables replaced with conversation lists
- Relevant `type` definitions and comments preserved with `// SHOW_ORDERS:` annotations for future re-enable

The orders table, enums, and RLS policies **remain in the database**. The order flow is just not exposed in the UI. The admin panel still shows orders through `/api/pixo/orders`.

---

## 14. Environment Variables

Defined in `.env.local`:

| Variable | Exposure | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client (public) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client (public) | Supabase anon key — subject to RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Service role key — bypasses RLS; admin client only |
| `ADMIN_USERNAME` | Server-only | Pixo admin panel username |
| `ADMIN_PASSWORD` | Server-only | Pixo admin panel password |

The `SUPABASE_SERVICE_ROLE_KEY` is referenced only in `lib/supabase/admin.ts`, which imports `'server-only'` transitively (because it is always used in server-only contexts). However, the file itself does **not** import `server-only` directly — it relies on call sites being server-only. This is worth hardening.

---

## 15. External Services

| Service | Integration point | Notes |
|---|---|---|
| **Supabase** (auth + DB + storage + realtime) | `@supabase/ssr`, `@supabase/supabase-js` | Core backend |
| **Vercel** (hosting + geo headers) | `x-vercel-ip-city`, `x-vercel-ip-country` headers | `api/geo/route.ts` reads these in production |
| **ipapi.co** | `api/geo/route.ts` (fallback) | Used when Vercel geo headers absent (local dev) |
| **Google OAuth** | Supabase OAuth provider | `signInWithOAuth({ provider: 'google' })` |
| **Google Fonts** | `next/font/google` | Plus Jakarta Sans + Inter |
| **react-image-crop** | `app/profile/page.tsx` | Avatar crop UI |

---

## 16. Schema Drift Warning

The `supabase/schema.sql` file does **not** reflect the current production schema. It is the original v1 schema. The actual production schema is the result of applying all 4 SQL files in sequence:

1. `schema.sql`
2. `admin-migration.sql`
3. `publishing-migration.sql`
4. `fix-lot1.sql`
5. `messaging-migration.sql`
6. `location-migration.sql`

Additionally, the `lib/types/db.ts` `Review` type has `reviewed_id` but the service detail page (`app/services/[id]/page.tsx:109`) queries `reviews` with `.eq("service_id", id)`, implying a `service_id` column on `reviews` that does not exist in any tracked migration. This query likely returns empty results silently — the reviews displayed on the service detail page may not be working correctly.

---

## 17. Key Observations for Later Audit Phases

1. **No TypeScript paths aliasing issues** — `@/` alias is configured in `tsconfig.json` and used consistently.
2. **No pagination** — listing pages (`/freelances`, `/marketplace`) fetch `.limit(100)` and filter client-side. This will not scale.
3. **No optimistic updates** — all mutations wait for server confirmation before reflecting in UI.
4. **No error boundaries** — React errors in Client Components will cause white screens; there are no `error.tsx` files.
5. **No loading.tsx files** — Next.js suspense-based loading states are not used; each page manages its own loading state manually.
6. **Images use plain `<img>` tags** — none use `next/image`. This means no automatic optimization, lazy loading, or responsive images.
7. **Inline SVG everywhere** — all icons are inline SVG path strings hardcoded directly in JSX. No icon library.
8. **Admin panel uses inline styles** — `AdminShell.tsx` and admin pages use `style={{}}` props throughout rather than Tailwind, a design inconsistency from the rest of the app.
9. **No test files** — zero unit, integration, or E2E tests in the repository.
10. **`SHOW_ORDERS = false`** means the payment/checkout flow has never been live and may have untested DB interactions (order status triggers, payment_status policies, digital product download access).
