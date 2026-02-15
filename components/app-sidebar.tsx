"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  IconCamera,
  IconDashboard,
  IconListDetails,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  { title: "Job Postings", url: "/dashboard/job-postings", icon: IconListDetails },
  { title: "Gallery & Albums", url: "/dashboard/gallery", icon: IconCamera },
  { title: "Admins", url: "/dashboard/admins", icon: IconUsers },
]

const navSecondary = [
  { title: "Settings", url: "/dashboard/settings", icon: IconSettings },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const user = session?.user
    ? {
        name: session.user.name || session.user.email || "Admin",
        email: session.user.email || "",
        avatar: session.user.image || undefined,
      }
    : { name: "Admin", email: "", avatar: undefined }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <span className="text-base font-semibold">Byton Byte Management</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
