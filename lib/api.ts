/**
 * Base URL for server-side API calls.
 * Required because fetch() in Server Components needs absolute URLs.
 */
export function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (process.env.AUTH_URL) return process.env.AUTH_URL
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  return "http://localhost:3000"
}
