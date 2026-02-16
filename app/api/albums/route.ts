import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { z } from "zod"

const createAlbumSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")
    const take = limit ? Math.min(parseInt(limit, 10) || 100, 100) : undefined
    const summary = searchParams.get("summary") === "true"

    const albums = await prisma.album.findMany({
      take,
      include: summary
        ? { _count: { select: { images: true } } }
        : { images: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(albums, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = createAlbumSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error },
        { status: 400 }
      )
    }

    const album = await prisma.album.create({
      data: validated.data,
    })
    return NextResponse.json(album, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 }
    )
  }
}
