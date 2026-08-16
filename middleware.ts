import createIntlMiddleware from "next-intl/middleware"
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { routing } from "./i18n/routing"

const handleIntl = createIntlMiddleware(routing)

const PROTECTED_PATHS = [
  "/profile",
  "/dashboard",
  "/services/new",
  "/products/new",
  "/devenir-vendeur",
]

function stripLocalePrefix(pathname: string): string {
  return pathname.replace(/^\/(en|ar)(\/|$)/, "/").replace(/^$/, "/") || "/"
}

function localeFromPathname(pathname: string): string {
  if (pathname.startsWith("/en")) return "en"
  if (pathname.startsWith("/ar")) return "ar"
  return "fr"
}

export async function middleware(request: NextRequest) {
  // 1. Supabase session refresh
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 2. Auth guard on protected paths (locale-agnostic matching)
  const pathname = request.nextUrl.pathname
  const pathWithoutLocale = stripLocalePrefix(pathname)
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + "/")
  )

  if (!user && isProtected) {
    const locale = localeFromPathname(pathname)
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = locale === "fr" ? "/login" : `/${locale}/login`
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 3. next-intl locale routing
  const intlResponse = handleIntl(request)

  // Merge Supabase session cookies into the intl response
  supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
    intlResponse.cookies.set(name, value)
  })

  return intlResponse
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
