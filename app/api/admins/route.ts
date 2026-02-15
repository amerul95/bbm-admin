import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createAdminSchema } from "@/lib/schema/schema"
import bcrypt from "bcrypt"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createAdminSchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return NextResponse.json(
        { error: first?.message ?? "Validation failed" },
        { status: 400 }
      )
    }
    const { email, password } = parsed.data

    const existing = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (existing) {
      return NextResponse.json(
        { error: "An admin with this email already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const now = new Date()
    const admin = await prisma.admin.create({
      data: {
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        password: hashedPassword,
        updatedAt: now,
      },
      select: {
        id: true,
        email: true,
        active: true,
        createdAt: true,
      },
    })

    return NextResponse.json(admin, { status: 201 })
  } catch (error) {
    console.error("Create admin error:", error)
    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        active: true,
        createdAt: true,
      },
    })

    return NextResponse.json(admins)
  } catch (error) {
    console.error("List admins error:", error)
    return NextResponse.json(
      { error: "Failed to list admins" },
      { status: 500 }
    )
  }
}
