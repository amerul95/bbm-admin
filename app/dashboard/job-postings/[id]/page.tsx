import EditJobs from "@/components/jobs/editJobs"
import { getJobById } from "@/lib/jobs"

export default async function PageByid({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: jobId } = await params
  const id = parseInt(jobId, 10)
  if (isNaN(id)) {
    return <div>Invalid job ID</div>
  }

  const job = await getJobById(id)
  if (!job) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Job not found</p>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center mt-20 px-4">
      <EditJobs job={job} />
    </div>
  )
}
