import { prisma } from "@/lib/prisma"
import { NextResponse, NextRequest } from "next/server"
import { createJobSchema } from "@/lib/schema/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = searchParams.get("limit")
    const take = limit ? Math.min(parseInt(limit, 10) || 100, 100) : undefined

    const jobs = await prisma.job.findMany({
      take,
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(jobs, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
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
    const validated = createJobSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error },
        { status: 400 }
      )
    }

    const newJob = await prisma.job.create({
      data: {
        title: validated.data.title,
        jobDescription: validated.data.jobDescription,
        jobType: validated.data.jobType,
        location: validated.data.location,
        salary: validated.data.salary,
        jobTime: validated.data.jobTime,
        jobStatus: validated.data.jobStatus ?? "published",
      },
    })
    return NextResponse.json(newJob, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    )
  }
}