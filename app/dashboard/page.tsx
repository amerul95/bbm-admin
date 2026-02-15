import { headers } from "next/headers"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import SectionCard from "@/components/dashboard/sectionCard"
import { getBaseUrl } from "@/lib/api"
import type { Jobs } from "@/components/jobs/columns"

const LIST_LIMIT = 5

async function fetchDashboardData() {
  const headersList = await headers()
  const cookie = headersList.get("cookie") ?? ""
  const baseUrl = getBaseUrl()

  const [jobsRes, albumsRes, imagesRes] = await Promise.all([
    fetch(`${baseUrl}/api/jobs?limit=${LIST_LIMIT}`, { headers: { cookie } }),
    fetch(`${baseUrl}/api/albums?limit=${LIST_LIMIT}&summary=true`, {
      headers: { cookie },
    }),
    fetch(`${baseUrl}/api/gallery?limit=${LIST_LIMIT}`, { headers: { cookie } }),
  ])

  const jobs: Jobs[] = jobsRes.ok ? await jobsRes.json() : []
  const albums = albumsRes.ok
    ? await albumsRes.json()
    : []
  const images = imagesRes.ok
    ? await imagesRes.json()
    : []

  return { jobs, albums, images }
}

export default async function Page() {
  const { jobs, albums, images } = await fetchDashboardData()

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
              images={images.map((img: { id: string; filename: string }) => ({
                id: img.id,
                filename: img.filename,
              }))}
              listLimit={LIST_LIMIT}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
