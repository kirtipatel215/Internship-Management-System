"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Filter,
  Award,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Building,
  AlertTriangle,
  X,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  FileText,
  Star,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser, getCertificatesByTeacher, updateCertificateStatus } from "@/lib/data"
import { toast } from "sonner"

interface Certificate {
  id: number
  student_id: string
  student_name: string
  student_email: string
  student_roll_number: string
  title: string
  company_name: string
  position: string
  duration: string
  start_date: string
  end_date: string
  grade: string
  supervisor_name: string
  supervisor_email: string
  description: string
  skills: string
  projects: string
  submission_date: string
  status: "pending" | "approved" | "rejected"
  feedback?: string
  approved_date?: string
  file_name?: string
  file_url?: string
  file_size?: number
  created_at: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

export default function TeacherCertificatesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [showCertificateDialog, setShowCertificateDialog] = useState(false)
  const [showFullCertificateDialog, setShowFullCertificateDialog] = useState(false)
  const [teacherComments, setTeacherComments] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)

  const fetchCertificates = async (teacherId: string) => {
    try {
      console.log("📜 Fetching certificates for teacher:", teacherId)
      setRefreshing(true)
      const certificatesData = await getCertificatesByTeacher(teacherId)
      console.log(`✅ Loaded ${certificatesData.length} certificates`)
      setCertificates(certificatesData)
      setRefreshing(false)
    } catch (error) {
      console.error("💥 Error fetching certificates:", error)
      toast.error("Failed to fetch certificates")
      setCertificates([])
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)
        console.log("📊 Initializing teacher certificates page...")

        const currentUser = await getCurrentUser()
        setUser(currentUser)
        console.log("👤 Current user loaded:", currentUser.name)

        await fetchCertificates(currentUser.id)
      } catch (error) {
        console.error("⚠ Error initializing data:", error)
        toast.error("Failed to load data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [])

  const handleRefresh = async () => {
    if (!user) return
    await fetchCertificates(user.id)
    toast.success("Certificates refreshed successfully")
  }

  useEffect(() => {
    let filtered = certificates

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((certificate) => 
        certificate.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((certificate) => certificate.status === statusFilter)
    }

    // Company filter
    if (companyFilter !== "all") {
      filtered = filtered.filter((certificate) => certificate.company_name === companyFilter)
    }

    // Grade filter
    if (gradeFilter !== "all") {
      filtered = filtered.filter((certificate) => certificate.grade === gradeFilter)
    }

    setFilteredCertificates(filtered)
  }, [certificates, searchTerm, statusFilter, companyFilter, gradeFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200"
      case "pending":
        return "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200"
      case "rejected":
        return "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200"
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
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
        return "text-emerald-600 bg-emerald-100"
      case "A":
        return "text-blue-600 bg-blue-100"
      case "B+":
        return "text-orange-600 bg-orange-100"
      case "B":
        return "text-yellow-600 bg-yellow-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setTeacherComments(certificate.feedback || "")
    setShowCertificateDialog(true)
  }

  const handleViewFullCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setShowFullCertificateDialog(true)
  }

  const handleApproveCertificate = async (certificateId: number, action: "approved" | "rejected") => {
    if (!user) return

    try {
      setProcessingAction(true)
      console.log("🔄 Updating certificate status:", { certificateId, action })

      const result = await updateCertificateStatus(certificateId, action, teacherComments, user.id)

      if (result.success) {
        // Update local state
        setCertificates((prevCertificates) =>
          prevCertificates.map((certificate) =>
            certificate.id === certificateId
              ? {
                  ...certificate,
                  status: action,
                  feedback: teacherComments,
                  approved_date: action === "approved" ? new Date().toISOString() : undefined,
                }
              : certificate
          )
        )

        setShowCertificateDialog(false)
        setTeacherComments("")

        const actionText = action === "approved" ? "approved" : "rejected"
        toast.success(`Certificate ${actionText} successfully!`)

        // Refresh the certificates list
        await fetchCertificates(user.id)
      } else {
        toast.error(result.error || "Failed to update certificate status")
      }
    } catch (error: any) {
      console.error("⚠ Error updating certificate status:", error)
      toast.error(error.message || "Failed to update certificate status")
    } finally {
      setProcessingAction(false)
    }
  }

  const handleDownloadCertificate = (certificate: Certificate) => {
    // Create a comprehensive certificate content
    const certificateContent = `
CHARUSAT UNIVERSITY
INTERNSHIP COMPLETION CERTIFICATE

═══════════════════════════════════════

This is to certify that

${certificate.student_name.toUpperCase()}
Roll Number: ${certificate.student_roll_number}
Email: ${certificate.student_email}

has successfully completed the internship program at

${certificate.company_name.toUpperCase()}

Position: ${certificate.position}
Duration: ${certificate.duration}
Period: ${new Date(certificate.start_date).toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})} to ${new Date(certificate.end_date).toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

GRADE ACHIEVED: ${certificate.grade}

═══════════════════════════════════════

SUPERVISOR DETAILS:
Name: ${certificate.supervisor_name}
Email: ${certificate.supervisor_email}

INTERNSHIP DESCRIPTION:
${certificate.description}

SKILLS ACQUIRED:
${certificate.skills}

PROJECTS COMPLETED:
${certificate.projects}

═══════════════════════════════════════

${certificate.feedback ? `TEACHER EVALUATION:
${certificate.feedback}

` : ''}SUBMISSION DETAILS:
Submission Date: ${new Date(certificate.submission_date).toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
${certificate.approved_date ? `Approval Date: ${new Date(certificate.approved_date).toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}` : ''}
Status: ${certificate.status.toUpperCase()}

═══════════════════════════════════════

This certificate is issued by Charusat University
Training & Placement Office

Date of Issue: ${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

Authorized by: ${user?.name || 'Academic Department'}
Designation: ${user?.role?.toUpperCase() || 'FACULTY MEMBER'}

═══════════════════════════════════════

Note: This is a system-generated certificate.
For verification, please contact training@charusat.edu.in
    `

    const blob = new Blob([certificateContent], { type: "text/plain; charset=utf-8" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${certificate.student_name.replace(/\s+/g, "_")}_${certificate.company_name.replace(/\s+/g, "_")}_Certificate.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success(`Downloaded ${certificate.student_name}'s certificate`)
  }

  const uniqueCompanies = [...new Set(certificates.map((c) => c.company_name).filter(Boolean))]
  const activeFiltersCount = [statusFilter, companyFilter, gradeFilter].filter((f) => f !== "all").length

  // Calculate stats
  const stats = {
    total: certificates.length,
    pending: certificates.filter((c) => c.status === "pending").length,
    approved: certificates.filter((c) => c.status === "approved").length,
    rejected: certificates.filter((c) => c.status === "rejected").length,
  }

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
          <div className="p-4 md:p-6 space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Internship Certificates
                    </h1>
                    <p className="text-gray-600 text-sm md:text-lg">
                      Review and approve student internship completion certificates
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  title: "Total Certificates",
                  value: stats.total,
                  icon: Award,
                  color: "purple",
                  subtitle: "All submissions",
                },
                {
                  title: "Pending Review",
                  value: stats.pending,
                  icon: Clock,
                  color: "yellow",
                  subtitle: "Awaiting approval",
                },
                {
                  title: "Approved",
                  value: stats.approved,
                  icon: CheckCircle,
                  color: "emerald",
                  subtitle: "Successfully approved",
                },
                {
                  title: "Rejected",
                  value: stats.rejected,
                  icon: XCircle,
                  color: "red",
                  subtitle: "Need corrections",
                },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-${stat.color}-100`}>
                      <stat.icon className={`h-4 w-4 md:h-5 md:w-5 text-${stat.color}-600`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xl md:text-3xl font-bold mb-1 text-${stat.color}-600`}>{stat.value}</div>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <Filter className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">Filters & Search</CardTitle>
                    {activeFiltersCount > 0 && (
                      <Badge className="bg-purple-100 text-purple-700">{activeFiltersCount} active</Badge>
                    )}
                  </div>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                        setCompanyFilter("all")
                        setGradeFilter("all")
                      }}
                    >
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
                      placeholder="Search certificates..."
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
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={companyFilter} onValueChange={setCompanyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by company" />
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
                  <Select value={gradeFilter} onValueChange={setGradeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      <SelectItem value="A+">Grade A+</SelectItem>
                      <SelectItem value="A">Grade A</SelectItem>
                      <SelectItem value="B+">Grade B+</SelectItem>
                      <SelectItem value="B">Grade B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Certificates List */}
            <div className="space-y-4">
              {filteredCertificates.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-8 md:p-12 text-center">
                    <Award className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">
                      {certificates.length === 0 ? "No certificates found" : "No certificates match your filters"}
                    </h3>
                    <p className="text-gray-500">
                      {certificates.length === 0 
                        ? "Students haven't submitted any certificates yet" 
                        : "Try adjusting your search criteria or filters"
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredCertificates.map((certificate) => (
                  <Card
                    key={certificate.id}
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 md:gap-4 mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                              <Award className="h-5 w-5 md:h-6 md:w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                                  {certificate.student_name} - {certificate.title}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  <Badge className={getStatusColor(certificate.status)}>
                                    {getStatusIcon(certificate.status)}
                                    <span className="ml-1 capitalize">{certificate.status}</span>
                                  </Badge>
                                  <Badge className={`${getGradeColor(certificate.grade)} px-2 py-1`}>
                                    Grade {certificate.grade}
                                  </Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 md:gap-2 text-xs md:text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <User className="h-3 w-3 md:h-4 md:w-4" />
                                  <span>{certificate.student_roll_number}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Building className="h-3 w-3 md:h-4 md:w-4" />
                                  <span className="truncate">
                                    {certificate.company_name} - {certificate.position}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                                  <span>Duration: {certificate.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 md:h-4 md:w-4" />
                                  <span>Submitted: {new Date(certificate.submission_date).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed line-clamp-3">
                              {certificate.description?.length > 200
                                ? `${certificate.description.substring(0, 200)}...`
                                : certificate.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1 text-sm">Skills Acquired</h4>
                              <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{certificate.skills}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1 text-sm">Supervisor</h4>
                              <p className="text-xs md:text-sm text-gray-600">
                                {certificate.supervisor_name} ({certificate.supervisor_email})
                              </p>
                            </div>
                          </div>

                          {certificate.feedback && (
                            <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                              <p className="text-sm text-purple-800">
                                <strong>Teacher Comments:</strong> {certificate.feedback}
                              </p>
                            </div>
                          )}

                          {certificate.approved_date && (
                            <div className="mt-2 text-sm text-emerald-600">
                              <strong>Approved on:</strong> {new Date(certificate.approved_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button size="sm" onClick={() => handleViewFullCertificate(certificate)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Certificate
                          </Button>
                          <Button size="sm" onClick={() => handleViewCertificate(certificate)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadCertificate(certificate)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Full Certificate View Dialog */}
            <Dialog open={showFullCertificateDialog} onOpenChange={setShowFullCertificateDialog}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Award className="h-6 w-6 text-purple-600" />
                    Certificate Preview: {selectedCertificate?.student_name}
                  </DialogTitle>
                  <DialogDescription>
                    Full certificate details for {selectedCertificate?.title}
                  </DialogDescription>
                </DialogHeader>
                
                {selectedCertificate && (
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 pb-6">
                      {/* Certificate Header */}
                      <div className="text-center border-b pb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          CHARUSAT UNIVERSITY
                        </h2>
                        <p className="text-lg text-gray-600 mb-4">Internship Completion Certificate</p>
                        <Badge className={getStatusColor(selectedCertificate.status)} variant="outline" className="text-sm px-3 py-1">
                          {getStatusIcon(selectedCertificate.status)}
                          <span className="ml-1 capitalize">{selectedCertificate.status}</span>
                        </Badge>
                      </div>

                      {/* Student Information */}
                      <Card className="border-l-4 border-l-purple-500">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-purple-600" />
                            Student Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Full Name</Label>
                                <p className="text-lg font-medium text-gray-900">{selectedCertificate.student_name}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Roll Number</Label>
                                <p className="text-base text-gray-700">{selectedCertificate.student_roll_number}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Email Address</Label>
                                <p className="text-base text-gray-700 flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  {selectedCertificate.student_email}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Certificate Title</Label>
                                <p className="text-lg font-medium text-gray-900">{selectedCertificate.title}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Grade Achieved</Label>
                                <Badge className={`${getGradeColor(selectedCertificate.grade)} text-base px-3 py-1`}>
                                  <Star className="h-4 w-4 mr-1" />
                                  Grade {selectedCertificate.grade}
                                </Badge>
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Submission Date</Label>
                                <p className="text-base text-gray-700">
                                  {new Date(selectedCertificate.submission_date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Company & Internship Details */}
                      <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            Internship Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Company Name</Label>
                                <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                  <Building className="h-4 w-4" />
                                  {selectedCertificate.company_name}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Position</Label>
                                <p className="text-base text-gray-700">{selectedCertificate.position}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Duration</Label>
                                <p className="text-base text-gray-700 flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {selectedCertificate.duration}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Start Date</Label>
                                <p className="text-base text-gray-700">
                                  {new Date(selectedCertificate.start_date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">End Date</Label>
                                <p className="text-base text-gray-700">
                                  {new Date(selectedCertificate.end_date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Supervisor</Label>
                                <div className="space-y-1">
                                  <p className="text-base font-medium text-gray-900">{selectedCertificate.supervisor_name}</p>
                                  <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {selectedCertificate.supervisor_email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Internship Experience */}
                      <Card className="border-l-4 border-l-green-500">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-green-600" />
                            Internship Experience
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <Label className="text-sm font-semibold text-gray-600 mb-2 block">Description</Label>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                                {selectedCertificate.description}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-semibold text-gray-600 mb-2 block">Skills Acquired</Label>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-base text-gray-700 leading-relaxed">
                                {selectedCertificate.skills}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-semibold text-gray-600 mb-2 block">Projects Completed</Label>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                                {selectedCertificate.projects}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Teacher Evaluation */}
                      {selectedCertificate.feedback && (
                        <Card className="border-l-4 border-l-orange-500">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <User className="h-5 w-5 text-orange-600" />
                              Teacher Evaluation
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-orange-50 p-4 rounded-lg">
                              <p className="text-base text-gray-700 leading-relaxed">
                                {selectedCertificate.feedback}
                              </p>
                            </div>
                            {selectedCertificate.approved_date && (
                              <div className="mt-3 text-sm text-gray-600">
                                <strong>Approved on:</strong> {new Date(selectedCertificate.approved_date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* File Information */}
                      {selectedCertificate.file_name && (
                        <Card className="border-l-4 border-l-gray-500">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <FileText className="h-5 w-5 text-gray-600" />
                              Attached Files
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6 text-gray-600" />
                                <div>
                                  <p className="font-medium text-gray-900">{selectedCertificate.file_name}</p>
                                  {selectedCertificate.file_size && (
                                    <p className="text-sm text-gray-500">
                                      {(selectedCertificate.file_size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                  )}
                                </div>
                              </div>
                              {selectedCertificate.file_url && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={selectedCertificate.file_url} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Certificate Footer */}
                      <div className="text-center border-t pt-6">
                        <p className="text-sm text-gray-500 mb-2">This certificate is issued by Charusat University</p>
                        <p className="text-sm text-gray-500 mb-4">Training & Placement Office</p>
                        <div className="flex justify-center gap-4">
                          <Button onClick={() => handleDownloadCertificate(selectedCertificate)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Certificate
                          </Button>
                          <Button variant="outline" onClick={() => {
                            setShowFullCertificateDialog(false)
                            handleViewCertificate(selectedCertificate)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Review & Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                )}
              </DialogContent>
            </Dialog>

            {/* Certificate Review Dialog */}
            <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Award className="h-6 w-6 text-purple-600" />
                    Review Certificate: {selectedCertificate?.student_name}
                  </DialogTitle>
                  <DialogDescription>
                    Review and approve {selectedCertificate?.student_name}'s internship completion certificate
                  </DialogDescription>
                </DialogHeader>
                {selectedCertificate && (
                  <div className="space-y-6">
                    {/* Certificate Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Student Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{selectedCertificate.student_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Roll Number:</span>
                            <span className="font-medium">{selectedCertificate.student_roll_number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Company:</span>
                            <span className="font-medium">{selectedCertificate.company_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Position:</span>
                            <span className="font-medium">{selectedCertificate.position}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{selectedCertificate.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Grade:</span>
                            <Badge className={getGradeColor(selectedCertificate.grade)}>
                              {selectedCertificate.grade}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Internship Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Start Date:</span>
                            <span className="font-medium">
                              {new Date(selectedCertificate.start_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">End Date:</span>
                            <span className="font-medium">
                              {new Date(selectedCertificate.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Supervisor:</span>
                            <span className="font-medium">{selectedCertificate.supervisor_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Supervisor Email:</span>
                            <span className="font-medium text-sm">{selectedCertificate.supervisor_email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Submitted:</span>
                            <span className="font-medium">
                              {new Date(selectedCertificate.submission_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <Badge className={getStatusColor(selectedCertificate.status)}>
                              <span className="capitalize">{selectedCertificate.status}</span>
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Uploaded Certificate File */}
                    {selectedCertificate.file_name && (
                      <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Student Uploaded Certificate
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-blue-900">{selectedCertificate.file_name}</p>
                                  {selectedCertificate.file_size && (
                                    <p className="text-sm text-blue-600">
                                      {(selectedCertificate.file_size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {selectedCertificate.file_url && (
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() => window.open(selectedCertificate.file_url, '_blank')}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                )}
                                {selectedCertificate.file_url && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      const link = document.createElement('a')
                                      link.href = selectedCertificate.file_url!
                                      link.download = selectedCertificate.file_name!
                                      link.click()
                                      toast.success('File download started')
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-blue-700">
                              <strong>Uploaded:</strong> {new Date(selectedCertificate.submission_date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* No File Warning */}
                    {!selectedCertificate.file_name && (
                      <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 text-amber-700">
                            <AlertTriangle className="h-5 w-5" />
                            <div>
                              <p className="font-medium">No Certificate File Found</p>
                              <p className="text-sm text-amber-600">
                                This submission does not include an uploaded certificate file. Please request the student to upload the certificate document.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Certificate Content */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Certificate Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                          <p className="text-gray-700 leading-relaxed">{selectedCertificate.description}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Skills Acquired</h4>
                          <p className="text-gray-700 leading-relaxed">{selectedCertificate.skills}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Projects Completed</h4>
                          <p className="text-gray-700 leading-relaxed">{selectedCertificate.projects}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Teacher Review Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Your Review</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="comments">Comments & Feedback</Label>
                          <Textarea
                            id="comments"
                            placeholder="Provide comments for approval or rejection..."
                            value={teacherComments}
                            onChange={(e) => setTeacherComments(e.target.value)}
                            rows={4}
                            disabled={processingAction}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowCertificateDialog(false)
                          setTeacherComments("")
                        }}
                        disabled={processingAction}
                      >
                        Cancel
                      </Button>
                      {selectedCertificate.status === "pending" && (
                        <>
                          <Button
                            variant="destructive"
                            onClick={() => handleApproveCertificate(selectedCertificate.id, "rejected")}
                            disabled={processingAction}
                          >
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            {processingAction ? "Processing..." : "Reject Certificate"}
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                            onClick={() => handleApproveCertificate(selectedCertificate.id, "approved")}
                            disabled={processingAction}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            {processingAction ? "Processing..." : "Approve Certificate"}
                          </Button>
                        </>
                      )}
                      {selectedCertificate.status !== "pending" && (
                        <div className="text-sm text-gray-500 py-2">
                          This certificate has already been {selectedCertificate.status}.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}