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
    const albumId = searchParams.get("albumId")
    const limit = searchParams.get("limit")
    const take = limit ? Math.min(parseInt(limit, 10) || 100, 100) : undefined

    if (albumId) {
      const images = await prisma.image.findMany({
        where: { albumId },
        take,
        orderBy: { createdAt: "desc" },
      })
      return NextResponse.json(images)
    }

    const images = await prisma.image.findMany({
      take,
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(images)
  } catch (error) {
    console.error("Error fetching gallery:", error)
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    )
  }
}
