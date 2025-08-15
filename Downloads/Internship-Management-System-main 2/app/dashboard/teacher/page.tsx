"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  FileText,
  Award,
  CheckCircle,
  Calendar,
  BarChart3,
  Clock,
  TrendingUp,
  Star,
  Zap,
  Target,
  Activity,
  Bell,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { useCurrentUser, useMyStudents, useMyReports, useMyCertificates, useMyTasks } from "@/hooks/use-dynamic-data"

export default function TeacherDashboard() {
  const { user, isLoading: userLoading } = useCurrentUser()
  const { students, isLoading: studentsLoading } = useMyStudents()
  const { reports, isLoading: reportsLoading } = useMyReports()
  const { certificates, isLoading: certificatesLoading } = useMyCertificates()
  const { tasks, isLoading: tasksLoading } = useMyTasks()

  const isLoading = userLoading || studentsLoading || reportsLoading || certificatesLoading || tasksLoading

  if (isLoading) {
    return (
      <AuthGuard allowedRoles={["teacher"]}>
        <DashboardLayout role="teacher">
          <div className="p-4 lg:p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const stats = {
    totalStudents: students.length,
    pendingReports: reports.filter((r) => r.status === "pending").length,
    approvedReports: reports.filter((r) => r.status === "approved").length,
    certificatesToReview: certificates.filter((c) => c.status === "pending").length,
    activeTasks: tasks.filter((t) => !t.isDeleted).length,
  }

  const recentActivities = [
    ...reports.slice(0, 2).map((report) => ({
      type: "report",
      title: `${report.studentName} submitted ${report.title}`,
      time: report.submittedAt,
      status: report.status,
    })),
    ...certificates.slice(0, 1).map((cert) => ({
      type: "certificate",
      title: `${cert.studentName} uploaded certificate`,
      time: cert.uploadDate,
      status: cert.status,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 3)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
      case "scheduled":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalReports = reports.length
  const reviewEfficiency = totalReports > 0 ? Math.round((stats.approvedReports / totalReports) * 100) : 0
  const avgResponseTime = "24h" // This would be calculated from actual review times
  const completionRate =
    students.length > 0
      ? Math.round((students.filter((s) => s.status === "completed").length / students.length) * 100)
      : 0
  const activeStudents = students.filter((s) => s.status === "active").length

  return (
    <AuthGuard allowedRoles={["teacher"]}>
      <DashboardLayout role="teacher">
        <div className="min-h-screen bg-gray-50">
          <div className="p-4 lg:p-8 space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                      Welcome back, {user?.name || "Teacher"}!
                    </h1>
                    <p className="text-gray-600">Manage your students and review their internship progress</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    <Zap className="h-3 w-3 mr-1" />
                    Active Mentor
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Target className="h-3 w-3 mr-1" />
                    {reviewEfficiency >= 80
                      ? "High Performance"
                      : reviewEfficiency >= 60
                        ? "Good Performance"
                        : "Improving"}
                  </Badge>
                </div>
              </div>
              <div className="text-left lg:text-right space-y-1">
                <p className="text-sm text-gray-500 font-medium">{user?.employeeId || "Faculty"}</p>
                <p className="text-sm text-gray-500">{user?.department || "Computer Engineering"}</p>
                <div className="flex items-center lg:justify-end mt-2">
                  <Bell className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-600 font-medium">
                    {stats.pendingReports + stats.certificatesToReview} pending reviews
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  title: "Total Students",
                  value: stats.totalStudents,
                  icon: Users,
                  color: "blue",
                  trend: `${activeStudents} active`,
                  subtitle: "Under your guidance",
                },
                {
                  title: "Pending Reports",
                  value: stats.pendingReports,
                  icon: FileText,
                  color: "orange",
                  trend: totalReports > 0 ? `${Math.round((stats.pendingReports / totalReports) * 100)}%` : "0%",
                  subtitle: "Awaiting review",
                },
                {
                  title: "Approved Reports",
                  value: stats.approvedReports,
                  icon: CheckCircle,
                  color: "green",
                  trend: `${reviewEfficiency}%`,
                  subtitle: "Approval rate",
                },
                {
                  title: "Certificates to Review",
                  value: stats.certificatesToReview,
                  icon: Award,
                  color: "purple",
                  trend:
                    certificates.length > 0
                      ? `${Math.round((stats.certificatesToReview / certificates.length) * 100)}%`
                      : "0%",
                  subtitle: "Pending approval",
                },
                {
                  title: "Active Tasks",
                  value: stats.activeTasks,
                  icon: Target,
                  color: "indigo",
                  trend: `${tasks.length} total`,
                  subtitle: "Assigned to students",
                },
              ].map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                      <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl lg:text-3xl font-bold text-${stat.color}-600 mb-2`}>{stat.value}</div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{stat.subtitle}</p>
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                          Latest submissions and updates from your students
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">Live Updates</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity, index) => (
                        <div
                          key={`activity-${index}`}
                          className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors duration-200"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
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
                        <p>No recent activities</p>
                        <p className="text-sm">Student submissions will appear here</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link href="/dashboard/teacher/students">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                        <Users className="h-4 w-4 mr-2" />
                        View All Students
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

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
                        count: stats.totalStudents,
                      },
                      {
                        href: "/dashboard/teacher/reports",
                        icon: FileText,
                        label: "Review Reports",
                        color: "orange",
                        count: stats.pendingReports,
                      },
                      {
                        href: "/dashboard/teacher/certificates",
                        icon: Award,
                        label: "Certificates",
                        color: "green",
                        count: stats.certificatesToReview,
                      },
                      {
                        href: "/dashboard/teacher/tasks",
                        icon: Target,
                        label: "Manage Tasks",
                        color: "purple",
                        count: stats.activeTasks,
                      },
                      {
                        href: "/dashboard/teacher/meetings",
                        icon: Calendar,
                        label: "Meetings",
                        color: "indigo",
                        count: 0,
                      },
                      {
                        href: "/dashboard/teacher/analytics",
                        icon: BarChart3,
                        label: "Analytics",
                        color: "pink",
                        count: 0,
                      },
                    ].map((action, index) => (
                      <Link key={index} href={action.href}>
                        <Button
                          variant="outline"
                          className="w-full justify-start h-12 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 bg-white border-2 relative"
                        >
                          <div
                            className={`w-8 h-8 rounded-lg bg-${action.color}-100 flex items-center justify-center mr-3`}
                          >
                            <action.icon className={`h-4 w-4 text-${action.color}-600`} />
                          </div>
                          <span className="font-semibold text-gray-700">{action.label}</span>
                          {action.count > 0 && (
                            <Badge className="ml-auto bg-red-500 text-white text-xs">{action.count}</Badge>
                          )}
                          <ArrowRight className="h-4 w-4 ml-2 text-gray-400" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">This Week</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "Reports to review", value: stats.pendingReports, color: "blue" },
                      { label: "Certificates pending", value: stats.certificatesToReview, color: "green" },
                      { label: "Tasks assigned", value: stats.activeTasks, color: "orange" },
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                        <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                        <span className={`font-bold text-${item.color}-600 text-lg`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">Performance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 font-medium">Review efficiency</span>
                        <span className="font-bold text-green-600">{reviewEfficiency}%</span>
                      </div>
                      <Progress value={reviewEfficiency} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 font-medium">Student completion</span>
                        <span className="font-bold text-purple-600">{completionRate}%</span>
                      </div>
                      <Progress value={completionRate} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Star className="h-4 w-4 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">Quick Stats</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. response time</span>
                      <span className="font-semibold text-blue-600">{avgResponseTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completion rate</span>
                      <span className="font-semibold text-green-600">{completionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active students</span>
                      <span className="font-semibold text-purple-600">{activeStudents}</span>
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
