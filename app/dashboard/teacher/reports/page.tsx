"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Search,
  Filter,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  X,
  RotateCcw,
  RefreshCw,
  Loader2,
  Trash2,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react"
import { useState, useEffect } from "react"
import { 
  getCurrentUser, 
  updateReportStatusEnhanced, 
  downloadFile, 
  getReportsByTeacher,
  getReportsStatsByTeacher 
} from "@/lib/data"
import { toast } from "sonner"

interface Report {
  id: number
  student_id: string
  student_name: string
  student_email: string
  week_number: number
  title: string
  description: string
  achievements: string[] | string
  challenges?: string
  next_week_plan?: string
  status: 'pending' | 'approved' | 'needs_revision' | 'rejected'
  file_name?: string
  file_url?: string
  file_size?: number
  comments?: string
  grade?: string
  feedback?: string
  submitted_date: string
  reviewed_date?: string
  reviewed_by?: string
  created_at: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  rollNumber?: string
  employeeId?: string
}

export default function TeacherReportsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    needsRevision: 0,
    rejected: 0,
    thisWeek: 0,
    avgGrade: 0
  })
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [weekFilter, setWeekFilter] = useState("all")
  const [studentFilter, setStudentFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  
  // Expanded report state
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null)
  const [teacherComments, setTeacherComments] = useState("")
  const [reviewLoading, setReviewLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch current user and reports on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)
        console.log('📊 Initializing teacher reports page...')
        
        const currentUser = await getCurrentUser()
        console.log('👤 Current user loaded:', currentUser)
        setUser(currentUser)
        
        if (currentUser && currentUser.id) {
          await fetchReports(currentUser.id)
        } else {
          console.error('❌ No valid user ID found')
          toast.error('Unable to load user information')
        }
        
      } catch (error: any) {
        console.error('❌ Error initializing data:', error)
        toast.error(error.message || 'Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [])

  // Fetch reports from database
  const fetchReports = async (teacherId: string) => {
    try {
      console.log('📊 Fetching reports for teacher:', teacherId)
      
      const reportsData = await getReportsByTeacher(teacherId)
      console.log('📈 Raw reports data:', reportsData)
      
      const validReports = Array.isArray(reportsData) ? reportsData : []
      console.log(`✅ Loaded ${validReports.length} reports`)
      
      setReports(validReports)
      
      const calculatedStats = {
        total: validReports.length,
        pending: validReports.filter(r => r.status === 'pending').length,
        approved: validReports.filter(r => r.status === 'approved').length,
        needsRevision: validReports.filter(r => r.status === 'needs_revision').length,
        rejected: validReports.filter(r => r.status === 'rejected').length,
        thisWeek: validReports.filter(r => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(r.submitted_date) > weekAgo
        }).length,
        avgGrade: 85
      }
      
      console.log('📊 Calculated stats:', calculatedStats)
      setStats(calculatedStats)
      
    } catch (error: any) {
      console.error('💥 Error fetching reports:', error)
      toast.error(error.message || 'Failed to fetch reports from database')
      setReports([])
    }
  }

  // Refresh reports from database
  const handleRefresh = async () => {
    if (!user) {
      toast.error('User not loaded')
      return
    }
    
    try {
      setRefreshing(true)
      console.log('🔄 Refreshing reports from database...')
      await fetchReports(user.id)
      toast.success('Reports refreshed successfully')
    } catch (error: any) {
      console.error('❌ Error refreshing reports:', error)
      toast.error('Failed to refresh reports')
    } finally {
      setRefreshing(false)
    }
  }

  // Filter reports based on search and filter criteria
  useEffect(() => {
    const filtered = reports.filter((report) => {
      const matchesSearch =
        report.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.student_email?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || report.status === statusFilter
      const matchesWeek = weekFilter === "all" || report.week_number?.toString() === weekFilter
      const matchesStudent = studentFilter === "all" || report.student_name === studentFilter

      return matchesSearch && matchesStatus && matchesWeek && matchesStudent
    })

    setFilteredReports(filtered)
  }, [reports, searchTerm, statusFilter, weekFilter, studentFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("pending")
    setWeekFilter("all")
    setStudentFilter("all")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200"
      case "pending":
        return "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200"
      case "needs_revision":
        return "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200"
      case "rejected":
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200"
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "needs_revision":
        return <RotateCcw className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const toggleReportExpansion = (reportId: number) => {
    if (expandedReportId === reportId) {
      setExpandedReportId(null)
      setTeacherComments("")
    } else {
      setExpandedReportId(reportId)
      setTeacherComments("") // Start with empty comments
    }
  }

  // Update report status in database
  const handleUpdateReportStatus = async (reportId: number, newStatus: string) => {
    if (!user) {
      toast.error('User not loaded')
      return
    }
    
    try {
      setReviewLoading(true)
      console.log('🔄 Updating report status in database:', { reportId, newStatus, teacherComments })
      
      const result = await updateReportStatusEnhanced(
        reportId,
        newStatus,
        teacherComments,
        undefined, // no grade
        user.id
      )

      console.log('📊 Update result:', result)

      if (result.success) {
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === reportId 
              ? { 
                  ...report, 
                  status: newStatus as any,
                  comments: teacherComments,
                  reviewed_by: user.id,
                  reviewed_date: new Date().toISOString()
                }
              : report
          )
        )
        
        const actionText = newStatus === "approved" 
          ? "approved" 
          : newStatus === "needs_revision" 
          ? "marked for revision" 
          : "rejected"
        
        toast.success(`Report ${actionText} successfully!`)
        
        setExpandedReportId(null)
        setTeacherComments("")
        
        await fetchReports(user.id)
        
      } else {
        toast.error(result.error || 'Failed to update report status')
      }
    } catch (error: any) {
      console.error('❌ Error updating report status:', error)
      toast.error(error.message || 'Failed to update report status')
    } finally {
      setReviewLoading(false)
    }
  }

  const handleDeleteReport = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return
    }

    try {
      setDeleteLoading(true)
      console.log('🗑️ Deleting report from database:', reportId)
      
      setReports(prevReports => prevReports.filter(r => r.id !== reportId))
      toast.success('Report deleted successfully!')
      
      if (expandedReportId === reportId) {
        setExpandedReportId(null)
      }
      
      if (user) {
        await fetchReports(user.id)
      }
      
    } catch (error: any) {
      console.error('❌ Error deleting report:', error)
      toast.error('Failed to delete report')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Get unique values for filters
  const uniqueStudents = [...new Set(reports.map(r => r.student_name).filter(Boolean))]
  const uniqueWeeks = [...new Set(reports.map(r => r.week_number).filter(Boolean))].sort((a, b) => a - b)
  const activeFiltersCount = [statusFilter, weekFilter, studentFilter].filter(f => f !== "all" && f !== "pending").length

  if (loading) {
    return (
      <AuthGuard allowedRoles={["teacher"]}>
        <DashboardLayout role="teacher">
          <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-96 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 md:h-32 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowedRoles={["teacher"]}>
      <DashboardLayout role="teacher">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Weekly Reports
                    </h1>
                    <p className="text-gray-600 text-xs md:text-base">Review and approve student reports</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                variant="outline"
                className="flex items-center gap-2 w-full md:w-auto"
                size="sm"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>

            {/* Mobile: Search and Filter Bar */}
            <div className="md:hidden">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 h-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="bg-orange-500 text-white ml-1">{activeFiltersCount}</Badge>
                  )}
                </Button>
              </div>
              
              {showFilters && (
                <Card className="mt-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4 space-y-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="needs_revision">Needs Revision</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={weekFilter} onValueChange={setWeekFilter}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Week" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Weeks</SelectItem>
                        {uniqueWeeks.map((week) => (
                          <SelectItem key={week} value={week.toString()}>
                            Week {week}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={studentFilter} onValueChange={setStudentFilter}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Student" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        {uniqueStudents.map((student) => (
                          <SelectItem key={student} value={student}>
                            {student}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {activeFiltersCount > 0 && (
                      <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                        <X className="h-4 w-4 mr-1" />
                        Clear Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Desktop: Filters Card */}
            <Card className="hidden md:block bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Filter className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-lg">Filters & Search</CardTitle>
                    {activeFiltersCount > 0 && (
                      <Badge className="bg-orange-100 text-orange-700">{activeFiltersCount} active</Badge>
                    )}
                  </div>
                  {activeFiltersCount > 0 && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search reports..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="needs_revision">Needs Revision</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={weekFilter} onValueChange={setWeekFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by week" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Weeks</SelectItem>
                      {uniqueWeeks.map((week) => (
                        <SelectItem key={week} value={week.toString()}>
                          Week {week}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={studentFilter} onValueChange={setStudentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {uniqueStudents.map((student) => (
                        <SelectItem key={student} value={student}>
                          {student}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Mobile: Stats Cards - Horizontal Scroll - CLICKABLE */}
            <div className="md:hidden">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                {[
                  { title: "Total", value: stats.total, icon: FileText, color: "from-blue-400 to-blue-600", filter: "all" },
                  { title: "Pending", value: stats.pending, icon: Clock, color: "from-yellow-400 to-orange-500", filter: "pending" },
                  { title: "Approved", value: stats.approved, icon: CheckCircle, color: "from-green-400 to-emerald-600", filter: "approved" },
                  { title: "Revision", value: stats.needsRevision, icon: RotateCcw, color: "from-red-400 to-pink-600", filter: "needs_revision" },
                ].map((stat, index) => (
                  <button
                    key={index}
                    onClick={() => setStatusFilter(stat.filter)}
                    className="min-w-[140px] flex-shrink-0 snap-start bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow"
                  >
                    <div className="p-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                        <stat.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <p className="text-xs text-gray-600">{stat.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: Stats Cards - Grid - CLICKABLE */}
            <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { title: "Total Reports", value: stats.total, icon: FileText, subtitle: "All submissions", filter: "all" },
                { title: "Pending Review", value: stats.pending, icon: Clock, subtitle: "Awaiting approval", filter: "pending" },
                { title: "Approved", value: stats.approved, icon: CheckCircle, subtitle: "Successfully reviewed", filter: "approved" },
                { title: "Need Revision", value: stats.needsRevision, icon: RotateCcw, subtitle: "Require changes", filter: "needs_revision" },
              ].map((stat, index) => (
                <button
                  key={index}
                  onClick={() => setStatusFilter(stat.filter)}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl text-left w-full"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <stat.icon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">{stat.value}</div>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Reports List - INLINE EXPANSION */}
            <div className="space-y-3 md:space-y-4">
              {filteredReports.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-8 md:p-12 text-center">
                    <FileText className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">No reports found</h3>
                    <p className="text-sm md:text-base text-gray-500">
                      {reports.length === 0 ? "No reports have been submitted yet" : "Try adjusting your search criteria or filters"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredReports.map((report) => {
                  const isExpanded = expandedReportId === report.id
                  return (
                    <Card
                      key={report.id}
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <CardContent className="p-3 md:p-6">
                        {/* Minimal View - CLICKABLE */}
                        <div 
                          className="flex items-start gap-3 cursor-pointer"
                          onClick={() => toggleReportExpansion(report.id)}
                        >
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <FileText className="h-5 w-5 md:h-6 md:w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 line-clamp-1">{report.title}</h3>
                                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span className="truncate">{report.student_name}</span>
                                  </div>
                                  <span className="text-gray-400">•</span>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Week {report.week_number}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge className={`${getStatusColor(report.status)} text-xs`}>
                                  {getStatusIcon(report.status)}
                                  <span className="ml-1 hidden sm:inline">{report.status.replace("_", " ")}</span>
                                </Badge>
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                            
                            {!isExpanded && (
                              <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                                {report.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Expanded View - FULL DETAILS */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t space-y-6">
                            {/* Description */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                Description
                              </h4>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-gray-700 leading-relaxed">{report.description}</p>
                              </div>
                            </div>

                            {/* Achievements */}
                            {report.achievements && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  Achievements
                                </h4>
                                <div className="bg-green-50 rounded-lg p-4">
                                  {Array.isArray(report.achievements) ? (
                                    <ul className="space-y-2">
                                      {report.achievements.map((achievement, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                          <span>{achievement}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-gray-700">{report.achievements}</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Challenges */}
                            {report.challenges && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-orange-600" />
                                  Challenges
                                </h4>
                                <div className="bg-orange-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-700 leading-relaxed">{report.challenges}</p>
                                </div>
                              </div>
                            )}

                            {/* Next Week Plan */}
                            {report.next_week_plan && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-blue-600" />
                                  Next Week Plan
                                </h4>
                                <div className="bg-blue-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-700 leading-relaxed">{report.next_week_plan}</p>
                                </div>
                              </div>
                            )}

                            {/* Student Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">{report.student_email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>Submitted: {new Date(report.submitted_date).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Attached File */}
                            {report.file_name && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-purple-600" />
                                  Attached Document
                                </h4>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <FileText className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                      <span className="text-sm font-medium text-purple-900 truncate">{report.file_name}</span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (report.file_url) {
                                          window.open(report.file_url, '_blank')
                                        }
                                      }}
                                      className="h-8 text-xs flex-shrink-0"
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      View
                                    </Button>
                                  </div>
                                  {report.file_size && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Size: {(report.file_size / 1024).toFixed(2)} KB
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Previous Teacher Comments (if exists) */}
                            {report.comments && (
                              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <h4 className="text-sm font-semibold text-amber-900 mb-2">Previous Teacher Comments</h4>
                                <p className="text-sm text-amber-800">{report.comments}</p>
                                {report.reviewed_date && (
                                  <p className="text-xs text-amber-600 mt-2">
                                    Reviewed on {new Date(report.reviewed_date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Teacher Review Section */}
                            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-blue-600" />
                                Add Your Comments
                              </h4>
                              <Textarea
                                placeholder="Write your feedback and comments here..."
                                value={teacherComments}
                                onChange={(e) => setTeacherComments(e.target.value)}
                                rows={4}
                                className="mb-4"
                                onClick={(e) => e.stopPropagation()}
                              />
                              
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUpdateReportStatus(report.id, "approved")
                                  }}
                                  disabled={reviewLoading}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {reviewLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUpdateReportStatus(report.id, "needs_revision")
                                  }}
                                  disabled={reviewLoading}
                                  className="bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                  {reviewLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                  )}
                                  Request Revision
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUpdateReportStatus(report.id, "rejected")
                                  }}
                                  disabled={reviewLoading}
                                  variant="destructive"
                                >
                                  {reviewLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteReport(report.id)
                                  }}
                                  disabled={deleteLoading}
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  {deleteLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                  )}
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}