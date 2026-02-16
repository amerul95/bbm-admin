"use client"

import { useForm } from "@tanstack/react-form"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createJobSchema,
  type CreateJobInput,
  type JobStatus,
} from "@/lib/schema/schema"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

const timeOptions = (stepMinutes = 30): string[] => {
  const times: string[] = []
  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    times.push(
      `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
    )
  }
  return times
}

function JobTimeSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select working hours" />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {timeOptions().map((time) => (
          <SelectItem key={time} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function AddJobs() {
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      title: "",
      jobDescription: "",
      jobType: "Full-time" as CreateJobInput["jobType"],
      location: "",
      salary: 0,
      jobTime: "",
      jobStatus: "published" as JobStatus,
    },
        
        validators: {
          onSubmit: ({ value }) => {
            const parsed = createJobSchema.safeParse(value)
            return parsed.success ? undefined : "Validation failed"
          },
        },
    
        onSubmit: async ({ value }) => {
          const parsed = createJobSchema.safeParse(value)
          if (!parsed.success) return

          try {
            const response = await fetch("/api/jobs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(parsed.data),
            })
            const data = await response.json()
            if (!response.ok) {
              toast.error(data?.error || "Failed to create job")
              return
            }
            toast.success("Job created successfully!")
            router.push("/dashboard/job-postings")
            router.refresh()
          } catch (error) {
            toast.error("An error occurred while creating the job")
          }
        },
      })
  return (
    <Card className="max-w-2xl space-y-4 p-6">
    <div className="space-y-4">
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
              const v = typeof value === "string" ? Number(value) : value
              const r = createJobSchema.shape.salary.safeParse(v)
              return r.success ? undefined : "Salary must be a number"
            },
          }}
        >
          {(field) => (
            <div className="space-y-1">
              <div className="text-sm font-medium">Salary (RM)</div>
              <Input
                type="number"
                min={0}
                value={field.state.value === 0 ? "" : field.state.value}
                onChange={(e) => {
                  const val = e.target.value
                  field.handleChange(val === "" ? 0 : Number(val))
                }}
                onBlur={field.handleBlur}
                placeholder="Enter salary in RM"
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
              <JobTimeSelect
                value={field.state.value}
                onChange={(val) => field.handleChange(val)}
              />
              {field.state.meta.errors.length > 0 ? (
                <p className="text-sm text-red-600">
                  {field.state.meta.errors[0]}
                </p>
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
              </select>
              <p className="text-xs text-muted-foreground">
                Draft jobs are not visible on the website
              </p>
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
    </Card>
  )
}
