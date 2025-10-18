"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Home,
  FileText,
  Building,
  Award,
  Users,
  BarChart3,
  Settings,
  Briefcase,
  BookOpen,
  Bell,
  Calendar,
  LogOut,
  Target,
  UserCog,
  Database,
  FileCheck,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

// Import data functions for dynamic counts
import {
  getAllOpportunities,
  getNOCRequestsByStudent,
  getReportsByStudent,
  getCertificatesByStudent,
  generateTeacherNotifications,
  getReportsByTeacher,
  getCertificatesByTeacher,
  getTeacherNOCRequests,
  getNOCRequestsForTPOfficer,
  getAllCompanies,
} from "@/lib/data"

interface SidebarProps {
  user: any
  isOpen: boolean
  onClose: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  badgeVariant?: "default" | "secondary" | "destructive"
}

interface DynamicCounts {
  opportunities?: number
  nocRequests?: number
  reports?: number
  certificates?: number
  notifications?: number
  students?: number
  pendingNOCs?: number
  pendingReports?: number
  pendingCertificates?: number
  companies?: number
}

function SidebarContent({ user, onItemClick }: { user: any; onItemClick?: () => void }) {
  const pathname = usePathname()
  const { toast } = useToast()
  const [counts, setCounts] = useState<DynamicCounts>({})
  const [loading, setLoading] = useState(true)

  // Fetch dynamic counts based on user role
  useEffect(() => {
    const fetchCounts = async () => {
      if (!user?.id || !user?.role) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        let newCounts: DynamicCounts = {}

        switch (user.role) {
          case "student":
            // Fetch student-specific counts
            const [opportunities, nocRequests, reports, certificates, notifications] = await Promise.all([
              getAllOpportunities().catch(() => []),
              getNOCRequestsByStudent(user.id).catch(() => []),
              getReportsByStudent(user.id).catch(() => []),
              getCertificatesByStudent(user.id).catch(() => []),
              // You can add a getNotificationsByStudent function if you have one
              Promise.resolve([]),
            ])

            newCounts = {
              opportunities: opportunities.filter((o: any) => o.status === "active").length,
              nocRequests: nocRequests.filter((n: any) => n.status === "pending").length,
              reports: reports.filter((r: any) => r.status === "pending").length,
              certificates: certificates.filter((c: any) => c.status === "pending").length,
              notifications: 0, // Will be populated when notification system is ready
            }
            break

          case "teacher":
            // Fetch teacher-specific counts
            const [teacherReports, teacherCerts, teacherNOCs, teacherNotifications] = await Promise.all([
              getReportsByTeacher(user.id).catch(() => []),
              getCertificatesByTeacher(user.id).catch(() => []),
              getTeacherNOCRequests(user.id).catch(() => []),
              generateTeacherNotifications(user.id).catch(() => []),
            ])

            newCounts = {
              pendingReports: teacherReports.filter((r: any) => r.status === "pending").length,
              pendingCertificates: teacherCerts.filter((c: any) => c.status === "pending").length,
              pendingNOCs: teacherNOCs.filter((n: any) => n.status === "pending_teacher_approval").length,
              notifications: teacherNotifications.filter((n: any) => !n.isRead).length,
            }
            break

          case "tp_officer":
          case "tp-officer":
            // Fetch TP Officer-specific counts
            const [tpNOCs, tpCompanies] = await Promise.all([
              getNOCRequestsForTPOfficer().catch(() => []),
              getAllCompanies().catch(() => []),
            ])

            newCounts = {
              pendingNOCs: tpNOCs.filter((n: any) => n.status === "pending").length,
              companies: tpCompanies.filter((c: any) => !c.verified).length,
            }
            break

          case "admin":
            // Admin counts can be added here
            newCounts = {}
            break
        }

        setCounts(newCounts)
      } catch (error) {
        console.error("Error fetching sidebar counts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()

    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [user?.id, user?.role])

  // Get navigation items with dynamic counts
  const getNavigationItems = useCallback(
    (role: string): NavigationItem[] => {
      switch (role) {
        case "student":
          return [
            { name: "Dashboard", href: "/dashboard/student", icon: Home },
            {
              name: "Opportunities",
              href: "/dashboard/student/opportunities",
              icon: Briefcase,
              badge: counts.opportunities || undefined,
              badgeVariant: "secondary",
            },
            {
              name: "NOC Requests",
              href: "/dashboard/student/noc",
              icon: FileText,
              badge: counts.nocRequests || undefined,
              badgeVariant: counts.nocRequests ? "destructive" : undefined,
            },
            {
              name: "Weekly Reports",
              href: "/dashboard/student/reports",
              icon: BookOpen,
              badge: counts.reports || undefined,
              badgeVariant: counts.reports ? "destructive" : undefined,
            },
            {
              name: "Certificates",
              href: "/dashboard/student/certificates",
              icon: Award,
              badge: counts.certificates || undefined,
            },
            {
              name: "Notifications",
              href: "/dashboard/student/notifications",
              icon: Bell,
              badge: counts.notifications || undefined,
              badgeVariant: "default",
            },
          ]
        case "teacher":
          return [
            { name: "Dashboard", href: "/dashboard/teacher", icon: Home },
            { name: "My Students", href: "/dashboard/teacher/students", icon: Users },
            {
              name: "NOC  Approval",
              href: "/dashboard/teacher/noc",
              icon: FileCheck,
              badge: counts.pendingNOCs || undefined,
              badgeVariant: counts.pendingNOCs ? "destructive" : undefined,
            },
            {
              name: "Report Reviews",
              href: "/dashboard/teacher/reports",
              icon: FileText,
              badge: counts.pendingReports || undefined,
              badgeVariant: counts.pendingReports ? "destructive" : undefined,
            },
            {
              name: "Certificate Approvals",
              href: "/dashboard/teacher/certificates",
              icon: Award,
              badge: counts.pendingCertificates || undefined,
              badgeVariant: counts.pendingCertificates ? "destructive" : undefined,
            },
            // {
            //   name: "Notifications",
            //   href: "/dashboard/teacher/notifications",
            //   icon: Bell,
            //   badge: counts.notifications || undefined,
            //   badgeVariant: "default",
            // },
          ]
        case "tp-officer":
        case "tp_officer":
          return [
            { name: "Dashboard", href: "/dashboard/tp-officer", icon: Home },
            {
              name: "NOC Management",
              href: "/dashboard/tp-officer/noc",
              icon: FileCheck,
              badge: counts.pendingNOCs || undefined,
              badgeVariant: counts.pendingNOCs ? "destructive" : undefined,
            },
            {
              name: "Company Verification",
              href: "/dashboard/tp-officer/companies",
              icon: Building,
              badge: counts.companies || undefined,
              badgeVariant: counts.companies ? "destructive" : undefined,
            },
            { name: "Opportunities", href: "/dashboard/tp-officer/opportunities", icon: Briefcase },
          ]
        case "admin":
          return [
            { name: "Dashboard", href: "/dashboard/admin", icon: Home },
            { name: "User Management", href: "/dashboard/admin/users", icon: UserCog },
            { name: "System Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
            { name: "Audit Logs", href: "/dashboard/admin/logs", icon: Database },
          ]
        default:
          return []
      }
    },
    [counts],
  )

  const navigationItems = useMemo(() => getNavigationItems(user?.role || ""), [user?.role, getNavigationItems])

  const handleLogout = useCallback(() => {
    try {
      logout()
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
      if (onItemClick) onItemClick()
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast, onItemClick])

  const userInitials = useMemo(() => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
  }, [user?.name])

  const userRoleFormatted = useMemo(() => {
    if (!user?.role) return "User"
    return user.role.replace("-", " ").replace("_", " ")
  }, [user?.role])

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">IMS</span>
            <span className="text-xs text-gray-500">Internship Management</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const IconComponent = item.icon

            return (
              <Link key={item.name} href={item.href} onClick={onItemClick}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10 px-3 transition-all duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "hover:bg-gray-50 text-gray-700 hover:text-gray-900",
                  )}
                >
                  <IconComponent className={cn("mr-3 h-4 w-4", isActive && "text-blue-600")} />
                  <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
                  {item.badge !== undefined && (
                    <Badge
                      variant={
                        item.badgeVariant === "destructive"
                          ? "destructive"
                          : isActive
                            ? "default"
                            : "secondary"
                      }
                      className={cn(
                        "ml-auto text-xs",
                        !item.badgeVariant &&
                          (isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"),
                      )}
                    >
                      {loading ? "..." : item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User info and logout */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        <div className="flex items-center space-x-3 px-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">{userInitials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "User"}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{userRoleFormatted}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start h-9 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="text-sm">Sign Out</span>
        </Button>
      </div>
    </div>
  )
}

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent user={user} />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent user={user} onItemClick={onClose} />
        </SheetContent>
      </Sheet>
    </>
  )
}