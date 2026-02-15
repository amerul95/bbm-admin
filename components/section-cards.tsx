"use client"

import { IconBriefcase, IconFileText, IconFilePencil, IconLock } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect, useState } from "react"

type DashboardStats = {
  totalJobs: number
  publishedJobs: number
  draftJobs: number
  closedJobs: number
}

export function SectionCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        } else {
          setStats({
            totalJobs: 0,
            publishedJobs: 0,
            draftJobs: 0,
            closedJobs: 0,
          })
        }
      } catch {
        setStats({
          totalJobs: 0,
          publishedJobs: 0,
          draftJobs: 0,
          closedJobs: 0,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-8 w-16 rounded bg-muted mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Jobs Posted</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.publishedJobs ?? 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconBriefcase className="size-4" />
              Published
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active published jobs <IconFileText className="size-4" />
          </div>
          <div className="text-muted-foreground">Visible on website</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Jobs in Draft</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.draftJobs ?? 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconFilePencil className="size-4" />
              Draft
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Unpublished draft jobs <IconFilePencil className="size-4" />
          </div>
          <div className="text-muted-foreground">Not yet visible</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Jobs Closed</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.closedJobs ?? 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconLock className="size-4" />
              Closed
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Closed job postings <IconLock className="size-4" />
          </div>
          <div className="text-muted-foreground">No longer accepting applications</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Jobs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.totalJobs ?? 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconBriefcase className="size-4" />
              All Jobs
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total job postings <IconBriefcase className="size-4" />
          </div>
          <div className="text-muted-foreground">Including published and draft</div>
        </CardFooter>
      </Card>
    </div>
  )
}
