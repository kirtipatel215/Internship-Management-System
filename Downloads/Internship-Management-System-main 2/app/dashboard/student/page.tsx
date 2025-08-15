"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  FileText,
  Award,
  TrendingUp,
  Building,
  CheckCircle,
  AlertCircle,
  Calendar,
  Star,
  Zap,
  Target,
  Activity,
  Bell,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import {
  useCurrentUser,
  useCurrentStudent,
  useMyReports,
  useMyCertificates,
  useMyNOCRequests,
} from "@/hooks/use-dynamic-data"
import { useRealtime } from "@/lib/realtime-context"
import { useEffect, useState } from "react"

export default function StudentDashboard() {
  const { user, isLoading: userLoading } = useCurrentUser()
  const { student, isLoading: studentLoading } = useCurrentStudent()
  const { reports, isLoading: reportsLoading } = useMyReports()
  const { certificates, isLoading: certificatesLoading } = useMyCertificates()
  const { nocRequests, isLoading: nocLoading } = useMyNOCRequests()
  const { opportunities } = useRealtime()
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])

  const isLoading = userLoading || studentLoading || reportsLoading || certificatesLoading || nocLoading

  useEffect(() => {
    const deadlines = []

    // Add report deadlines
    const nextReportWeek = (reports.length || 0) + 1
    if (nextReportWeek <= 12) {
      const nextWeekDate = new Date()
      nextWeekDate.setDate(nextWeekDate.getDate() + 7)
      deadlines.push({
        id: 1,
        title: `Weekly Report #${nextReportWeek}`,
        dueDate: nextWeekDate.toISOString().split("T")[0],
        priority: "high",
      })
    }

    // Add opportunity deadlines
    const activeOpportunities = opportunities
      .filter((opp) => opp.status === "active" && new Date(opp.deadline) > new Date())
      .slice(0, 2)

    activeOpportunities.forEach((opp, index) => {
      deadlines.push({
        id: index + 2,
        title: `Application: ${opp.title}`,
        dueDate: opp.deadline,
        priority: "medium",
      })
    })

    setUpcomingDeadlines(deadlines)
  }, [reports, opportunities])

  if (isLoading) {
    return (
      <AuthGuard allowedRoles={["student"]}>
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

  const stats = {
    totalReports: student?.totalReports || 12,
    approvedReports: reports.filter((r) => r.status === "approved").length,
    pendingReports: reports.filter((r) => r.status === "pending").length,
    totalCertificates: certificates.length,
    approvedCertificates: certificates.filter((c) => c.status === "approved").length,
    nocRequests: nocRequests.length,
    approvedNOCs: nocRequests.filter((n) => n.status === "approved").length,
  }

  const progressValue = stats.totalReports > 0 ? (stats.approvedReports / stats.totalReports) * 100 : 0

  const recentActivities = [
    ...reports.slice(0, 2).map((report) => ({
      type: "report",
      title: `${report.title} submitted`,
      time: report.submittedAt,
      status: report.status,
    })),
    ...certificates.slice(0, 1).map((cert) => ({
      type: "certificate",
      title: `Certificate uploaded for ${cert.company}`,
      time: cert.uploadDate,
      status: cert.status,
    })),
    ...nocRequests.slice(0, 1).map((noc) => ({
      type: "noc",
      title: `NOC request for ${noc.company}`,
      time: noc.submittedAt,
      status: noc.status,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 3)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
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

  return (
    <AuthGuard allowedRoles={["student"]}>
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
                      Welcome back, {user?.name || "Student"}!
                    </h1>
                    <p className="text-gray-600 text-lg">Track your internship progress and manage your activities</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
                    <Zap className="h-3 w-3 mr-1" />
                    {student?.status === "active" ? "Active Student" : "Student"}
                  </Badge>
                  <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200">
                    <Target className="h-3 w-3 mr-1" />
                    {progressValue >= 75 ? "On Track" : progressValue >= 50 ? "In Progress" : "Getting Started"}
                  </Badge>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-gray-500 font-medium">
                  Roll Number: {student?.rollNumber || user?.rollNumber || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  {student?.department || user?.department || "Computer Engineering"} - {student?.semester || "6th"}{" "}
                  Semester
                </p>
                <p className="text-xs text-gray-400">CGPA: {student?.cgpa || "N/A"}</p>
                <div className="flex items-center justify-end mt-2">
                  <Bell className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-600 font-medium">{stats.pendingReports} pending items</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "NOC Status",
                  value: `${stats.approvedNOCs}/${stats.nocRequests}`,
                  icon: FileText,
                  color: "blue",
                  trend:
                    stats.nocRequests > 0 ? `${Math.round((stats.approvedNOCs / stats.nocRequests) * 100)}%` : "0%",
                  subtitle: "Approved requests",
                },
                {
                  title: "Reports Progress",
                  value: `${stats.approvedReports}/${stats.totalReports}`,
                  icon: BookOpen,
                  color: "emerald",
                  trend: `${Math.round(progressValue)}%`,
                  subtitle: "Completion rate",
                },
                {
                  title: "Certificates",
                  value: stats.approvedCertificates,
                  icon: Award,
                  color: "orange",
                  trend:
                    stats.totalCertificates > 0
                      ? `${Math.round((stats.approvedCertificates / stats.totalCertificates) * 100)}%`
                      : "0%",
                  subtitle: "Approved certificates",
                },
                {
                  title: "Overall Progress",
                  value: `${Math.round(progressValue)}%`,
                  icon: TrendingUp,
                  color: "purple",
                  trend: progressValue >= 75 ? "Excellent" : progressValue >= 50 ? "Good" : "Needs Work",
                  subtitle: "Internship completion",
                },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 flex items-center justify-center`}
                    >
                      <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold text-${stat.color}-600 mb-2`}>{stat.value}</div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{stat.subtitle}</p>
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                        <span className="text-xs text-emerald-600 font-medium">{stat.trend}</span>
                      </div>
                    </div>
                    {stat.title === "Reports Progress" && <Progress value={progressValue} className="mt-2 h-2" />}
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
                        <CardDescription className="text-gray-600">Your latest submissions and updates</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">Live Updates</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity, index) => (
                        <div
                          key={`activity-${index}`}
                          className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                        >
                          <div className="flex-shrink-0">
                            <div
                              className={`w-12 h-12 ${getGradientAvatar(activity.title, index)} rounded-full flex items-center justify-center shadow-lg`}
                            >
                              {activity.type === "report" ? (
                                <FileText className="h-5 w-5 text-white" />
                              ) : activity.type === "certificate" ? (
                                <Award className="h-5 w-5 text-white" />
                              ) : (
                                <CheckCircle className="h-5 w-5 text-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(activity.time).toLocaleDateString()} •{" "}
                              {new Date(activity.time).toLocaleTimeString()}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(activity.status)} px-3 py-1 text-xs font-medium`}>
                            {activity.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No recent activities yet</p>
                        <p className="text-sm">Start by submitting your first report or applying for NOC</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link href="/dashboard/student/reports">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View All Reports
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Deadlines */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Upcoming Deadlines</CardTitle>
                      <CardDescription className="text-gray-600">Don't miss these important dates</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {upcomingDeadlines.length > 0 ? (
                      upcomingDeadlines.map((deadline) => (
                        <div
                          key={deadline.id}
                          className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100"
                        >
                          <AlertCircle className={`h-5 w-5 ${getPriorityColor(deadline.priority)}`} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{deadline.title}</p>
                            <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(deadline.dueDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge
                            className={`${deadline.priority === "high" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"} px-2 py-1 text-xs`}
                          >
                            {deadline.priority}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No upcoming deadlines</p>
                        <p className="text-sm">You're all caught up!</p>
                      </div>
                    )}
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
                    {
                      href: "/dashboard/student/opportunities",
                      icon: Building,
                      label: "Browse Opportunities",
                      color: "blue",
                      count: opportunities.filter((o) => o.status === "active").length,
                    },
                    {
                      href: "/dashboard/student/noc",
                      icon: FileText,
                      label: "Apply for NOC",
                      color: "emerald",
                      count: stats.pendingReports,
                    },
                    {
                      href: "/dashboard/student/reports",
                      icon: BookOpen,
                      label: "Submit Report",
                      color: "orange",
                      count: stats.pendingReports,
                    },
                    {
                      href: "/dashboard/student/certificates",
                      icon: Award,
                      label: "View Certificates",
                      color: "purple",
                      count: stats.totalCertificates,
                    },
                  ].map((action, index) => (
                    <Link key={index} href={action.href}>
                      <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border-2 relative"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br from-${action.color}-100 to-${action.color}-200 flex items-center justify-center`}
                        >
                          <action.icon className={`h-4 w-4 text-${action.color}-600`} />
                        </div>
                        <span className="font-semibold text-gray-700 text-center text-sm">{action.label}</span>
                        {action.count > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white">
                            {action.count}
                          </Badge>
                        )}
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
