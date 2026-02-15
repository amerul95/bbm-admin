import React from "react"
import Link from "next/link"
import { IconBriefcase, IconFolder, IconPhoto } from "@tabler/icons-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type SectionCardJob = { id: number; title: string }
export type SectionCardAlbum = { id: string; name: string; _count: { images: number } }
export type SectionCardImage = { id: string; filename: string }

export type SectionCardProps = {
  jobs: SectionCardJob[]
  albums: SectionCardAlbum[]
  images: SectionCardImage[]
  listLimit?: number
}

const DEFAULT_LIST_LIMIT = 5

export default function SectionCard({
  jobs,
  albums,
  images,
  listLimit = DEFAULT_LIST_LIMIT,
}: SectionCardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 p-5 @xl/main:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Job listing</CardTitle>
          <IconBriefcase className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-2">
            Latest {listLimit} jobs
          </CardDescription>
          <ul className="space-y-1.5 text-sm">
            {jobs.length === 0 ? (
              <li className="text-muted-foreground">No jobs yet</li>
            ) : (
              jobs.slice(0, listLimit).map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/dashboard/job-postings/${job.id}`}
                    className="hover:underline line-clamp-1"
                  >
                    {job.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
          <Link
            href="/dashboard/job-postings"
            className="text-muted-foreground mt-2 inline-block text-xs hover:underline"
          >
            View all jobs →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Album</CardTitle>
          <IconFolder className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-2">
            Latest {listLimit} albums
          </CardDescription>
          <ul className="space-y-1.5 text-sm">
            {albums.length === 0 ? (
              <li className="text-muted-foreground">No albums yet</li>
            ) : (
              albums.map((album) => (
                <li key={album.id}>
                  <span className="line-clamp-1" title={album.name}>
                    {album.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {" "}({album._count.images} images)
                  </span>
                </li>
              ))
            )}
          </ul>
          <Link
            href="/dashboard/gallery"
            className="text-muted-foreground mt-2 inline-block text-xs hover:underline"
          >
            View all albums →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Image</CardTitle>
          <IconPhoto className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-2">
            Latest {listLimit} images
          </CardDescription>
          <ul className="space-y-1.5 text-sm">
            {images.length === 0 ? (
              <li className="text-muted-foreground">No images yet</li>
            ) : (
              images.map((img) => (
                <li
                  key={img.id}
                  className="line-clamp-1 truncate"
                  title={img.filename}
                >
                  {img.filename}
                </li>
              ))
            )}
          </ul>
          <Link
            href="/dashboard/gallery"
            className="text-muted-foreground mt-2 inline-block text-xs hover:underline"
          >
            View all images →
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
