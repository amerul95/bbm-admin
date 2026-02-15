import { prisma } from "@/lib/prisma"

export async function getJobs() {
 const jobs = await prisma.job.findMany({
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  })
  return jobs;

}

export async function getJobById(id: number) {
  return prisma.job.findUnique({
    where: { id },
    include: { _count: { select: { applications: true } } },
  })
}
