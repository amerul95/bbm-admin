"use client"

import { useState } from "react"
import { toast } from "sonner"
import { changePasswordSchema, createAdminSchema } from "@/lib/schema/schema"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [changeLoading, setChangeLoading] = useState(false)

  const [newEmail, setNewEmail] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [newAdminConfirmPassword, setNewAdminConfirmPassword] = useState("")
  const [createLoading, setCreateLoading] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword: confirmNewPassword,
    })
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      toast.error(first?.message ?? "Validation failed")
      return
    }
    setChangeLoading(true)
    try {
      const res = await fetch("/api/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Failed to change password")
        return
      }
      toast.success("Password updated successfully.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setChangeLoading(false)
    }
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault()
    const parsed = createAdminSchema.safeParse({
      email: newEmail,
      password: newAdminPassword,
      confirmPassword: newAdminConfirmPassword,
    })
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      toast.error(first?.message ?? "Validation failed")
      return
    }
    setCreateLoading(true)
    try {
      const res = await fetch("/api/settings/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Failed to create admin")
        return
      }
      toast.success("New admin created successfully.")
      setNewEmail("")
      setNewAdminPassword("")
      setNewAdminConfirmPassword("")
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col items-center gap-2">
        <div className="flex w-full max-w-2xl flex-col gap-6 p-4 md:gap-8 md:p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Change your password or create a new admin account.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>
                Update your current admin password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="current-password">Current password</FieldLabel>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      disabled={changeLoading}
                      autoComplete="current-password"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="new-password">New password</FieldLabel>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={changeLoading}
                      autoComplete="new-password"
                      minLength={6}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-new-password">Confirm new password</FieldLabel>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      disabled={changeLoading}
                      autoComplete="new-password"
                      minLength={6}
                    />
                  </Field>
                  <Button type="submit" disabled={changeLoading}>
                    {changeLoading ? "Updating..." : "Update password"}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create new admin</CardTitle>
              <CardDescription>
                Add another admin with email and password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAdmin}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="new-admin-email">Email</FieldLabel>
                    <Input
                      id="new-admin-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      disabled={createLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="new-admin-password">Password</FieldLabel>
                    <Input
                      id="new-admin-password"
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      required
                      disabled={createLoading}
                      minLength={6}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="new-admin-confirm">Confirm password</FieldLabel>
                    <Input
                      id="new-admin-confirm"
                      type="password"
                      value={newAdminConfirmPassword}
                      onChange={(e) => setNewAdminConfirmPassword(e.target.value)}
                      required
                      disabled={createLoading}
                      minLength={6}
                    />
                  </Field>
                  <Button type="submit" disabled={createLoading}>
                    {createLoading ? "Creating..." : "Create admin"}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
