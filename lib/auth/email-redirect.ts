/** Email links may redirect only to authentication destinations on this site. */
export function emailRedirect(raw: string | null, origin: string, recovery: boolean) {
  const fallback = recovery ? '/reset-password' : '/dashboard'
  if (!raw) return fallback
  try {
    const url = new URL(raw, origin)
    if (url.origin !== origin || url.username || url.password) return fallback
    if (!/^\/(?:(?:fr|en|ar)\/)?(?:reset-password|dashboard(?:\/[^?#]*)?)$/.test(url.pathname)) return fallback
    return url.pathname
  } catch {
    return fallback
  }
}
