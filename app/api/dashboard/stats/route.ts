import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalJobs, publishedJobs, draftJobs, closedJobs] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({
        where: { jobStatus: { in: ["Open", "open", "published"] } },
      }),
      prisma.job.count({ where: { jobStatus: "Draft" } }),
      prisma.job.count({ where: { jobStatus: { in: ["closed", "Closed"] } } }),
    ]);

    return NextResponse.json({
      totalJobs,
      publishedJobs,
      draftJobs,
      closedJobs,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
