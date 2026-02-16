import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Math.min(90, Math.max(1, parseInt(searchParams.get("days") ?? "30", 10)))
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)

    const jobs = await prisma.job.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true },
    })

    const countByDate: Record<string, number> = {}
    for (const j of jobs) {
      const d = j.createdAt.toISOString().slice(0, 10)
      countByDate[d] = (countByDate[d] ?? 0) + 1
    }

    const data = Object.entries(countByDate).map(([date, count]) => ({
      date,
      jobs: count,
    }))
    data.sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch jobs by date" },
      { status: 500 }
    )
  }
}
