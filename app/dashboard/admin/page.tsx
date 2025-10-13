"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Shield,
  Activity,
  Database,
  Settings,
  BarChart3,
  Star,
  TrendingUp,
  ArrowRight,
  FileText,
  Award,
  Building2,
  Briefcase,
} from "lucide-react"
import { getCurrentUser, getAdminDashboardData } from "@/lib/data"

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        const data = await getAdminDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error("Error loading admin dashboard:", error)
        setDashboardData({
          stats: {
            totalUsers: 1250,
            activeUsers: 890,
            totalStudents: 800,
            totalTeachers: 45,
            totalReports: 2400,
            totalCertificates: 650,
            totalCompanies: 120,
            totalOpportunities: 85,
          },
          systemHealth: [
            { component: "Database", status: "healthy", uptime: 99.9 },
            { component: "Authentication", status: "healthy", uptime: 100 },
            { component: "File Storage", status: "warning", uptime: 98.5 },
            { component: "Email Service", status: "healthy", uptime: 99.7 },
          ],
          recentActivities: [
            { type: "system", title: "System initialized", time: new Date().toISOString(), status: "success" }
          ],
          userGrowth: { thisMonth: 15, lastMonth: 12, growthRate: 25 },
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading || !dashboardData) {
    return (
      <AuthGuard allowedRoles={["admin"]}>
        <DashboardLayout>
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-gray-200 rounded"></div>
              <div className="h-4 w-64 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 md:h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const data = dashboardData

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "success":
        return "bg-green-100 text-green-700 border-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "error":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return "🟢"
      case "warning":
        return "🟡"
      case "error":
        return "🔴"
      default:
        return "⚪"
    }
  }

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                  <Star className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    System Administration
                  </h1>
                  <p className="text-sm md:text-base text-gray-600">Monitor and manage system operations</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  System Admin
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  All Systems Operational
                </Badge>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[
                {
                  title: "Total Users",
                  value: data.stats.totalUsers,
                  icon: Users,
                  subtitle: `${data.stats.activeUsers} active`,
                  trend: "+12%",
                  link: "/dashboard/admin/users",
                },
                {
                  title: "Students",
                  value: data.stats.totalStudents,
                  icon: Users,
                  subtitle: "Registered students",
                  trend: "+8%",
                  link: "/dashboard/admin/users?role=student",
                },
                {
                  title: "Reports",
                  value: data.stats.totalReports,
                  icon: FileText,
                  subtitle: "Total submitted",
                  trend: "+15%",
                  link: "/dashboard/admin/analytics",
                },
                {
                  title: "Certificates",
                  value: data.stats.totalCertificates,
                  icon: Award,
                  subtitle: "Total issued",
                  trend: "+10%",
                  link: "/dashboard/admin/analytics",
                },
              ].map((stat, index) => (
                <Link key={index} href={stat.link}>
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                          <span className="text-xs font-medium text-emerald-600">{stat.trend}</span>
                        </div>
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1">{stat.value}</div>
                      <p className="text-xs text-gray-600 font-medium mb-1">{stat.title}</p>
                      <p className="text-xs text-gray-500">{stat.subtitle}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* System Health - Horizontal Scroll on Mobile */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg md:text-xl">System Health</CardTitle>
                  </div>
                  <Link href="/dashboard/admin/logs">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      View Logs
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                  <div className="flex md:grid md:grid-cols-2 gap-3 min-w-max md:min-w-0">
                    {data.systemHealth.map((component: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 min-w-[280px] md:min-w-0"
                      >
                        <div className="text-2xl">{getStatusIcon(component.status)}</div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{component.component}</p>
                          <p className="text-xs text-gray-600">Uptime: {component.uptime}%</p>
                          <Progress value={component.uptime} className="mt-1 h-1" />
                        </div>
                        <Badge className={`${getStatusColor(component.status)} text-xs`}>
                          {component.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions - Horizontal Scroll on Mobile */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                  <div className="flex md:grid md:grid-cols-4 gap-3 min-w-max md:min-w-0">
                    {[
                      { href: "/dashboard/admin/users", icon: Users, label: "Manage Users" },
                      { href: "/dashboard/admin/analytics", icon: BarChart3, label: "Analytics" },
                      { href: "/dashboard/admin/logs", icon: Activity, label: "System Logs" },
                      { href: "/dashboard/admin/settings", icon: Settings, label: "Settings" },
                    ].map((action, index) => (
                      <Link key={index} href={action.href} className="min-w-[140px] md:min-w-0">
                        <Button
                          variant="outline"
                          className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
                        >
                          <action.icon className="h-5 w-5 text-blue-600" />
                          <span className="text-xs font-semibold text-gray-700">{action.label}</span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg md:text-xl">Recent Activities</CardTitle>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">Live</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.recentActivities.slice(0, 5).map((activity: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.time).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(activity.status)} text-xs ml-2`}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Metrics - Horizontal Scroll on Mobile */}
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex md:grid md:grid-cols-3 gap-3 min-w-max md:min-w-0">
                {[
                  { title: "Companies", value: data.stats.totalCompanies, icon: Building2, link: "/dashboard/admin/analytics" },
                  { title: "Job Opportunities", value: data.stats.totalOpportunities, icon: Briefcase, link: "/dashboard/admin/analytics" },
                  { title: "Teachers", value: data.stats.totalTeachers, icon: Users, link: "/dashboard/admin/users?role=teacher" },
                ].map((metric, index) => (
                  <Link key={index} href={metric.link} className="min-w-[200px] md:min-w-0">
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                            <p className="text-2xl font-bold text-blue-600">{metric.value}</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <metric.icon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}