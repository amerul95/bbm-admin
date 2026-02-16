import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Parse and normalize connection string
let connectionString = process.env.DATABASE_URL

// Debug: Log the connection string (hide password in production)
if (process.env.NODE_ENV !== "production") {
  const maskedUrl = connectionString.replace(/:[^:@]+@/, ":****@")
  console.log("🔌 Using DATABASE_URL:", maskedUrl)
}

// Fix double question marks (should use & for additional params)
if (connectionString.includes("??")) {
  connectionString = connectionString.replace("??", "?")
}
if (connectionString.match(/\?[^&]*\?/)) {
  connectionString = connectionString.replace(/\?([^&]*)\?/, "?$1&")
}

// Ensure SSL mode is set
// For Supabase pooler, use libpq compat mode to avoid warnings
// For direct connections, 'verify-full' is more secure
if (!connectionString.includes("sslmode=")) {
  connectionString += connectionString.includes("?") ? "&" : "?"
  // Default to require with libpq compat for pooler connections
  if (connectionString.includes("pooler.supabase.com") || connectionString.includes("pgbouncer=true")) {
    if (!connectionString.includes("uselibpqcompat=")) {
      connectionString += "uselibpqcompat=true&"
    }
    connectionString += "sslmode=require"
  } else {
    connectionString += "sslmode=verify-full"
  }
} else if ((connectionString.includes("pooler.supabase.com") || connectionString.includes("pgbouncer=true")) && !connectionString.includes("uselibpqcompat=")) {
  // Add libpq compat flag if using pooler but not already set
  connectionString = connectionString.replace("sslmode=", "uselibpqcompat=true&sslmode=")
}

// Debug: Show what connection string will be used
if (process.env.NODE_ENV !== "production") {
  const maskedUrl = connectionString.replace(/:[^:@]+@/, ":****@")
  console.log("🔌 Final connection string:", maskedUrl)
  console.log("🔌 Host:", connectionString.match(/@([^:/]+)/)?.[1] || "unknown")
}

const adapter = new PrismaPg({
  connectionString: connectionString,
})

// Clear cached Prisma client if DATABASE_URL changed (for development)
if (process.env.NODE_ENV !== "production" && globalForPrisma.prisma) {
  // Force recreate if connection string changed
  const cachedUrl = (globalForPrisma.prisma as any).__internal?.connectionString
  if (cachedUrl && cachedUrl !== connectionString) {
    console.log("🔄 DATABASE_URL changed, clearing cached Prisma client")
    delete globalForPrisma.prisma
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma