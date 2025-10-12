"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Building,
  TrendingUp,
  AlertCircle,
  Briefcase,
  Activity,
  ArrowRight,
  Bell,
} from "lucide-react"
import Link from "next/link"
import { getCurrentUser, getTPOfficerDashboardData } from "@/lib/data"
import { useEffect, useState } from "react"

// Animated Counter Component
function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) {
      setCount(end)
      return
    }

    const totalFrames = Math.round(duration / 16)
    const increment = (end - start) / totalFrames

    let frame = 0
    const counter = setInterval(() => {
      frame++
      start += increment
      setCount(Math.round(start))

      if (frame === totalFrames) {
        clearInterval(counter)
        setCount(end)
      }
    }, 16)

    return () => clearInterval(counter)
  }, [value, duration])

  return <span>{count}</span>
}

export default function TPOfficerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        const data = await getTPOfficerDashboardData()
        console.log("Dashboard data loaded:", data)
        setDashboardData(data)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        setDashboardData({
          stats: {
            pendingNOCs: 12,
            approvedNOCs: 45,
            totalNOCs: 60,
            totalCompanies: 28,
            verifiedCompanies: 22,
            pendingCompanies: 6,
            totalOpportunities: 35,
            activeOpportunities: 28,
            totalStudents: 150,
          },
          pendingItems: {
            nocRequests: 12,
            weeklyReports: 0,
            certificates: 0,
            companyVerifications: 6,
          },
          recentActivities: [],
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      console.log("Auto-refreshing dashboard data...")
      setRefreshKey((prev) => prev + 1)
      loadDashboardData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <AuthGuard allowedRoles={["tp-officer"]}>
        <DashboardLayout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
            <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const data = dashboardData

  // Calculate accurate placement rate: (approved NOCs / total students) * 100
  // Cap at 100% maximum to prevent unrealistic percentages
  const placementRate = Math.min(
    Math.round((data.stats.approvedNOCs / data.stats.totalStudents) * 100),
    100
  )

  const totalPendingItems =
    (data.pendingItems?.nocRequests || 0) +
    (data.pendingItems?.companyVerifications || 0)

  const urgentTasks = [
    {
      task: "Review NOC Applications",
      count: data.pendingItems?.nocRequests || data.stats.pendingNOCs,
      deadline: "Today",
      href: "/dashboard/tp-officer/noc",
      color: "text-red-600",
    },
    {
      task: "Verify Companies",
      count: data.stats.pendingCompanies,
      deadline: "This Week",
      href: "/dashboard/tp-officer/companies",
      color: "text-yellow-600",
    },
  ].filter((task) => task.count > 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "verified":
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <AuthGuard allowedRoles={["tp-officer"]}>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Welcome, {user?.name || "TP Officer"}
                </h1>
                <p className="text-gray-600 mt-1">Training & Placement Management</p>
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {new Date().toLocaleTimeString()} • Auto-refresh: 30s
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Bell className="h-4 w-4 text-blue-500 animate-pulse" />
                <span className="text-sm text-blue-600 font-medium">
                  <AnimatedCounter key={`pending-${refreshKey}`} value={totalPendingItems} /> pending
                </span>
              </div>
            </div>

            {/* Key Stats - Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <Link href="/dashboard/tp-officer/noc">
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500 h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      {data.stats.pendingNOCs > 0 && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          <AnimatedCounter key={`noc-badge-${refreshKey}`} value={data.stats.pendingNOCs} />
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">Pending NOCs</p>
                    <p className="text-2xl font-bold text-orange-600">
                      <AnimatedCounter key={`noc-${refreshKey}`} value={data.stats.pendingNOCs} />
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <AnimatedCounter key={`noc-total-${refreshKey}`} value={data.stats.totalNOCs} /> total
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/tp-officer/companies">
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500 h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Building className="h-5 w-5 text-emerald-600" />
                      {data.stats.pendingCompanies > 0 && (
                        <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                          <AnimatedCounter key={`comp-badge-${refreshKey}`} value={data.stats.pendingCompanies} />
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">Companies</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      <AnimatedCounter key={`comp-${refreshKey}`} value={data.stats.verifiedCompanies} />
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <AnimatedCounter key={`comp-total-${refreshKey}`} value={data.stats.totalCompanies} /> total
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/tp-officer/opportunities">
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-600 mb-1">Opportunities</p>
                    <p className="text-2xl font-bold text-blue-600">
                      <AnimatedCounter key={`opp-${refreshKey}`} value={data.stats.activeOpportunities} />
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <AnimatedCounter key={`opp-total-${refreshKey}`} value={data.stats.totalOpportunities} /> total
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/tp-officer/analytics">
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500 h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-600 mb-1">Placement Rate</p>
                    <p className="text-2xl font-bold text-purple-600">
                      <AnimatedCounter key={`rate-${refreshKey}`} value={placementRate} />%
                    </p>
                    <Progress value={placementRate} className="mt-2 h-1.5" />
                    <p className="text-xs text-gray-500 mt-1">
                      <AnimatedCounter key={`approved-${refreshKey}`} value={data.stats.approvedNOCs} /> / {" "}
                      <AnimatedCounter key={`students-${refreshKey}`} value={data.stats.totalStudents} /> students
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Urgent Tasks */}
            {urgentTasks.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-lg">Urgent Tasks</CardTitle>
                    <Badge className="ml-auto bg-orange-100 text-orange-800">
                      <AnimatedCounter key={`urgent-${refreshKey}`} value={urgentTasks.length} />
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {urgentTasks.map((task, index) => (
                    <Link key={index} href={task.href}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {task.task}
                          </p>
                          <p className="text-xs text-gray-600">
                            <AnimatedCounter key={`task-${index}-${refreshKey}`} value={task.count} /> items • {task.deadline}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link href="/dashboard/tp-officer/noc">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col gap-2 relative hover:bg-blue-50"
                    >
                      {data.stats.pendingNOCs > 0 && (
                        <Badge className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5">
                          <AnimatedCounter key={`action-noc-${refreshKey}`} value={data.stats.pendingNOCs} />
                        </Badge>
                      )}
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="text-xs font-medium">Review NOCs</span>
                    </Button>
                  </Link>

                  <Link href="/dashboard/tp-officer/companies">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col gap-2 hover:bg-emerald-50"
                    >
                      {data.stats.pendingCompanies > 0 && (
                        <Badge className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1.5">
                          <AnimatedCounter key={`action-comp-${refreshKey}`} value={data.stats.pendingCompanies} />
                        </Badge>
                      )}
                      <Building className="h-5 w-5 text-emerald-600" />
                      <span className="text-xs font-medium">Companies</span>
                    </Button>
                  </Link>

                  <Link href="/dashboard/tp-officer/opportunities">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col gap-2 hover:bg-orange-50"
                    >
                      <Briefcase className="h-5 w-5 text-orange-600" />
                      <span className="text-xs font-medium">Opportunities</span>
                    </Button>
                  </Link>

                  <Link href="/dashboard/tp-officer/analytics">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col gap-2 hover:bg-purple-50"
                    >
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span className="text-xs font-medium">Analytics</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities - Only if data exists */}
            {data.recentActivities && data.recentActivities.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Recent Activities</CardTitle>
                    <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.recentActivities.slice(0, 5).map((activity: any, index: number) => (
                    <div
                      key={`activity-${index}-${refreshKey}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        {activity.type === "noc" && <FileText className="h-4 w-4 text-blue-600" />}
                        {activity.type === "company" && <Building className="h-4 w-4 text-emerald-600" />}
                        {activity.type === "opportunity" && <Briefcase className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.time).toLocaleDateString()} •{" "}
                          {new Date(activity.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}