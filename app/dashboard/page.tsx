import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import SectionCard from "@/components/dashboard/sectionCard"
import { getJobs } from "@/lib/jobs"
import { prisma } from "@/lib/prisma"
import type { Jobs } from "@/components/jobs/columns"

const LIST_LIMIT = 5

async function getData(): Promise<Jobs[]> {
  try {
    const jobs = await getJobs()
    return jobs as unknown as Jobs[]
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return []
  }
}

export default async function Page() {
  const [jobs, albums, images] = await Promise.all([
    getData(),
    prisma.album.findMany({
      take: LIST_LIMIT,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { images: true } } },
    }),
    prisma.image.findMany({
      take: LIST_LIMIT,
      orderBy: { createdAt: "desc" },
    }),
  ])

  return (
    <div className="flex flex-1 flex-col ">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <div>
            <SectionCard
              jobs={jobs.map((j) => ({ id: j.id, title: j.title }))}
              albums={albums}
              images={images.map((img) => ({ id: img.id, filename: img.filename }))}
              listLimit={LIST_LIMIT}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
