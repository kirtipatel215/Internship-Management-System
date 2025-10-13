"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Users, Building, Activity, Loader2 } from "lucide-react"
import { getAdminDashboardData, getAllNOCRequests, getAllUsers } from "@/lib/data"
import Link from "next/link"

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboard, users, nocs] = await Promise.all([
        getAdminDashboardData(),
        getAllUsers(),
        getAllNOCRequests(),
      ])

      setDashboardData(dashboard)
      
      // Calculate analytics from real data
      const calculateAnalytics = () => {
        const now = new Date()
        const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
          const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
          return {
            month: date.toLocaleString('default', { month: 'short' }),
            date: date,
          }
        })

        // Calculate activities per month based on user registrations and NOC submissions
        const monthlyActivities = lastSixMonths.map(({ month, date }) => {
          const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
          
          const userCount = users.filter((u: any) => {
            const createdDate = new Date(u.created_at)
            return createdDate >= date && createdDate < nextMonth
          }).length

          const nocCount = nocs.filter((n: any) => {
            const submittedDate = new Date(n.submitted_date)
            return submittedDate >= date && submittedDate < nextMonth
          }).length

          return {
            month,
            value: userCount + nocCount,
          }
        })

        return { monthlyActivities }
      }

      setAnalyticsData(calculateAnalytics())
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !dashboardData || !analyticsData) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  const { stats, systemHealth } = dashboardData
  const { monthlyActivities } = analyticsData

  return (
    <DashboardLayout role="admin">
      <div className="p-3 sm:p-4 md:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600">Comprehensive platform insights and performance metrics</p>
        </div>

        {/* Platform Overview - Now with Horizontal Scroll on Mobile */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex overflow-x-auto gap-3 pb-3 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 md:gap-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <Link href="/admin/users" className="flex-shrink-0 w-64 sm:w-auto hover:shadow-lg transition-shadow">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{stats.activeUsers} active users</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/reports" className="flex-shrink-0 w-64 sm:w-auto hover:shadow-lg transition-shadow">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Reports</CardTitle>
                  <Building className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalReports.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{stats.totalCertificates} certificates</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/system-health" className="flex-shrink-0 w-64 sm:w-auto hover:shadow-lg transition-shadow">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">System Health</CardTitle>
                  <Activity className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {systemHealth.filter((h: any) => h.status === 'healthy').length}/{systemHealth.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Components healthy</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/companies" className="flex-shrink-0 w-64 sm:w-auto hover:shadow-lg transition-shadow">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Companies</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalCompanies}</div>
                  <p className="text-xs text-muted-foreground">{stats.totalOpportunities} opportunities</p>
                </CardContent>
              </Card>
            </Link>
          </div>
          
          {/* Scroll Indicator for Mobile */}
          <div className="flex justify-center mt-2 sm:hidden">
            <div className="flex gap-1">
              <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
              <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
              <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
              <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* User Activity - Dynamic */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">User Distribution</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Active users by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                    <span className="text-xs sm:text-sm">Students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-medium">{stats.totalStudents} ({Math.round((stats.totalStudents/stats.totalUsers)*100)}%)</span>
                    <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.round((stats.totalStudents/stats.totalUsers)*100)}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                    <span className="text-xs sm:text-sm">Faculty</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-medium">{stats.totalTeachers} ({Math.round((stats.totalTeachers/stats.totalUsers)*100)}%)</span>
                    <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.round((stats.totalTeachers/stats.totalUsers)*100)}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-purple-600 rounded-full"></div>
                    <span className="text-xs sm:text-sm">Admins</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-medium">{stats.totalUsers - stats.totalStudents - stats.totalTeachers} ({Math.round(((stats.totalUsers - stats.totalStudents - stats.totalTeachers)/stats.totalUsers)*100)}%)</span>
                    <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.round(((stats.totalUsers - stats.totalStudents - stats.totalTeachers)/stats.totalUsers)*100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health - Dynamic */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">System Health</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Component status monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {systemHealth.map((component: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">{component.component}</p>
                      <p className="text-xs text-gray-600">{component.uptime}% uptime</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        component.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {component.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Platform Metrics</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Total Reports</span>
                  <span className="text-xs sm:text-sm font-medium">{stats.totalReports.toLocaleString()}</span>
                </div>
                <Progress value={Math.min((stats.totalReports / 3000) * 100, 100)} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Total Certificates</span>
                  <span className="text-xs sm:text-sm font-medium">{stats.totalCertificates.toLocaleString()}</span>
                </div>
                <Progress value={Math.min((stats.totalCertificates / 1000) * 100, 100)} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Active Users</span>
                  <span className="text-xs sm:text-sm font-medium">{stats.activeUsers.toLocaleString()}</span>
                </div>
                <Progress value={Math.min((stats.activeUsers / stats.totalUsers) * 100, 100)} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Job Opportunities</span>
                  <span className="text-xs sm:text-sm font-medium">{stats.totalOpportunities}</span>
                </div>
                <Progress value={Math.min((stats.totalOpportunities / 100) * 100, 100)} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* System Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">System Resources</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Resource utilization metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Database Load</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                    <span className="text-xs sm:text-sm font-medium">45%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Storage Used</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "62%" }}></div>
                    </div>
                    <span className="text-xs sm:text-sm font-medium">62%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">API Requests</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "78%" }}></div>
                    </div>
                    <span className="text-xs sm:text-sm font-medium">78%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Cache Hit Rate</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                    <span className="text-xs sm:text-sm font-medium">92%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Usage Analytics - Dynamic Chart */}
        <Card className="mt-4 sm:mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              Platform Usage Analytics
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Activity trends over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
              {monthlyActivities.map((item: any, index: number) => {
                const maxValue = Math.max(...monthlyActivities.map((m: any) => m.value))
                const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0
                return (
                  <div key={index} className="text-center">
                    <div className="h-24 sm:h-32 flex items-end justify-center mb-2">
                      <div
                        className="w-6 sm:w-8 bg-gradient-to-t from-blue-600 to-purple-600 rounded-t transition-all duration-300 hover:opacity-80"
                        style={{ height: `${height}%`, minHeight: item.value > 0 ? '10%' : '0%' }}
                      ></div>
                    </div>
                    <p className="text-xs sm:text-sm font-medium">{item.month}</p>
                    <p className="text-xs text-gray-600">{item.value}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}