"use client"

import { useForm } from "@tanstack/react-form"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  createJobSchema,
  updateJobSchema,
  type CreateJobInput,
  type JobStatus,
} from "@/lib/schema/schema"
import { toast } from "sonner"

type Props = {
  job: {
    id: number
    title: string
    jobDescription: string
    jobType: string
    location: string
    salary: number
    jobTime: string
    jobStatus?: string
  }
}

export default function EditJobs({ job }: Props) {
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      title: job.title,
      jobDescription: job.jobDescription,
      jobType: job.jobType,
      location: job.location,
      salary: job.salary,
      jobTime: job.jobTime,
      jobStatus: (job.jobStatus as JobStatus) || "published",
    },

    validators: {
      onSubmit: ({ value }) => {
        const parsed = updateJobSchema.safeParse(value)
        return parsed.success ? undefined : "Validation failed"
      },
    },

    onSubmit: async ({ value }) => {
      const parsed = updateJobSchema.safeParse(value)
      if (!parsed.success) return

      try {
        const response = await fetch(`/api/jobs/${job.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        })
        const data = await response.json()
        if (!response.ok) {
          toast.error(data?.error || "Failed to update job")
          return
        }
        toast.success("Job updated successfully!")
        router.push("/dashboard/job-postings")
        router.refresh()
      } catch (error) {
        console.error("Error updating job:", error)
        toast.error("Failed to update job")
      }
    },
  })

  return (
    <div className="max-w-2xl space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        <form.Field
          name="title"
          validators={{
            onChange: ({ value }) => {
              const r = createJobSchema.shape.title.safeParse(value)
              return r.success ? undefined : r.error.issues[0]?.message
            },
          }}
        >
          {(field) => (
            <div className="space-y-1">
              <div className="text-sm font-medium">Job Title</div>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Enter job title"
              />
              {field.state.meta.errors.length > 0 ? (
                <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="jobDescription"
          validators={{
            onChange: ({ value }) => {
              const r = createJobSchema.shape.jobDescription.safeParse(value)
              return r.success ? undefined : r.error.issues[0]?.message
            },
          }}
        >
          {(field) => (
            <div className="space-y-1">
              <div className="text-sm font-medium">Description</div>
              <Textarea
                rows={6}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Enter job description"
              />
              {field.state.meta.errors.length > 0 ? (
                <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="location"
          validators={{
            onChange: ({ value }) => {
              const r = createJobSchema.shape.location.safeParse(value)
              return r.success ? undefined : r.error.issues[0]?.message
            },
          }}
        >
          {(field) => (
            <div className="space-y-1">
              <div className="text-sm font-medium">Location</div>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Enter location"
              />
              {field.state.meta.errors.length > 0 ? (
                <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="salary"
          validators={{
            onChange: ({ value }) => {
              const r = createJobSchema.shape.salary.safeParse(value)
              return r.success ? undefined : r.error.issues[0]?.message
            },
          }}
        >
          {(field) => (
            <div className="space-y-1">
              <div className="text-sm font-medium">Salary</div>
              <Input
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                onBlur={field.handleBlur}
                placeholder="Enter salary"
              />
              {field.state.meta.errors.length > 0 ? (
                <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="jobTime"
          validators={{
            onChange: ({ value }) => {
              const r = createJobSchema.shape.jobTime.safeParse(value)
              return r.success ? undefined : r.error.issues[0]?.message
            },
          }}
        >
          {(field) => (
            <div className="space-y-1">
              <div className="text-sm font-medium">Working Hours</div>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Enter working hours"
              />
              {field.state.meta.errors.length > 0 ? (
                <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field name="jobType">
          {(field) => (
            <div className="space-y-1">
              <div className="text-sm font-medium">Job Type</div>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value as CreateJobInput["jobType"])
                }
                onBlur={field.handleBlur}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          )}
        </form.Field>

        <form.Field name="jobStatus">
          {(field) => (
            <div className="space-y-1">
              <div className="text-sm font-medium">Status</div>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value as JobStatus)
                }
                onBlur={field.handleBlur}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  )
}
