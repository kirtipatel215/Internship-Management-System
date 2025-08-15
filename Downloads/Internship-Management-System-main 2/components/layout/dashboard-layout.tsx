"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { getCurrentUser } from "@/lib/auth-dynamic"
import { useRouter } from "next/navigation"
import { useRealtime } from "@/lib/realtime-context"

interface DashboardLayoutProps {
  children: React.ReactNode
  role?: string
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const { onDataUpdate } = useRealtime()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/auth")
      return
    }
    setUser(currentUser)

    const unsubscribe = onDataUpdate((event) => {
      if (event.type.includes("USER") && event.data.id === currentUser.id) {
        console.log("[v0] User data updated in real-time:", event.data)
        setUser(event.data)
      }
    })

    return unsubscribe
  }, [router, onDataUpdate])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} user={user} />
        <main className="min-h-screen bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
