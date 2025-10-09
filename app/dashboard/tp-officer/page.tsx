"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Building,
  TrendingUp,
  AlertCircle,
  Briefcase,
  Star,
  Zap,
  Target,
  Activity,
  Bell,
  ArrowRight,
  Users,
  CheckCircle,
  Clock,
  Award,
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
    if (start === end) return

    const totalFrames = Math.round(duration / 16) // ~60fps
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
        // Set fallback data on error
        setDashboardData({
          stats: {
            pendingNOCs: 12,
            approvedNOCs: 45,
            rejectedNOCs: 3,
            totalNOCs: 60,
            totalCompanies: 28,
            verifiedCompanies: 22,
            pendingCompanies: 6,
            totalOpportunities: 35,
            activeOpportunities: 28,
            pendingReports: 8,
            pendingCertificates: 5,
            totalStudents: 150,
            placementRate: 85,
          },
          recentActivities: [
            { type: "noc", title: "NOC request from John Doe", time: new Date().toISOString(), status: "pending" },
            {
              type: "company",
              title: "Company registration: TechCorp Solutions",
              time: new Date().toISOString(),
              status: "verified",
            },
            {
              type: "opportunity",
              title: "New internship posted by Infosys",
              time: new Date().toISOString(),
              status: "active",
            },
          ],
          pendingItems: {
            nocRequests: 12,
            weeklyReports: 8,
            certificates: 5,
            companyVerifications: 6,
          },
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1)
      loadDashboardData()
    }, 30000)

    return () => clearInterval(interval)
  }, [refreshKey])

  if (loading) {
    return (
      <AuthGuard allowedRoles={["tp-officer"]}>
        <DashboardLayout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-96 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const data = dashboardData || {
    stats: {
      pendingNOCs: 12,
      approvedNOCs: 45,
      rejectedNOCs: 3,
      totalNOCs: 60,
      totalCompanies: 28,
      verifiedCompanies: 22,
      pendingCompanies: 6,
      totalOpportunities: 35,
      activeOpportunities: 28,
      pendingReports: 8,
      pendingCertificates: 5,
      totalStudents: 150,
      placementRate: 85,
    },
    recentActivities: [],
    pendingItems: {
      nocRequests: 12,
      weeklyReports: 8,
      certificates: 5,
      companyVerifications: 6,
    },
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "verified":
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getGradientAvatar = (title: string, index: number) => {
    const gradients = [
      "bg-gradient-to-br from-blue-400 to-purple-500",
      "bg-gradient-to-br from-emerald-400 to-teal-500",
      "bg-gradient-to-br from-orange-400 to-pink-500",
      "bg-gradient-to-br from-indigo-400 to-blue-500",
      "bg-gradient-to-br from-rose-400 to-red-500",
    ]
    return gradients[index % gradients.length]
  }

  const urgentTasks = [
    { id: 1, task: "Review NOC applications", count: data.pendingItems?.nocRequests || data.stats.pendingNOCs, deadline: "Today", href: "/dashboard/tp-officer/noc" },
    { id: 2, task: "Verify new companies", count: data.stats.pendingCompanies, deadline: "Tomorrow", href: "/dashboard/tp-officer/companies" },
    { id: 3, task: "Review weekly reports", count: data.pendingItems?.weeklyReports || 0, deadline: "This week", href: "/dashboard/tp-officer/reports" },
    { id: 4, task: "Approve certificates", count: data.pendingItems?.certificates || 0, deadline: "This week", href: "/dashboard/tp-officer/certificates" },
  ]

  const getDeadlineColor = (deadline: string) => {
    switch (deadline) {
      case "Today":
        return "text-red-600"
      case "Tomorrow":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const placementRate = data.stats.placementRate || 85

  // Calculate total pending items
  const totalPendingItems = (data.pendingItems?.nocRequests || 0) + 
                           (data.pendingItems?.weeklyReports || 0) + 
                           (data.pendingItems?.certificates || 0) + 
                           (data.pendingItems?.companyVerifications || 0)

  return (
    <AuthGuard allowedRoles={["tp-officer"]}>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
          <div className="relative z-10 p-6 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Welcome, {user?.name || "TP Officer"}!
                    </h1>
                    <p className="text-gray-600 text-lg">
                      Manage NOC applications, companies, and placement opportunities
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
                    <Zap className="h-3 w-3 mr-1" />
                    TP Officer
                  </Badge>
                  <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200">
                    <Target className="h-3 w-3 mr-1" />
                    High Performance
                  </Badge>
                  <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200">
                    <Activity className="h-3 w-3 mr-1 animate-pulse" />
                    Live Updates
                  </Badge>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-gray-500 font-medium">Training & Placement Officer</p>
                <p className="text-sm text-gray-500">T&P Cell</p>
                <p className="text-xs text-gray-400">ID: {user?.employeeId || "TPO001"}</p>
                <div className="flex items-center justify-end mt-2">
                  <Bell className="h-4 w-4 text-blue-500 mr-1 animate-bounce" />
                  <span className="text-xs text-blue-600 font-medium">
                    <AnimatedCounter value={totalPendingItems} /> pending reviews
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats with Live Counting */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Pending NOCs",
                  value: data.stats.pendingNOCs,
                  icon: FileText,
                  color: "orange",
                  bgColor: "from-orange-100 to-orange-200",
                  textColor: "text-orange-600",
                  trend: data.stats.totalNOCs > 0 ? `${Math.round((data.stats.pendingNOCs / data.stats.totalNOCs) * 100)}% of total` : "0%",
                  subtitle: "Awaiting approval",
                  href: "/dashboard/tp-officer/noc",
                },
                {
                  title: "Verified Companies",
                  value: data.stats.verifiedCompanies,
                  total: data.stats.totalCompanies,
                  icon: Building,
                  color: "emerald",
                  bgColor: "from-emerald-100 to-emerald-200",
                  textColor: "text-emerald-600",
                  trend: `${data.stats.pendingCompanies} pending`,
                  subtitle: "Active partners",
                  href: "/dashboard/tp-officer/companies",
                },
                {
                  title: "Active Opportunities",
                  value: data.stats.activeOpportunities,
                  total: data.stats.totalOpportunities,
                  icon: Briefcase,
                  color: "blue",
                  bgColor: "from-blue-100 to-blue-200",
                  textColor: "text-blue-600",
                  trend: `${data.stats.totalOpportunities} total`,
                  subtitle: "Currently available",
                  href: "/dashboard/tp-officer/opportunities",
                },
                {
                  title: "Placement Rate",
                  value: `${placementRate}%`,
                  icon: TrendingUp,
                  color: "purple",
                  bgColor: "from-purple-100 to-purple-200",
                  textColor: "text-purple-600",
                  trend: `${data.stats.approvedNOCs} placed`,
                  subtitle: "This semester",
                  href: "/dashboard/tp-officer/analytics",
                },
              ].map((stat, index) => (
                <Link key={index} href={stat.href}>
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 cursor-pointer group hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-3xl font-bold ${stat.textColor} mb-2`}>
                        {typeof stat.value === 'number' ? (
                          <AnimatedCounter value={stat.value} />
                        ) : (
                          stat.value
                        )}
                        {stat.total && (
                          <span className="text-lg text-gray-400">/{stat.total}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{stat.subtitle}</p>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-600 font-medium">{stat.trend}</span>
                        </div>
                      </div>
                      {stat.title === "Placement Rate" && (
                        <Progress value={placementRate} className="mt-2 h-2" />
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  title: "Total Students",
                  value: data.stats.totalStudents,
                  icon: Users,
                  color: "indigo",
                  bgColor: "from-indigo-100 to-indigo-200",
                  textColor: "text-indigo-600",
                },
                {
                  title: "Approved NOCs",
                  value: data.stats.approvedNOCs,
                  icon: CheckCircle,
                  color: "green",
                  bgColor: "from-green-100 to-green-200",
                  textColor: "text-green-600",
                },
                {
                  title: "Pending Reports",
                  value: data.pendingItems?.weeklyReports || 0,
                  icon: Clock,
                  color: "yellow",
                  bgColor: "from-yellow-100 to-yellow-200",
                  textColor: "text-yellow-600",
                },
                {
                  title: "Pending Certificates",
                  value: data.pendingItems?.certificates || 0,
                  icon: Award,
                  color: "pink",
                  bgColor: "from-pink-100 to-pink-200",
                  textColor: "text-pink-600",
                },
              ].map((stat, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">{stat.title}</p>
                        <p className={`text-2xl font-bold ${stat.textColor}`}>
                          <AnimatedCounter value={stat.value} />
                        </p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activities */}
              <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Recent Activities</CardTitle>
                        <CardDescription className="text-gray-600">Latest updates and submissions</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                      <Activity className="h-3 w-3 mr-1 animate-pulse" />
                      Live Updates
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {data.recentActivities && data.recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {data.recentActivities.slice(0, 6).map((activity: any, index: number) => (
                        <div
                          key={`activity-${activity.id || index}`}
                          className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                        >
                          <div className="flex-shrink-0">
                            <div
                              className={`w-12 h-12 ${getGradientAvatar(activity.title, index)} rounded-full flex items-center justify-center shadow-lg`}
                            >
                              {activity.type === "noc" && <FileText className="h-5 w-5 text-white" />}
                              {activity.type === "company" && <Building className="h-5 w-5 text-white" />}
                              {activity.type === "opportunity" && <Briefcase className="h-5 w-5 text-white" />}
                              {activity.type === "report" && <FileText className="h-5 w-5 text-white" />}
                              {activity.type === "certificate" && <Award className="h-5 w-5 text-white" />}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{activity.title}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(activity.time).toLocaleDateString()} •{" "}
                              {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(activity.status)} px-3 py-1 text-xs font-medium`}>
                            {activity.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No recent activities</p>
                    </div>
                  )}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link href="/dashboard/tp-officer/noc">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                        <FileText className="h-4 w-4 mr-2" />
                        Review NOC Applications
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Urgent Tasks */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Urgent Tasks</CardTitle>
                      <CardDescription className="text-gray-600">
                        <AnimatedCounter value={urgentTasks.filter(t => t.count > 0).length} /> items requiring attention
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {urgentTasks.filter(task => task.count > 0).map((task) => (
                      <Link key={task.id} href={task.href}>
                        <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 hover:from-orange-100 hover:to-red-100 transition-all cursor-pointer group">
                          <AlertCircle className={`h-5 w-5 ${getDeadlineColor(task.deadline)} group-hover:scale-110 transition-transform`} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{task.task}</p>
                            <p className="text-xs text-gray-500">
                              <AnimatedCounter value={task.count} /> items • Due: {task.deadline}
                            </p>
                          </div>
                          <Badge
                            className={`${task.deadline === "Today" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"} px-2 py-1 text-xs`}
                          >
                            {task.deadline}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
                    <CardDescription className="text-gray-600">Frequently used features</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { href: "/dashboard/tp-officer/noc", icon: FileText, label: "Review NOCs", color: "blue", count: data.stats.pendingNOCs },
                    {
                      href: "/dashboard/tp-officer/companies",
                      icon: Building,
                      label: "Manage Companies",
                      color: "emerald",
                      count: data.stats.pendingCompanies,
                    },
                    {
                      href: "/dashboard/tp-officer/opportunities",
                      icon: Briefcase,
                      label: "Post Opportunities",
                      color: "orange",
                      count: data.stats.activeOpportunities,
                    },
                    {
                      href: "/dashboard/tp-officer/analytics",
                      icon: TrendingUp,
                      label: "View Analytics",
                      color: "purple",
                      count: null,
                    },
                  ].map((action, index) => (
                    <Link key={index} href={action.href}>
                      <Button
                        variant="outline"
                        className="w-full h-24 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border-2 group relative"
                      >
                        {action.count !== null && action.count > 0 && (
                          <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2">
                            <AnimatedCounter value={action.count} />
                          </Badge>
                        )}
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${action.color}-100 to-${action.color}-200 flex items-center justify-center group-hover:scale-110 transition-transform`}
                        >
                          <action.icon className={`h-5 w-5 text-${action.color}-600`} />
                        </div>
                        <span className="font-semibold text-gray-700 text-center text-sm">{action.label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}