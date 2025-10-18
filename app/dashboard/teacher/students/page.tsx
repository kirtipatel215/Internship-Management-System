"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  Building,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  Award,
  X,
  Send,
  Star,
  GraduationCap,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser, getStudentsByTeacher, getStudentDetails, sendMessageToStudent } from "@/lib/data"
import { toast } from "sonner"
import Link from "next/link"

interface Student {
  id: string
  name: string
  email: string
  rollNumber: string
  department: string
  phone: string
  company?: string
  position?: string
  supervisor?: string
  startDate?: string
  endDate?: string
  progress: number
  status: 'active' | 'completed' | 'inactive'
  reportsSubmitted: number
  totalReports: number
  lastActivity: string
  profileImage?: string
  certificates: number
}

export default function TeacherStudentsPage() {
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [progressFilter, setProgressFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null)
  const [studentDetailsCache, setStudentDetailsCache] = useState<{[key: string]: any}>({})
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, statusFilter, companyFilter, progressFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📄 Loading teacher data and students...')
      
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      if (currentUser?.id) {
        const studentsData = await getStudentsByTeacher(currentUser.id)
        setStudents(studentsData)
        console.log('📊 Loaded students:', studentsData.length)
      }
    } catch (error: any) {
      console.error('💥 Error loading data:', error)
      setError('Failed to load students data. Please try again.')
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    const filtered = students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.company && student.company.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "all" || student.status === statusFilter

      const matchesCompany = companyFilter === "all" || student.company === companyFilter

      const matchesProgress =
        progressFilter === "all" ||
        (progressFilter === "high" && student.progress >= 80) ||
        (progressFilter === "medium" && student.progress >= 50 && student.progress < 80) ||
        (progressFilter === "low" && student.progress < 50)

      return matchesSearch && matchesStatus && matchesCompany && matchesProgress
    })
    setFilteredStudents(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCompanyFilter("all")
    setProgressFilter("all")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200"
      case "completed":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200"
      case "inactive":
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200"
      default:
        return "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-emerald-600"
    if (progress >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getGradientAvatar = (name: string, index: number) => {
    const gradients = [
      "bg-gradient-to-br from-blue-400 to-purple-500",
      "bg-gradient-to-br from-emerald-400 to-teal-500",
      "bg-gradient-to-br from-orange-400 to-pink-500",
      "bg-gradient-to-br from-indigo-400 to-blue-500",
      "bg-gradient-to-br from-rose-400 to-red-500",
      "bg-gradient-to-br from-purple-400 to-indigo-500",
      "bg-gradient-to-br from-teal-400 to-cyan-500",
      "bg-gradient-to-br from-yellow-400 to-orange-500",
    ]
    return gradients[index % gradients.length]
  }

  const uniqueCompanies = [...new Set(students.map((s) => s.company).filter(Boolean))]
  const activeFiltersCount = [statusFilter, companyFilter, progressFilter].filter((f) => f !== "all").length

  const handleDownloadCSV = () => {
    const csvContent = `Name,Email,Roll Number,Department,Company,Position,Progress,Status,Reports Submitted,Last Activity
${filteredStudents
  .map(
    (student) =>
      `${student.name},${student.email},${student.rollNumber},${student.department},${student.company || "N/A"},${
        student.position || "N/A"
      },${student.progress}%,${student.status},${student.reportsSubmitted}/${student.totalReports},${
        student.lastActivity
      }`
  )
  .join("\n")}`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `students_report_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("CSV report downloaded successfully!")
  }

  const toggleStudentExpand = async (studentId: string) => {
    const newExpandedId = expandedStudentId === studentId ? null : studentId
    setExpandedStudentId(newExpandedId)
    
    if (newExpandedId && !studentDetailsCache[studentId]) {
      setLoadingDetailsId(studentId)
      try {
        const details = await getStudentDetails(studentId)
        setStudentDetailsCache(prev => ({
          ...prev,
          [studentId]: details
        }))
      } catch (error) {
        console.error('Error loading student details:', error)
        toast.error('Failed to load student details')
      } finally {
        setLoadingDetailsId(null)
      }
    }
  }

  if (loading) {
    return (
      <AuthGuard allowedRoles={["teacher"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-600">Loading students data...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowedRoles={["teacher"]}>
      <DashboardLayout>
        <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Students</h1>
              <p className="text-sm sm:text-base text-gray-600">Monitor and guide your assigned students</p>
              {user && (
                <p className="text-xs sm:text-sm text-blue-600 mt-1">
                  {user.name} ({user.email})
                </p>
              )}
            </div>
            <Button onClick={handleDownloadCSV} disabled={filteredStudents.length === 0} size="sm" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="flex-1">{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadData}
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Cards with Hyperlinks */}
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="flex gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4 min-w-max sm:min-w-0">
              {[
                {
                  title: "Total Students",
                  value: students.length,
                  icon: Users,
                  color: "blue",
                  subtitle: "Under guidance",
                  filter: "all",
                },
                {
                  title: "Active",
                  value: students.filter((s) => s.status === "active").length,
                  icon: TrendingUp,
                  color: "emerald",
                  subtitle: "Ongoing",
                  filter: "active",
                },
                {
                  title: "Completed",
                  value: students.filter((s) => s.status === "completed").length,
                  icon: Award,
                  color: "purple",
                  subtitle: "Finished",
                  filter: "completed",
                },
                {
                  title: "Avg Progress",
                  value: students.length > 0 
                    ? `${Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)}%`
                    : "0%",
                  icon: FileText,
                  color: "orange",
                  subtitle: "Overall",
                  filter: null,
                },
              ].map((stat, index) => (
                <Card 
                  key={index} 
                  className={`hover:shadow-md transition-all min-w-[160px] sm:min-w-0 ${stat.filter ? 'cursor-pointer hover:scale-105' : ''}`}
                  onClick={() => stat.filter && setStatusFilter(stat.filter)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                    <CardTitle className="text-xs sm:text-sm font-medium">{stat.title}</CardTitle>
                    <div className="flex items-center gap-1">
                      <stat.icon className={`h-4 w-4 text-${stat.color}-500`} />
                      {stat.filter && <ExternalLink className="h-3 w-3 text-gray-400" />}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Filters & Search</span>
                  <span className="sm:hidden">Filters</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </CardTitle>
                {activeFiltersCount > 0 && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {/* Mobile: Single row with horizontal scroll */}
              <div className="flex sm:hidden gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="min-w-[200px] flex-1"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="min-w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="min-w-[120px]">
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {uniqueCompanies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={progressFilter} onValueChange={setProgressFilter}>
                  <SelectTrigger className="min-w-[120px]">
                    <SelectValue placeholder="Progress" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">High (80%+)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low (&lt;50%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop: Grid layout */}
              <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Students</Label>
                  <Input
                    id="search"
                    placeholder="Search by name, roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Select value={companyFilter} onValueChange={setCompanyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Companies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {uniqueCompanies.map((company) => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Progress</Label>
                  <Select value={progressFilter} onValueChange={setProgressFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Progress" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Progress</SelectItem>
                      <SelectItem value="high">High (80%+)</SelectItem>
                      <SelectItem value="medium">Medium (50-79%)</SelectItem>
                      <SelectItem value="low">Low (&lt;50%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <div className="space-y-3 sm:space-y-4">
            {filteredStudents.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32 p-4">
                  <div className="text-center">
                    <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-gray-500 mb-2">No students found</p>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Try adjusting your filters
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredStudents.map((student, index) => {
                const isExpanded = expandedStudentId === student.id
                const studentDetails = studentDetailsCache[student.id]
                const isLoadingDetails = loadingDetailsId === student.id
                
                return (
                  <Card key={student.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-6">
                      {/* Header - Always visible */}
                      <div 
                        className="flex items-start gap-3 sm:gap-4 cursor-pointer"
                        onClick={() => toggleStudentExpand(student.id)}
                      >
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${getGradientAvatar(student.name, index)}`}>
                          {student.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-base sm:text-lg">{student.name}</h3>
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600">{student.rollNumber} • {student.department}</p>
                          
                          {/* Active Internship Info */}
                          {student.company && (
                            <div className="mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 sm:p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Building className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                                <span className="font-medium text-xs sm:text-sm text-blue-900">{student.company}</span>
                                <Badge className={`${getStatusColor(student.status)} text-xs`}>
                                  {student.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-blue-700 ml-5 sm:ml-6">{student.position}</p>
                            </div>
                          )}
                          
                          {!student.company && (
                            <div className="mt-2 flex items-center gap-2">
                              <Badge className={`${getStatusColor(student.status)} text-xs`}>
                                {student.status}
                              </Badge>
                              <span className="text-xs text-gray-500">No active internship</span>
                            </div>
                          )}
                          
                          {/* Progress bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700">Progress</span>
                              <span className={`text-xs font-semibold ${getProgressColor(student.progress)}`}>
                                {student.progress}%
                              </span>
                            </div>
                            <Progress value={student.progress} className="h-1.5 sm:h-2" />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 border-t pt-4">
                          {isLoadingDetails ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                              <span className="text-sm text-gray-600">Loading details...</span>
                            </div>
                          ) : (
                            <>
                              {/* Personal Information */}
                              <div>
                                <h4 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4" />
                                  Personal Information
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Mail className="w-4 h-4 flex-shrink-0" />
                                      <span className="truncate">{student.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Phone className="w-4 h-4 flex-shrink-0" />
                                      <span>{student.phone}</span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="font-medium text-gray-700">Department:</span>
                                      <span className="text-gray-900">{student.department}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Internship Details */}
                              {student.company && (
                                <div>
                                  <h4 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    Internship Details
                                  </h4>
                                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div className="flex justify-between">
                                        <span className="font-medium text-gray-700">Company:</span>
                                        <span className="text-gray-900">{student.company}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-medium text-gray-700">Position:</span>
                                        <span className="text-gray-900">{student.position}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-medium text-gray-700">Status:</span>
                                        <Badge className={getStatusColor(student.status)}>
                                          {student.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>Start: {student.startDate ? new Date(student.startDate).toLocaleDateString() : 'N/A'}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>End: {student.endDate ? new Date(student.endDate).toLocaleDateString() : 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Progress Overview */}
                              <div>
                                <h4 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4" />
                                  Progress Overview
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{student.progress}%</div>
                                    <p className="text-xs text-blue-700 mt-1">Overall Progress</p>
                                  </div>
                                  <div className="bg-green-50 rounded-lg p-3 text-center">
                                    <div className="text-xl sm:text-2xl font-bold text-green-600">{student.reportsSubmitted}</div>
                                    <p className="text-xs text-green-700 mt-1">Submitted Reports</p>
                                  </div>
                                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                                    <div className="text-xl sm:text-2xl font-bold text-orange-600">{student.certificates}</div>
                                    <p className="text-xs text-orange-700 mt-1">Certificates</p>
                                  </div>
                                </div>
                              </div>

                              {/* Additional Statistics */}
                              {studentDetails?.stats && (
                                <div>
                                  <h4 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Detailed Statistics
                                  </h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-sm">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                      <div className="font-semibold text-blue-700 text-base">{studentDetails.stats.totalApplications}</div>
                                      <div className="text-blue-600 text-xs">Applications</div>
                                    </div>
                                    <div className="bg-yellow-50 p-3 rounded-lg">
                                      <div className="font-semibold text-yellow-700 text-base">{studentDetails.stats.pendingReports}</div>
                                      <div className="text-yellow-600 text-xs">Pending</div>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                      <div className="font-semibold text-green-700 text-base">{studentDetails.stats.approvedReports}</div>
                                      <div className="text-green-600 text-xs">Approved</div>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-lg">
                                      <div className="font-semibold text-purple-700 text-base">{studentDetails.stats.totalCertificates}</div>
                                      <div className="text-purple-600 text-xs">Total Certs</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Last Activity */}
                              <div className="text-xs text-gray-500 flex items-center gap-1 pt-2 border-t">
                                <Calendar className="w-3 h-3" />
                                <span>Last activity: {new Date(student.lastActivity).toLocaleDateString()}</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}