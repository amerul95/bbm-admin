import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { z } from "zod"

const createAlbumSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const albums = await prisma.album.findMany({
      include: { images: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(albums, { status: 200 })
  } catch (error) {
    console.error("Error fetching albums:", error)
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
    console.error("Error creating album:", error)
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 }
    )
  }
}
