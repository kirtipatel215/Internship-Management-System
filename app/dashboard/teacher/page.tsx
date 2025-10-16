"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  FileText,
  Award,
  CheckCircle,
  BarChart3,
  Clock,
  TrendingUp,
  Star,
  Zap,
  Target,
  Activity,
  ArrowRight,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileCheck,
  Database,
} from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth-supabase"
import { getTeacherDashboardData, debugTeacherDashboard } from "@/lib/data"
import { useEffect, useState, useCallback } from "react"

interface TeacherDashboardData {
  totalStudents: number
  pendingReports: number
  pendingCertificates: number
  pendingNOCRequests: number
  totalReports: number
  approvedReports: number
  totalCertificates: number
  approvedCertificates: number
  reportsThisWeek: number
  certificatesThisMonth: number
  students: Array<{
    id: string
    name: string
    email: string
    roll_number?: string
    department?: string
  }>
  recentReports: Array<{
    id: string
    title: string
    student_id: string
    student_name: string
    created_at: string
    submitted_date?: string
    status: string
    week_number?: number
  }>
  recentCertificates: Array<{
    id: string
    title: string
    student_id: string
    student_name: string
    created_at: string
    upload_date?: string
    status: string
    certificate_type?: string
  }>
}

interface TeacherUser {
  id: string
  name: string
  email: string
  role: string
  department?: string
  designation?: string
  employeeId?: string
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "approved":
    case "reviewed":
      return "bg-green-100 text-green-800 border-green-200"
    case "pending":
    case "submitted":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "rejected":
    case "revision_required":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getActivityGradient = (index: number): string => {
  const gradients = [
    "bg-gradient-to-br from-blue-400 to-purple-500",
    "bg-gradient-to-br from-emerald-400 to-teal-500",
    "bg-gradient-to-br from-orange-400 to-pink-500",
    "bg-gradient-to-br from-indigo-400 to-blue-500",
    "bg-gradient-to-br from-rose-400 to-red-500",
  ]
  return gradients[index % gradients.length]
}

export default function TeacherDashboard() {
  const [teacherUser, setTeacherUser] = useState<TeacherUser | null>(null)
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [debugMode, setDebugMode] = useState(false)

  const loadDashboardData = useCallback(async (showRefreshLoader = false) => {
    try {
      console.log("📊 Loading teacher dashboard data...")

      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError(null)

      const currentUser = await getCurrentUser()

      if (!currentUser) {
        throw new Error("No authenticated user found. Please sign in again.")
      }

      if (currentUser.role !== "teacher") {
        throw new Error("Access denied. This dashboard is for teachers only.")
      }

      console.log("✅ User authenticated:", currentUser.name, currentUser.email)
      setTeacherUser(currentUser)

      console.log("📊 Fetching dashboard data for teacher:", currentUser.id)
      const data = await getTeacherDashboardData(currentUser.id)

      if (!data) {
        throw new Error("Failed to load dashboard data from database")
      }

      const sanitizedData: TeacherDashboardData = {
        totalStudents: Number(data.totalStudents) || 0,
        pendingReports: Number(data.pendingReports) || 0,
        pendingCertificates: Number(data.pendingCertificates) || 0,
        pendingNOCRequests: Number(data.pendingNOCRequests) || 0,
        totalReports: Number(data.totalReports) || 0,
        approvedReports: Number(data.approvedReports) || 0,
        totalCertificates: Number(data.totalCertificates) || 0,
        approvedCertificates: Number(data.approvedCertificates) || 0,
        reportsThisWeek: Number(data.reportsThisWeek) || 0,
        certificatesThisMonth: Number(data.certificatesThisMonth) || 0,
        students: Array.isArray(data.students) ? data.students : [],
        recentReports: Array.isArray(data.recentReports) ? data.recentReports : [],
        recentCertificates: Array.isArray(data.recentCertificates) ? data.recentCertificates : [],
      }

      console.log("✅ Dashboard data loaded:", {
        students: sanitizedData.totalStudents,
        reports: sanitizedData.totalReports,
        pendingReports: sanitizedData.pendingReports,
        certificates: sanitizedData.totalCertificates,
        pendingCerts: sanitizedData.pendingCertificates,
        pendingNOCs: sanitizedData.pendingNOCRequests
      })
      
      setDashboardData(sanitizedData)
      setLastRefresh(new Date())
    } catch (err: any) {
      console.error("❌ Error loading dashboard data:", err)
      setError(err.message || "Failed to load dashboard data")

      setDashboardData({
        totalStudents: 0,
        pendingReports: 0,
        pendingCertificates: 0,
        pendingNOCRequests: 0,
        totalReports: 0,
        approvedReports: 0,
        totalCertificates: 0,
        approvedCertificates: 0,
        reportsThisWeek: 0,
        certificatesThisMonth: 0,
        students: [],
        recentReports: [],
        recentCertificates: [],
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleRefresh = () => {
    console.log("🔄 Manual refresh triggered")
    loadDashboardData(true)
  }

  const handleDebug = async () => {
    if (teacherUser) {
      setDebugMode(true)
      await debugTeacherDashboard(teacherUser.id)
      setTimeout(() => setDebugMode(false), 3000)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("⏰ Auto-refresh triggered (5 min)")
      loadDashboardData(true)
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [loadDashboardData])

  const DebugButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDebug}
      disabled={debugMode}
      className="text-gray-500 hover:text-gray-700"
    >
      {debugMode ? (
        <>
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          Debugging...
        </>
      ) : (
        <>
          <Database className="h-4 w-4 mr-1" />
          Debug
        </>
      )}
    </Button>
  )

  const RefreshInfo = () => {
    if (!lastRefresh) return null

    const timeSince = Math.floor((new Date().getTime() - lastRefresh.getTime()) / 1000)
    const minutes = Math.floor(timeSince / 60)
    const seconds = timeSince % 60

    return (
      <div className="text-xs text-gray-500">
        Last updated: {minutes > 0 ? `${minutes}m ` : ""}
        {seconds}s ago
      </div>
    )
  }

  if (loading) {
    return (
      <AuthGuard allowedRoles={["teacher"]}>
        <DashboardLayout>
          <div className="min-h-screen bg-gray-50 p-4 lg:p-8 space-y-8">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-8 w-64 bg-gray-200 rounded"></div>
                  <div className="h-4 w-96 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (error && !dashboardData) {
    return (
      <AuthGuard allowedRoles={["teacher"]}>
        <DashboardLayout>
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-md mx-auto mt-20">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
              <Card>
                <CardContent className="text-center p-6">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
                  <p className="text-gray-600 mb-4">We encountered an error while loading your dashboard data.</p>
                  <Button onClick={handleRefresh} className="w-full" disabled={refreshing}>
                    {refreshing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (!dashboardData) {
    return (
      <AuthGuard allowedRoles={["teacher"]}>
        <DashboardLayout>
          <div className="min-h-screen bg-gray-50 p-6">
            <Card className="max-w-md mx-auto mt-20">
              <CardContent className="text-center p-6">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
                <p className="text-gray-600 mb-4">Your teacher dashboard data is not available yet.</p>
                <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
                  {refreshing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const safeRecentReports = Array.isArray(dashboardData.recentReports) ? dashboardData.recentReports : []
  const safeRecentCertificates = Array.isArray(dashboardData.recentCertificates) ? dashboardData.recentCertificates : []
  const safeStudents = Array.isArray(dashboardData.students) ? dashboardData.students : []

  // Combine and sort recent activities correctly
  const recentActivities = [
    ...safeRecentReports.map((report) => ({
      id: `report-${report.id}`,
      type: "report",
      title: `${report.title || 'Weekly Report'} - ${report.student_name || 'Student'}`,
      time: report.submitted_date || report.created_at,
      status: report.status || 'pending',
      student_id: report.student_id,
      student_name: report.student_name,
      week_number: report.week_number,
      href: "/dashboard/teacher/reports",
    })),
    ...safeRecentCertificates.map((cert) => ({
      id: `certificate-${cert.id}`,
      type: "certificate",
      title: `${cert.title || 'Certificate'} - ${cert.student_name || 'Student'}`,
      time: cert.upload_date || cert.created_at,
      status: cert.status || 'pending',
      student_id: cert.student_id,
      student_name: cert.student_name,
      certificate_type: cert.certificate_type,
      href: "/dashboard/teacher/certificates",
    })),
  ]
    .filter(activity => activity.time) // Filter out activities without timestamps
    .sort((a, b) => {
      const timeA = new Date(a.time).getTime()
      const timeB = new Date(b.time).getTime()
      return timeB - timeA // Most recent first
    })
    .slice(0, 10)

  console.log("📋 Recent activities generated:", recentActivities.length)

  const stats = [
    {
      title: "Total Students",
      value: dashboardData.totalStudents,
      icon: Users,
      color: "blue",
      trend: dashboardData.totalStudents > 0 ? "Active" : "No students",
      subtitle: "Under guidance",
      href: "/dashboard/teacher/students",
    },
    {
      title: "NOC Approvals",
      value: dashboardData.pendingNOCRequests,
      icon: FileCheck,
      color: "purple",
      trend: dashboardData.pendingNOCRequests > 0 ? "Pending" : "All reviewed",
      subtitle: "Academic approval",
      href: "/dashboard/teacher/noc",
    },
    {
      title: "Pending Reports",
      value: dashboardData.pendingReports,
      icon: FileText,
      color: "orange",
      trend: dashboardData.pendingReports > 0 ? "Needs review" : "All caught up",
      subtitle: "Awaiting review",
      href: "/dashboard/teacher/reports",
    },
    {
      title: "Total Reports",
      value: dashboardData.totalReports,
      icon: CheckCircle,
      color: "green",
      trend: "This semester",
      subtitle: "Submitted reports",
      href: "/dashboard/teacher/reports",
    },
    {
      title: "Certificates",
      value: dashboardData.pendingCertificates,
      icon: Award,
      color: "indigo",
      trend: dashboardData.pendingCertificates > 0 ? "Pending" : "All reviewed",
      subtitle: "Pending approval",
      href: "/dashboard/teacher/certificates",
    },
  ]

  return (
    <AuthGuard allowedRoles={["teacher"]}>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="p-3 lg:p-8 space-y-4 lg:space-y-8">
            {/* Mobile-Optimized Header */}
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Star className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl lg:text-3xl font-bold text-gray-900 truncate">
                    Welcome, {teacherUser?.name?.split(' ')[0]}!
                  </h1>
                  <p className="text-sm lg:text-base text-gray-600 mt-0.5">Manage students & review progress</p>
                </div>
                <div className="flex gap-1 lg:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2"
                  >
                    {refreshing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Mobile Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Active Mentor
                </Badge>
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  {dashboardData.totalStudents} Students
                </Badge>
              </div>

              {/* Desktop Info - Hidden on Mobile */}
              <div className="hidden lg:flex lg:justify-between lg:items-center">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{teacherUser?.designation || "Faculty Member"}</p>
                  <p className="text-sm text-gray-500">{teacherUser?.department || "Computer Engineering"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshInfo />
                  <DebugButton />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="text-blue-600"
                  >
                    {refreshing ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile-Optimized Stats Cards - Horizontal Scroll */}
            <div className="lg:hidden">
              <div className="overflow-x-auto -mx-3 px-3 pb-2 scrollbar-hide">
                <div className="flex gap-3 min-w-max">
                  {stats.map((stat, index) => (
                    <Link key={index} href={stat.href} className="block w-40 flex-shrink-0">
                      <Card className="hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer hover:border-blue-300 h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
                          <CardTitle className="text-xs font-medium text-gray-600 leading-tight line-clamp-2">
                            {stat.title}
                          </CardTitle>
                          <div className={`w-8 h-8 rounded-lg bg-${stat.color}-100 flex items-center justify-center flex-shrink-0 ml-2`}>
                            <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <div className={`text-2xl font-bold text-${stat.color}-600 mb-1`}>
                            {stat.value}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-xs text-gray-500 truncate">{stat.subtitle}</p>
                            <span className="text-xs font-medium text-gray-600 truncate">{stat.trend}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
              {/* Scroll indicator */}
              <div className="flex justify-center gap-1 mt-2">
                {stats.map((_, index) => (
                  <div key={index} className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                ))}
              </div>
            </div>

            {/* Desktop Stats Grid */}
            <div className="hidden lg:grid lg:grid-cols-5 lg:gap-6">
              {stats.map((stat, index) => (
                <Link key={index} href={stat.href} className="block">
                  <Card className="hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer hover:border-blue-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 lg:pb-2">
                      <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 leading-tight">
                        {stat.title}
                      </CardTitle>
                      <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-${stat.color}-100 flex items-center justify-center flex-shrink-0`}>
                        <stat.icon className={`h-4 w-4 lg:h-5 lg:w-5 text-${stat.color}-600`} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className={`text-2xl lg:text-3xl font-bold text-${stat.color}-600 mb-1`}>
                        {stat.value}
                      </div>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-0.5">
                        <p className="text-xs text-gray-500 truncate">{stat.subtitle}</p>
                        <span className="text-xs font-medium text-gray-600 truncate">{stat.trend}</span>
                      </div>
                      <div className="hidden lg:flex items-center text-xs text-blue-600 mt-2">
                        <span>View details</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Mobile-Optimized Quick Actions - Horizontal Scroll */}
            <div className="lg:hidden">
              <Card>
                <CardHeader className="p-3 border-b">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                    {[
                      {
                        href: "/dashboard/teacher/students",
                        icon: Users,
                        label: "Students",
                        color: "blue",
                        count: dashboardData.totalStudents,
                      },
                      {
                        href: "/dashboard/teacher/noc",
                        icon: FileCheck,
                        label: "NOC",
                        color: "purple",
                        count: dashboardData.pendingNOCRequests,
                      },
                      {
                        href: "/dashboard/teacher/reports",
                        icon: FileText,
                        label: "Reports",
                        color: "orange",
                        count: dashboardData.pendingReports,
                      },
                      {
                        href: "/dashboard/teacher/certificates",
                        icon: Award,
                        label: "Certificates",
                        color: "green",
                        count: dashboardData.pendingCertificates,
                      },
                    ].map((action, index) => (
                      <Link key={index} href={action.href} className="flex-shrink-0">
                        <div className="w-24 p-3 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-md active:scale-95 transition-all">
                          <div className={`w-10 h-10 rounded-lg bg-${action.color}-100 flex items-center justify-center mx-auto mb-2`}>
                            <action.icon className={`h-5 w-5 text-${action.color}-600`} />
                          </div>
                          <p className="text-xs font-semibold text-center text-gray-700 mb-1 leading-tight">
                            {action.label}
                          </p>
                          {action.count !== null && action.count > 0 && (
                            <Badge className={`w-full justify-center text-xs bg-${action.color}-100 text-${action.color}-700`}>
                              {action.count}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Desktop Layout - Hidden on Mobile */}
            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
              {/* Recent Activities */}
              <Card className="lg:col-span-2">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Recent Activities</CardTitle>
                        <CardDescription className="text-gray-600">
                          Latest submissions from your students
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">{recentActivities.length} items</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivities.map((activity, index) => (
                        <Link key={activity.id} href={activity.href}>
                          <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors duration-200 cursor-pointer">
                            <div className="flex-shrink-0">
                              <div
                                className={`w-12 h-12 ${getActivityGradient(index)} rounded-full flex items-center justify-center shadow-lg`}
                              >
                                {activity.type === "report" ? (
                                  <FileText className="h-5 w-5 text-white" />
                                ) : (
                                  <Award className="h-5 w-5 text-white" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(activity.time).toLocaleDateString()} • {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(activity.status)} px-3 py-1 text-xs font-medium capitalize`}>
                              {activity.status}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Recent Activities</h3>
                      <p className="text-gray-500 mb-6">No student submissions to review yet.</p>
                      <Link href="/dashboard/teacher/students">
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                          <Users className="h-4 w-4 mr-2" />
                          View My Students
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Desktop Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader className="border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Zap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
                        <CardDescription className="text-gray-600">Frequently used features</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {[
                        {
                          href: "/dashboard/teacher/students",
                          icon: Users,
                          label: "My Students",
                          color: "blue",
                          count: dashboardData.totalStudents,
                        },
                        {
                          href: "/dashboard/teacher/noc",
                          icon: FileCheck,
                          label: "NOC Approvals",
                          color: "purple",
                          count: dashboardData.pendingNOCRequests,
                        },
                        {
                          href: "/dashboard/teacher/reports",
                          icon: FileText,
                          label: "Review Reports",
                          color: "orange",
                          count: dashboardData.pendingReports,
                        },
                        {
                          href: "/dashboard/teacher/certificates",
                          icon: Award,
                          label: "Certificates",
                          color: "green",
                          count: dashboardData.pendingCertificates,
                        },
                        {
                          href: "/dashboard/teacher/analytics",
                          icon: BarChart3,
                          label: "Analytics",
                          color: "indigo",
                          count: null,
                        },
                      ].map((action, index) => (
                        <Link key={index} href={action.href}>
                          <Button
                            variant="outline"
                            className="w-full justify-start h-14 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 bg-white border-2"
                          >
                            <div className={`w-10 h-10 rounded-lg bg-${action.color}-100 flex items-center justify-center mr-3`}>
                              <action.icon className={`h-5 w-5 text-${action.color}-600`} />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-semibold text-gray-700">{action.label}</span>
                              {action.count !== null && action.count > 0 && (
                                <div className="text-xs text-gray-500">{action.count} items</div>
                              )}
                            </div>
                            {action.count !== null && action.count > 0 && (
                              <Badge className={`bg-${action.color}-100 text-${action.color}-700 mr-2`}>
                                {action.count}
                              </Badge>
                            )}
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* This Week Summary */}
                <Card>
                  <CardHeader className="border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">This Week</CardTitle>
                        <CardDescription className="text-gray-600">Your activity summary</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Link href="/dashboard/teacher/noc">
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 cursor-pointer transition-colors">
                          <div className="flex items-center space-x-3">
                            <FileCheck className="h-5 w-5 text-purple-600" />
                            <span className="font-medium text-purple-900">NOC pending</span>
                          </div>
                          <span className="text-2xl font-bold text-purple-600">{dashboardData.pendingNOCRequests}</span>
                        </div>
                      </Link>

                      <Link href="/dashboard/teacher/reports">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 cursor-pointer transition-colors">
                          <div className="flex items-center space-x-3">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-blue-900">Reports to review</span>
                          </div>
                          <span className="text-2xl font-bold text-blue-600">{dashboardData.pendingReports}</span>
                        </div>
                      </Link>

                      <Link href="/dashboard/teacher/certificates">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 cursor-pointer transition-colors">
                          <div className="flex items-center space-x-3">
                            <Award className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-900">Certificates pending</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">{dashboardData.pendingCertificates}</span>
                        </div>
                      </Link>

                      <Link href="/dashboard/teacher/students">
                        <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100 hover:bg-indigo-100 cursor-pointer transition-colors">
                          <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-indigo-600" />
                            <span className="font-medium text-indigo-900">Active students</span>
                          </div>
                          <span className="text-2xl font-bold text-indigo-600">{dashboardData.totalStudents}</span>
                        </div>
                      </Link>

                      {(dashboardData.pendingReports > 0 ||
                        dashboardData.pendingCertificates > 0 ||
                        dashboardData.pendingNOCRequests > 0) && (
                        <div className="pt-4 border-t border-gray-100">
                          <Alert className="border-orange-200 bg-orange-50">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-700">
                              {dashboardData.pendingReports +
                                dashboardData.pendingCertificates +
                                dashboardData.pendingNOCRequests}{" "}
                              items need your attention
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mobile: Recent Activities - Compact View */}
            <div className="lg:hidden">
              <Card>
                <CardHeader className="p-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-base font-bold">Recent Activities</CardTitle>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">{recentActivities.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  {recentActivities.length > 0 ? (
                    <div className="space-y-2">
                      {recentActivities.slice(0, 5).map((activity, index) => (
                        <Link key={activity.id} href={activity.href}>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 active:bg-blue-50 transition-colors">
                            <div className={`w-10 h-10 ${getActivityGradient(index)} rounded-full flex items-center justify-center shadow flex-shrink-0`}>
                              {activity.type === "report" ? (
                                <FileText className="h-4 w-4 text-white" />
                              ) : (
                                <Award className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                                {activity.student_name || 'Student'}
                                {activity.type === "report" && activity.week_number && ` - Week ${activity.week_number}`}
                                {activity.type === "certificate" && activity.certificate_type && ` - ${activity.certificate_type}`}
                              </p>
                              <p className="text-xs text-gray-600">
                                {new Date(activity.time).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(activity.status)} text-xs px-2 py-0.5 capitalize flex-shrink-0`}>
                              {activity.status}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                      {recentActivities.length > 5 && (
                        <Link href="/dashboard/teacher/students">
                          <Button variant="outline" className="w-full mt-2 text-sm">
                            View All Activities
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-4">No recent activities</p>
                      <Link href="/dashboard/teacher/students">
                        <Button size="sm" className="bg-blue-600">
                          <Users className="h-4 w-4 mr-2" />
                          View Students
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Mobile: This Week Summary - Compact Cards */}
            <div className="lg:hidden grid grid-cols-2 gap-3">
              <Link href="/dashboard/teacher/noc">
                <Card className="active:scale-95 transition-transform cursor-pointer hover:shadow-md">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <FileCheck className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">NOC Pending</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{dashboardData.pendingNOCRequests}</div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/teacher/reports">
                <Card className="active:scale-95 transition-transform cursor-pointer hover:shadow-md">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">Reports</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{dashboardData.pendingReports}</div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/teacher/certificates">
                <Card className="active:scale-95 transition-transform cursor-pointer hover:shadow-md">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <Award className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">Certificates</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{dashboardData.pendingCertificates}</div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/teacher/students">
                <Card className="active:scale-95 transition-transform cursor-pointer hover:shadow-md">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">Students</span>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">{dashboardData.totalStudents}</div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Mobile: Alert for Pending Items */}
            {(dashboardData.pendingReports > 0 ||
              dashboardData.pendingCertificates > 0 ||
              dashboardData.pendingNOCRequests > 0) && (
              <div className="lg:hidden">
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-sm text-orange-700">
                    {dashboardData.pendingReports + dashboardData.pendingCertificates + dashboardData.pendingNOCRequests}{" "}
                    items need your attention
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Performance Metrics - Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              <Card>
                <CardHeader className="p-4 lg:p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <CardTitle className="text-base lg:text-lg font-bold text-gray-900">Review Efficiency</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-0">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs lg:text-sm text-gray-600 font-medium">Reports reviewed</span>
                        <span className="font-bold text-blue-600 text-sm lg:text-base">
                          {dashboardData.approvedReports}/{dashboardData.totalReports}
                        </span>
                      </div>
                      <Progress
                        value={
                          dashboardData.totalReports > 0
                            ? (dashboardData.approvedReports / dashboardData.totalReports) * 100
                            : 0
                        }
                        className="h-2 lg:h-3"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs lg:text-sm text-gray-600 font-medium">This week</span>
                        <span className="font-bold text-green-600 text-sm lg:text-base">{dashboardData.reportsThisWeek}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 lg:p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Star className="h-4 w-4 text-green-600" />
                    </div>
                    <CardTitle className="text-base lg:text-lg font-bold text-gray-900">Student Progress</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-gray-600">Active submissions</span>
                      <span className="font-semibold text-green-600 text-sm lg:text-base">{dashboardData.totalReports}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-gray-600">Completion rate</span>
                      <span className="font-semibold text-blue-600 text-sm lg:text-base">
                        {dashboardData.totalStudents > 0
                          ? Math.round((dashboardData.approvedReports / dashboardData.totalStudents) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-gray-600">Certificates issued</span>
                      <span className="font-semibold text-purple-600 text-sm lg:text-base">{dashboardData.approvedCertificates}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 lg:p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                    </div>
                    <CardTitle className="text-base lg:text-lg font-bold text-gray-900">Quick Stats</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-gray-600">Students mentored</span>
                      <span className="font-semibold text-blue-600 text-sm lg:text-base">{dashboardData.totalStudents}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-gray-600">Reports this week</span>
                      <span className="font-semibold text-green-600 text-sm lg:text-base">{dashboardData.reportsThisWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-gray-600">Pending reviews</span>
                      <span className="font-semibold text-orange-600 text-sm lg:text-base">
                        {dashboardData.pendingReports +
                          dashboardData.pendingCertificates +
                          dashboardData.pendingNOCRequests}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}