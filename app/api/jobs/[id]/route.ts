import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateJobSchema } from "@/lib/schema/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

function parseId(idParam: string) {
  const id = Number(idParam)
  return Number.isInteger(id) ? id : null
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const idGet = parseId(id)
    if (idGet === null) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const job = await prisma.job.findUnique({
      where: { id: idGet },
      include: { _count: { select: { applications: true } } },
    })
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }
    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const bodyValidated = updateJobSchema.safeParse(body)
    if (!bodyValidated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: bodyValidated.error },
        { status: 400 }
      )
    }

    const { id } = await params
    const parsed = Number(id)
    if (!Number.isInteger(parsed)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const job = await prisma.job.update({
      where: { id: parsed },
      data: bodyValidated.data,
    })
    return NextResponse.json(job, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const parsed = Number(id)
    if (!Number.isInteger(parsed)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    await prisma.job.delete({ where: { id: parsed } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    )
  }
}
