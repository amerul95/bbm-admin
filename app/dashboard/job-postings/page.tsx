import { columns, type Jobs } from "@/components/jobs/columns"
import { DataTables } from "@/components/jobs/data-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getJobs } from "@/lib/jobs"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { IconBriefcase, IconFolder, IconPhoto } from "@tabler/icons-react"

const LIST_LIMIT = 5

export default async function Page() {
  const [allJobs, albums, images] = await Promise.all([
    getJobs().then((j) => j as unknown as Jobs[]),
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
  const jobs = allJobs.slice(0, LIST_LIMIT)

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div>
            <Link href="/dashboard/job-postings/add">
              <Button variant="default" className="ml-auto hover:cursor-pointer">
                Add Job
              </Button>
            </Link>
          </div>



          <div className="min-h-[400px] overflow-hidden rounded-md border">
            <DataTables columns={columns} data={allJobs} />
          </div>
        </div>
      </div>
    </div>
  )
}
