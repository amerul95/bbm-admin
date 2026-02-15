"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Jobs = {
  id: number
  no?: number
  title: string
  jobDescription: string
  jobType: "Full-time" | "Part-time" | "Contract"
  location: string
  salary: number
  postedDate: string
  jobStatus: "published" | "closed" | "draft"
  jobTime: string
  active: boolean
  _count?: { applications: number }
}
function dateFormat(dateString:string){
  return new Intl.DateTimeFormat("en-CA", {
    timeZone:"Asia/Kuala_Lumpur",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString))
}

async function DeleteJob(id: number, router: ReturnType<typeof useRouter>) {
  try {
    const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete job")
    toast.success("Job deleted successfully")
    router.refresh()
  } catch {
    toast.error("Error deleting job")
  }
}
export const columns: ColumnDef<Jobs>[] = [
  {
    accessorKey: "no",
    header: "No",
    cell: ({ row,table }) => {
      const pageIndex = table.getState().pagination.pageIndex
      const pageSize = table.getState().pagination.pageSize
      return (pageIndex * pageSize) + row.index + 1
    }
  },
  {
    accessorKey: "title",
    header: "Job Title",
  },
  {
    accessorKey: "jobType",
    header: "Type",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "salary",
    header: "Salary (RM)",
    cell: ({ row }) => {
      const amount = row.getValue<number>("salary")
      return `RM ${amount.toLocaleString()}`
    },
  },
  {
    accessorKey: "postedDate",
    header: "Posted Date",
    cell:({row}) => {
      return dateFormat(row.getValue<string>("postedDate"))
    }
  },
  {
    accessorKey: "jobStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<string>("jobStatus")
      const variant =
        status === "published"
          ? "default"
          : status === "draft"
            ? "secondary"
            : "outline"
      return (
        <Badge variant={variant} className="capitalize">
          {status ?? "published"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "jobTime",
    header: "Working Hours",
  },
  {
    accessorKey: "active",
    header: "Active",
    cell: ({ row }) => {
      const isActive = row.getValue<boolean>("active")
      return isActive ? "Yes" : "No"
    },
  },
  {
    id:"actions",
    cell:({row}) => {
      const router = useRouter()
      const job = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(job.id.toString())}
            >
              Copy Job Id
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem><Link href={`/dashboard/job-postings/${job.id}`}>View Job</Link></DropdownMenuItem>
            <DropdownMenuItem onClick={() => DeleteJob(job.id,router)}>Delete Job</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]