import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#E7F0FA]">
      <AdminSidebar />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen overflow-auto">{children}</main>
    </div>
  )
}
