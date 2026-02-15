"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconLoader, IconPlus } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createAdminSchema } from "@/lib/schema/schema"
import { toast } from "sonner"

type AdminUser = {
  id: string
  email: string
  active: boolean
  createdAt: string
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createEmail, setCreateEmail] = useState("")
  const [createPassword, setCreatePassword] = useState("")
  const [createConfirmPassword, setCreateConfirmPassword] = useState("")
  const [createError, setCreateError] = useState("")
  const [creating, setCreating] = useState(false)

  async function fetchAdmins() {
    try {
      const res = await fetch("/api/admins")
      if (res.ok) {
        const data = await res.json()
        setAdmins(data)
      }
    } catch {
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  async function handleToggleActive(user: AdminUser) {
    setTogglingId(user.id)
    try {
      const res = await fetch(`/api/admins/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      })
      if (res.ok) {
        setAdmins((prev) =>
          prev.map((a) =>
            a.id === user.id ? { ...a, active: !a.active } : a
          )
        )
      }
    } finally {
      setTogglingId(null)
    }
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault()
    setCreateError("")
    const parsed = createAdminSchema.safeParse({
      email: createEmail,
      password: createPassword,
      confirmPassword: createConfirmPassword,
    })
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      setCreateError(first?.message ?? "Validation failed")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data?.error ?? "Failed to create admin")
        return
      }
      toast.success("Admin created successfully")
      setDialogOpen(false)
      setCreateEmail("")
      setCreatePassword("")
      setCreateConfirmPassword("")
      fetchAdmins()
    } catch {
      setCreateError("An error occurred. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <IconLoader className="size-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading admins...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Admins</h1>
              <p className="text-muted-foreground">
                Manage admin users and their active status.
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shrink-0">
                  <IconPlus className="mr-2 size-4" />
                  Add admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add new admin</DialogTitle>
                  <DialogDescription>
                    Create a new admin account. They will be able to log in with
                    the credentials you provide.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-email">Email</Label>
                    <Input
                      id="create-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-password">Password</Label>
                    <Input
                      id="create-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-confirm">Confirm password</Label>
                    <Input
                      id="create-confirm"
                      type="password"
                      placeholder="Confirm password"
                      value={createConfirmPassword}
                      onChange={(e) => setCreateConfirmPassword(e.target.value)}
                    />
                  </div>
                  {createError && (
                    <p className="text-sm text-destructive">{createError}</p>
                  )}
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating}>
                      {creating ? "Creating..." : "Create admin"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground text-center">
                      No admins found.
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.email}</TableCell>
                      <TableCell>
                        <Badge variant={admin.active ? "default" : "secondary"}>
                          {admin.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={togglingId === admin.id}
                          onClick={() => handleToggleActive(admin)}
                        >
                          {togglingId === admin.id
                            ? "Updating..."
                            : admin.active
                              ? "Set inactive"
                              : "Set active"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
