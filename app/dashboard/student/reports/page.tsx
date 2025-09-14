"use client"

import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Download, 
  FileText, 
  Calendar,
  Star,
  Eye,
  TrendingUp,
  Award,
  User,
  Building,
  Mail,
  Hash,
  Target,
  BookOpen,
  Filter,
  Search,
  MapPin,
  Briefcase,
  PlayCircle,
  StopCircle,
  Activity,
  BarChart3,
  ArrowRight,
  ChevronRight
} from "lucide-react"
import { useState, useEffect } from "react"
import { 
  getReportsByStudent, 
  createWeeklyReport, 
  getCurrentUser, 
  getApprovedInternshipsByStudent,
  downloadFile 
} from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

// Define interfaces
interface WeeklyReport {
  id: number
  internship_id?: number
  student_id?: string
  studentId?: string
  student_name?: string
  studentName?: string
  student_email?: string
  studentEmail?: string
  week_number?: number
  week?: number
  title: string
  description: string
  achievements: string[]
  status: 'pending' | 'approved' | 'revision_required'
  file_name?: string
  fileName?: string
  file_url?: string
  fileUrl?: string
  file_size?: number
  fileSize?: number
  feedback?: string
  grade?: string
  submitted_date?: string
  submittedDate?: string
  created_at?: string
  createdAt?: string
  comments?: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  department?: string
  rollNumber?: string
  loginTime?: string
}

interface Internship {
  id: number
  company_name: string
  internship_title?: string
  position: string
  start_date: string
  end_date: string
  duration: string
  status: 'approved'
  approved_date?: string
  approved_by?: string
}

export default function InternshipBasedWeeklyReports() {
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [showForm, setShowForm] = useState<boolean>(false)
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [internships, setInternships] = useState<Internship[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<string>("internships") // "internships" or "reports"
  const [loading, setLoading] = useState<boolean>(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const user = await getCurrentUser()
        if (user) {
          setCurrentUser(user)
          
          // Load user's approved internships
          const userInternships = await getApprovedInternshipsByStudent(user.id)
          setInternships(Array.isArray(userInternships) ? userInternships : [])
          
          // Load all reports for the user
          const userReports = await getReportsByStudent(user.id)
          setReports(Array.isArray(userReports) ? userReports : [])
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const getActiveInternships = () => {
    return internships.filter(internship => {
      const endDate = new Date(internship.end_date)
      const now = new Date()
      return endDate > now
    })
  }

  const getCompletedInternships = () => {
    return internships.filter(internship => {
      const endDate = new Date(internship.end_date)
      const now = new Date()
      return endDate <= now
    })
  }

  const getInternshipReports = (internshipId: number) => {
    return reports.filter(r => r.internship_id === internshipId)
  }

  const getReportStats = (internshipId: number) => {
    const internshipReports = getInternshipReports(internshipId)
    return {
      total: internshipReports.length,
      approved: internshipReports.filter(r => r.status === "approved").length,
      pending: internshipReports.filter(r => r.status === "pending").length,
      revisionRequired: internshipReports.filter(r => r.status === "revision_required").length
    }
  }

  const calculateProgress = (internship: Internship) => {
    const internshipReports = getInternshipReports(internship.id)
    const startDate = new Date(internship.start_date)
    const endDate = new Date(internship.end_date)
    const now = new Date()
    
    // Calculate expected weeks based on internship duration
    const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
    const weeksPassed = Math.min(
      Math.ceil((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)),
      totalWeeks
    )
    
    const expectedReports = Math.max(weeksPassed, 1)
    return Math.min((internshipReports.length / expectedReports) * 100, 100)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ['pdf', 'docx', 'doc']
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive",
        })
        e.target.value = ''
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        })
        e.target.value = ''
        return
      }

      setUploadedFile(file)
    }
  }

  const handleSubmitReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedInternship || !currentUser) return

    setIsSubmitting(true)
    const formData = new FormData(e.target as HTMLFormElement)

    try {
      const achievementsText = formData.get("achievements") as string
      const achievements = achievementsText
        .split("\n")
        .map(achievement => achievement.trim())
        .filter(achievement => achievement.length > 0)

      const existingReports = getInternshipReports(selectedInternship.id)
      const weekNumber = existingReports.length + 1

      const reportData = {
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        internshipId: selectedInternship.id,
        week: weekNumber,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        achievements,
        comments: (formData.get("comments") as string) || null,
      }

      const newReport = await createWeeklyReport(reportData, uploadedFile || undefined)

      // Normalize the new report data
      const normalizedNewReport: WeeklyReport = {
        ...newReport,
        internship_id: selectedInternship.id,
        week: weekNumber,
        week_number: weekNumber,
        studentId: currentUser.id,
        student_id: currentUser.id,
        studentName: currentUser.name,
        student_name: currentUser.name,
        studentEmail: currentUser.email,
        student_email: currentUser.email,
        fileName: newReport.file_name || newReport.fileName,
        fileUrl: newReport.file_url || newReport.fileUrl,
        fileSize: newReport.file_size || newReport.fileSize,
        submittedDate: newReport.submitted_date || newReport.submittedDate || new Date().toISOString()
      }

      setReports((prev) => [...prev, normalizedNewReport])
      setShowForm(false)
      setUploadedFile(null)

      toast({
        title: "Report Submitted Successfully!",
        description: `Your Week ${weekNumber} report for ${selectedInternship.company_name} has been submitted.`,
      })

      ;(e.target as HTMLFormElement).reset()
    } catch (error: any) {
      console.error('Report submission error:', error)
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownload = async (report: WeeklyReport) => {
    if (report.fileUrl || report.file_url) {
      const fileUrl = report.fileUrl || report.file_url || ''
      const fileName = report.fileName || report.file_name || `week_${report.week || report.week_number}_report.pdf`
      
      try {
        const result = await downloadFile(fileUrl, fileName)
        if (result.success) {
          toast({
            title: "Download Started",
            description: "Your file is being downloaded.",
          })
        } else {
          throw new Error(result.error || 'Download failed')
        }
      } catch (error) {
        toast({
          title: "Download Error",
          description: "Failed to download file. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Download Error",
        description: "File not available for download.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown date'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          variant: "default" as const,
          icon: <CheckCircle className="h-3 w-3" />,
          text: "Approved",
          color: "text-green-600"
        }
      case "revision_required":
        return {
          variant: "destructive" as const,
          icon: <AlertCircle className="h-3 w-3" />,
          text: "Needs Revision",
          color: "text-orange-600"
        }
      default:
        return {
          variant: "secondary" as const,
          icon: <Clock className="h-3 w-3" />,
          text: "Under Review",
          color: "text-blue-600"
        }
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'text-green-600 bg-green-100'
    if (grade === 'B' || grade === 'B+') return 'text-blue-600 bg-blue-100'
    if (grade === 'C') return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB'
    return Math.round(bytes / (1024 * 1024)) + ' MB'
  }

  const filteredReports = selectedInternship 
    ? getInternshipReports(selectedInternship.id).filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             report.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || report.status === statusFilter
        return matchesSearch && matchesStatus
      })
    : []

  const activeInternships = getActiveInternships()
  const completedInternships = getCompletedInternships()

  // Show loading state
  if (loading || !currentUser) {
    return (
      <AuthGuard allowedRoles={["student"]}>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading your reports...</p>
                <p className="text-sm text-gray-400">Please wait a moment</p>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-8 w-8" />
                  <h1 className="text-3xl font-bold">Weekly Reports</h1>
                </div>
                <p className="text-blue-100 mb-4">Track your internship progress by company</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{currentUser.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    <span>{currentUser.rollNumber}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{currentUser.department}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant={viewMode === "internships" ? "secondary" : "outline"}
                  onClick={() => {
                    setViewMode("internships")
                    setSelectedInternship(null)
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  View Internships
                </Button>
                
                {selectedInternship && activeInternships.some(i => i.id === selectedInternship.id) && (
                  <Button 
                    onClick={() => setShowForm(!showForm)} 
                    disabled={isSubmitting}
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
                    size="lg"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    New Report
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Internships Overview */}
          {viewMode === "internships" && (
            <div className="space-y-6">
              {/* Active Internships */}
              {activeInternships.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <PlayCircle className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Active Internships</h2>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {activeInternships.length} Active
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeInternships.map((internship) => {
                      const stats = getReportStats(internship.id)
                      const progress = calculateProgress(internship)
                      
                      return (
                        <Card key={internship.id} className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                                  {internship.company_name}
                                </CardTitle>
                                <CardDescription className="text-base text-gray-700 mb-2">
                                  {internship.position}
                                </CardDescription>
                                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(internship.start_date)} - {formatDate(internship.end_date)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{internship.duration}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <Activity className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-blue-50 rounded-lg p-3">
                                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                                  <p className="text-xs text-gray-600">Total Reports</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3">
                                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                                  <p className="text-xs text-gray-600">Approved</p>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-3">
                                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                                  <p className="text-xs text-gray-600">Pending</p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Progress</span>
                                  <span className="text-sm font-medium text-gray-900">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    setSelectedInternship(internship)
                                    setViewMode("reports")
                                  }}
                                  className="flex-1"
                                  size="sm"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Reports
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedInternship(internship)
                                    setShowForm(true)
                                  }}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Report
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Completed Internships */}
              {completedInternships.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <StopCircle className="h-6 w-6 text-gray-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Completed Internships</h2>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      {completedInternships.length} Completed
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {completedInternships.map((internship) => {
                      const stats = getReportStats(internship.id)
                      
                      return (
                        <Card key={internship.id} className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-gray-400">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                                  {internship.company_name}
                                </CardTitle>
                                <CardDescription className="text-base text-gray-700 mb-2">
                                  {internship.position}
                                </CardDescription>
                                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(internship.start_date)} - {formatDate(internship.end_date)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{internship.duration}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-blue-50 rounded-lg p-3">
                                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                                  <p className="text-xs text-gray-600">Total Reports</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3">
                                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                                  <p className="text-xs text-gray-600">Approved</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3">
                                  <p className="text-2xl font-bold text-purple-600">{internship.duration}</p>
                                  <p className="text-xs text-gray-600">Duration</p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Completion</span>
                                  <span className="text-sm font-medium text-gray-900">100%</span>
                                </div>
                                <Progress value={100} className="h-2" />
                              </div>
                              
                              <Button
                                onClick={() => {
                                  setSelectedInternship(internship)
                                  setViewMode("reports")
                                }}
                                className="w-full"
                                variant="outline"
                                size="sm"
                              >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Report History
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* No Internships State */}
              {internships.length === 0 && (
                <Card className="shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <Briefcase className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Internships Found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      You haven't been approved for any internships yet. Apply for internship opportunities to start submitting weekly reports.
                    </p>
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => window.location.href = '/dashboard/student/opportunities'}
                    >
                      <Search className="mr-2 h-5 w-5" />
                      Browse Opportunities
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Selected Internship Reports View */}
          {viewMode === "reports" && selectedInternship && (
            <div className="space-y-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setViewMode("internships")
                    setSelectedInternship(null)
                  }}
                  className="p-0 h-auto text-blue-600 hover:text-blue-800"
                >
                  Internships
                </Button>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-gray-900">{selectedInternship.company_name}</span>
              </div>

              {/* Selected Internship Header */}
              <Card className="shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building className="h-6 w-6 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-900">{selectedInternship.company_name}</h2>
                        <Badge className={activeInternships.some(i => i.id === selectedInternship.id) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {activeInternships.some(i => i.id === selectedInternship.id) ? (
                            <>
                              <Activity className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </>
                          )}
                        </Badge>
                      </div>
                      <p className="text-lg text-gray-700 mb-3">{selectedInternship.position}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(selectedInternship.start_date)} - {formatDate(selectedInternship.end_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{selectedInternship.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-gray-500" />
                          <span>{getReportStats(selectedInternship.id).approved} reports approved</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-gray-500" />
                          <span>{Math.round(calculateProgress(selectedInternship))}% progress</span>
                        </div>
                      </div>
                    </div>
                    
                    {activeInternships.some(i => i.id === selectedInternship.id) && (
                      <Button 
                        onClick={() => setShowForm(!showForm)} 
                        disabled={isSubmitting}
                        size="lg"
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Add Report
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit New Report Form */}
              {showForm && (
                <Card className="shadow-lg border-2 border-blue-100">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center gap-3">
                      <Upload className="h-6 w-6 text-blue-600" />
                      Submit Weekly Report - Week {getInternshipReports(selectedInternship.id).length + 1}
                    </CardTitle>
                    <CardDescription>
                      Upload your progress report for {selectedInternship.company_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmitReport} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Report Title *
                          </Label>
                          <Input 
                            id="title" 
                            name="title" 
                            placeholder="e.g., API Development and Testing" 
                            required 
                            disabled={isSubmitting}
                            className="transition-colors focus:border-blue-400"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="report-file" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Report File (PDF/DOCX)
                          </Label>
                          <Input 
                            id="report-file" 
                            type="file" 
                            accept=".pdf,.docx,.doc"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                            className="transition-colors"
                          />
                          {uploadedFile && (
                            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-700">
                                {uploadedFile.name} ({formatFileSize(uploadedFile.size)})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description" className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Work Description *
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Describe the tasks completed, challenges faced, and learning outcomes during this week..."
                          rows={4}
                          required
                          disabled={isSubmitting}
                          className="transition-colors focus:border-blue-400"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="achievements" className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Key Achievements *
                        </Label>
                        <Textarea
                          id="achievements"
                          name="achievements"
                          placeholder="• Completed user authentication module&#10;• Fixed 5 critical bugs&#10;• Learned Redux state management"
                          rows={3}
                          required
                          disabled={isSubmitting}
                          className="transition-colors focus:border-blue-400"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="comments" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Additional Comments (Optional)
                        </Label>
                        <Textarea
                          id="comments"
                          name="comments"
                          placeholder="Any additional notes, questions for your mentor, or feedback..."
                          rows={2}
                          disabled={isSubmitting}
                          className="transition-colors focus:border-blue-400"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={isSubmitting} className="flex-1 md:flex-none" size="lg">
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Submit Report
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          type="button" 
                          onClick={() => {
                            setShowForm(false)
                            setUploadedFile(null)
                          }}
                          disabled={isSubmitting}
                          size="lg"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="revision_required">Needs Revision</option>
                    </select>
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'} found
                </Badge>
              </div>

              {/* Reports Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Reports</p>
                        <p className="text-2xl font-bold text-gray-900">{getInternshipReports(selectedInternship.id).length}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Approved</p>
                        <p className="text-2xl font-bold text-green-600">{getReportStats(selectedInternship.id).approved}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Under Review</p>
                        <p className="text-2xl font-bold text-orange-600">{getReportStats(selectedInternship.id).pending}</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Progress</p>
                        <p className="text-2xl font-bold text-purple-600">{Math.round(calculateProgress(selectedInternship))}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reports List */}
              <div className="space-y-4">
                {filteredReports.map((report) => {
                  const statusConfig = getStatusConfig(report.status)
                  return (
                    <Card key={report.id} className="shadow-sm hover:shadow-md transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-blue-600">{report.week_number || report.week}</span>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.title}</h3>
                                <div className="flex items-center gap-2">
                                  <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                                    {statusConfig.icon}
                                    {statusConfig.text}
                                  </Badge>
                                  {report.grade && (
                                    <Badge variant="outline" className={`${getGradeColor(report.grade)} font-bold`}>
                                      <Star className="h-3 w-3 mr-1" />
                                      {report.grade}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Submitted: {formatDate(report.submitted_date || report.submittedDate || '')}</span>
                              </div>
                              {(report.file_name || report.fileName) && (
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  <span>{report.file_name || report.fileName}</span>
                                </div>
                              )}
                              {report.achievements && report.achievements.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Award className="h-4 w-4" />
                                  <span>{report.achievements.length} achievements</span>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-gray-700 line-clamp-2 mb-3">{report.description}</p>

                            {report.feedback && (
                              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <MessageSquare className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-600">Mentor Feedback:</span>
                                </div>
                                <p className="text-sm text-blue-800">{report.feedback}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-6">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-lg font-bold text-blue-600">{report.week_number || report.week}</span>
                                    </div>
                                    Week {report.week_number || report.week}: {report.title}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {selectedInternship.company_name} - {selectedInternship.position}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-6 mt-6">
                                  <div className="flex items-center gap-4">
                                    <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                                      {statusConfig.icon}
                                      {statusConfig.text}
                                    </Badge>
                                    {report.grade && (
                                      <Badge variant="outline" className={`${getGradeColor(report.grade)} text-lg px-3 py-1`}>
                                        <Star className="h-4 w-4 mr-1" />
                                        Grade: {report.grade}
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <Building className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm text-gray-600">Company:</span>
                                      <span className="font-medium">{selectedInternship.company_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Briefcase className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm text-gray-600">Position:</span>
                                      <span className="font-medium">{selectedInternship.position}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm text-gray-600">Submitted:</span>
                                      <span className="font-medium">{formatDate(report.submitted_date || report.submittedDate || '')}</span>
                                    </div>
                                    {(report.file_name || report.fileName) && (
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">File:</span>
                                        <span className="font-medium">{report.file_name || report.fileName}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                      <BookOpen className="h-5 w-5 text-blue-600" />
                                      Work Description
                                    </h4>
                                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                      <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
                                    </div>
                                  </div>

                                  {report.achievements && report.achievements.length > 0 && (
                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Award className="h-5 w-5 text-yellow-600" />
                                        Key Achievements ({report.achievements.length})
                                      </h4>
                                      <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                        <ul className="space-y-2">
                                          {report.achievements.map((achievement, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                              <span className="text-gray-700">{achievement}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  {report.comments && (
                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-purple-600" />
                                        Additional Comments
                                      </h4>
                                      <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                        <p className="text-gray-700 whitespace-pre-wrap">{report.comments}</p>
                                      </div>
                                    </div>
                                  )}

                                  {report.feedback && (
                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-blue-600" />
                                        Mentor Feedback
                                      </h4>
                                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-blue-800 whitespace-pre-wrap">{report.feedback}</p>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex gap-3 pt-4 border-t">
                                    {(report.file_url || report.fileUrl) && (
                                      <Button 
                                        variant="outline" 
                                        onClick={() => handleDownload(report)}
                                        className="flex-1"
                                      >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download File
                                      </Button>
                                    )}
                                    {report.status === "revision_required" && (
                                      <Button className="flex-1">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Resubmit Report
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            {(report.file_url || report.fileUrl) && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDownload(report)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Empty State for Reports */}
              {filteredReports.length === 0 && getInternshipReports(selectedInternship.id).length === 0 && (
                <Card className="shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Start documenting your progress at {selectedInternship.company_name} by submitting your first weekly report.
                    </p>
                    {activeInternships.some(i => i.id === selectedInternship.id) && (
                      <Button 
                        onClick={() => setShowForm(true)}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Submit Your First Report
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* No Search Results */}
              {filteredReports.length === 0 && getInternshipReports(selectedInternship.id).length > 0 && (
                <Card className="shadow-sm">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
                    <p className="text-gray-600 mb-4">
                      No reports match your current search criteria.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}