import { z } from "zod"

// Auth / settings schemas
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
  })

export const createAdminSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password do not match",
    path: ["confirmPassword"],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type CreateAdminInput = z.infer<typeof createAdminSchema>

export const jobStatusEnum = z.enum(["published", "draft", "closed"])
export type JobStatus = z.infer<typeof jobStatusEnum>

export const createJobSchema = z.object({
  title: z.string().min(3),
  jobDescription: z.string().min(1),
  jobType: z.enum(["Full-time", "Part-time", "Contract"]),
  location: z.string().min(1),
  salary: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  jobTime: z.string().min(1),
  jobStatus: jobStatusEnum.optional().default("published"),
})

export const updateJobSchema = createJobSchema.partial()

export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>