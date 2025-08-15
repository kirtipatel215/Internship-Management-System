"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-dynamic"
import { Loader2 } from "lucide-react"
import { useRealtime } from "@/lib/realtime-context"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const { onDataUpdate } = useRealtime()

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser()

      if (!currentUser) {
        router.push("/auth")
        return
      }

      if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        router.push(`/dashboard/${currentUser.role}`)
        return
      }

      setUser(currentUser)
      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()

    const unsubscribe = onDataUpdate((event) => {
      if (event.type.includes("USER") && user && event.data.id === user.id) {
        console.log("[v0] Auth guard received user update:", event.data)

        // Re-check authorization if user data changed
        if (allowedRoles && !allowedRoles.includes(event.data.role)) {
          router.push(`/dashboard/${event.data.role}`)
          return
        }

        setUser(event.data)
      }
    })

    return unsubscribe
  }, [allowedRoles, router, onDataUpdate, user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
