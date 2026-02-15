import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const body = await req.json()
    const active = body.active
    if (typeof active !== "boolean") {
      return NextResponse.json(
        { error: "active must be a boolean" },
        { status: 400 }
      )
    }

    const admin = await prisma.admin.update({
      where: { id },
      data: { active, updatedAt: new Date() },
      select: { id: true, email: true, active: true },
    })

    return NextResponse.json(admin)
  } catch (error) {
    console.error("Update admin status error:", error)
    return NextResponse.json(
      { error: "Failed to update admin status" },
      { status: 500 }
    )
  }
}
