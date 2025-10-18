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
import {
  Search,
  Filter,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Building,
  X,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  ExternalLink,
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
  const [companyFilter, setCompanyFilter] = useState("all")
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [showCertificateDialog, setShowCertificateDialog] = useState(false)
  const [showViewCertificateDialog, setShowViewCertificateDialog] = useState(false)
  const [teacherComments, setTeacherComments] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)
  const [expandedCertificates, setExpandedCertificates] = useState<Set<number>>(new Set())
  const [activeFilterTab, setActiveFilterTab] = useState("pending") // Changed from "all" to "pending"

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
        console.error("⚠️ Error initializing data:", error)
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

    // Active filter tab (replaces status filter)
    if (activeFilterTab !== "all") {
      filtered = filtered.filter((certificate) => certificate.status === activeFilterTab)
    }

    // Company filter
    if (companyFilter !== "all") {
      filtered = filtered.filter((certificate) => certificate.company_name === companyFilter)
    }

    setFilteredCertificates(filtered)
  }, [certificates, searchTerm, activeFilterTab, companyFilter])

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
        return <Clock className="h-4 w-4" />
    }
  }

  const toggleCertificateExpansion = (certificateId: number) => {
    setExpandedCertificates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(certificateId)) {
        newSet.delete(certificateId)
      } else {
        newSet.add(certificateId)
      }
      return newSet
    })
  }

  const handleViewFullCertificate = (certificate: Certificate) => {
    if (certificate.file_url) {
      // Open the actual uploaded certificate file
      window.open(certificate.file_url, '_blank')
    } else {
      toast.error("No certificate file uploaded")
    }
  }

  const handleApproveCertificate = async (certificateId: number, action: "approved" | "rejected") => {
    if (!user) return

    try {
      setProcessingAction(true)
      console.log("📄 Updating certificate status:", { certificateId, action })

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
      console.error("⚠️ Error updating certificate status:", error)
      toast.error(error.message || "Failed to update certificate status")
    } finally {
      setProcessingAction(false)
    }
  }

  const uniqueCompanies = [...new Set(certificates.map((c) => c.company_name).filter(Boolean))]

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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Internship Certificates
                    </h1>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                      Review and approve student certificates
                    </p>
                  </div>
                </div>
              </div>
              <Button size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {/* Stats Cards - Horizontal Scrolling */}
            <div className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
              <div className="flex gap-3 md:grid md:grid-cols-2 lg:grid-cols-4 min-w-max md:min-w-0">
                {[
                  {
                    title: "Total Certificates",
                    value: stats.total,
                    icon: Award,
                    color: "purple",
                    subtitle: "All submissions",
                    link: "all"
                  },
                  {
                    title: "Pending Review",
                    value: stats.pending,
                    icon: Clock,
                    color: "yellow",
                    subtitle: "Awaiting approval",
                    link: "pending"
                  },
                  {
                    title: "Approved",
                    value: stats.approved,
                    icon: CheckCircle,
                    color: "emerald",
                    subtitle: "Successfully approved",
                    link: "approved"
                  },
                  {
                    title: "Rejected",
                    value: stats.rejected,
                    icon: XCircle,
                    color: "red",
                    subtitle: "Need corrections",
                    link: "rejected"
                  },
                ].map((stat, index) => (
                  <Card
                    key={index}
                    className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex-shrink-0 w-[200px] md:w-auto ${
                      activeFilterTab === stat.link ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => setActiveFilterTab(stat.link)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                      <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-${stat.color}-100`}>
                        <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${stat.color}-600`} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                      <div className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-${stat.color}-600`}>{stat.value}</div>
                      <p className="text-xs text-gray-500">{stat.subtitle}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Filters - Responsive without horizontal scroll */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    <span className="text-sm sm:text-base font-semibold text-gray-700">Filters:</span>
                    {(searchTerm || companyFilter !== "all") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto h-8"
                        onClick={() => {
                          setSearchTerm("")
                          setCompanyFilter("all")
                        }}
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="text-xs sm:text-sm">Clear</span>
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search certificates..."
                        className="pl-10 text-sm h-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <Select value={companyFilter} onValueChange={setCompanyFilter}>
                      <SelectTrigger className="text-sm h-10 w-full">
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
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificates List - Minimal with Expandable Content */}
            <div className="space-y-3">
              {filteredCertificates.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6 sm:p-8 md:p-12 text-center">
                    <Award className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-600 mb-2">
                      {certificates.length === 0 ? "No certificates found" : "No certificates match your filters"}
                    </h3>
                    <p className="text-gray-500 text-sm md:text-base">
                      {certificates.length === 0 
                        ? "Students haven't submitted any certificates yet" 
                        : "Try adjusting your search criteria or filters"
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredCertificates.map((certificate) => {
                  const isExpanded = expandedCertificates.has(certificate.id)
                  
                  return (
                    <Card
                      key={certificate.id}
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <CardContent className="p-3 sm:p-4 md:p-5">
                        {/* Minimal Header - Always Visible */}
                        <div 
                          className="flex items-start justify-between gap-3 cursor-pointer"
                          onClick={() => toggleCertificateExpansion(certificate.id)}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <Award className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
                                  {certificate.student_name}
                                </h3>
                                <Badge className={`${getStatusColor(certificate.status)} w-fit`}>
                                  {getStatusIcon(certificate.status)}
                                  <span className="ml-1 capitalize text-xs">{certificate.status}</span>
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 text-xs md:text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {certificate.student_roll_number}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  <span className="truncate max-w-[120px] sm:max-w-none">{certificate.company_name}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {certificate.duration}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t space-y-4">
                            {/* Full Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Position</p>
                                  <p className="text-sm font-medium text-gray-900">{certificate.position}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Period</p>
                                  <p className="text-sm text-gray-700">
                                    {new Date(certificate.start_date).toLocaleDateString()} - {new Date(certificate.end_date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Email</p>
                                  <p className="text-sm text-gray-700 truncate">{certificate.student_email}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Submitted</p>
                                  <p className="text-sm text-gray-700">
                                    {new Date(certificate.submission_date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Internship Description</p>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg leading-relaxed">
                                {certificate.description}
                              </p>
                            </div>

                            {/* Skills */}
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Skills Acquired</p>
                              <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                                {certificate.skills}
                              </p>
                            </div>

                            {/* Projects */}
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Projects Completed</p>
                              <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                                {certificate.projects}
                              </p>
                            </div>

                            {/* Teacher Feedback */}
                            {certificate.feedback && (
                              <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                                <p className="text-xs text-purple-600 font-semibold mb-1">Teacher Comments</p>
                                <p className="text-sm text-purple-800">{certificate.feedback}</p>
                                {certificate.approved_date && (
                                  <p className="text-xs text-purple-600 mt-2">
                                    Reviewed on {new Date(certificate.approved_date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 pt-3">
                              {certificate.status === "pending" ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleViewFullCertificate(certificate)
                                    }}
                                    disabled={!certificate.file_url}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Document
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedCertificate(certificate)
                                      setTeacherComments("")
                                      setShowCertificateDialog(true)
                                    }}
                                  >
                                    <ThumbsDown className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedCertificate(certificate)
                                      setTeacherComments("")
                                      setShowCertificateDialog(true)
                                    }}
                                  >
                                    <ThumbsUp className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleViewFullCertificate(certificate)
                                    }}
                                    disabled={!certificate.file_url}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Document
                                  </Button>
                                  <div className="text-sm text-gray-600 text-center py-2 flex-1">
                                    Status: <span className="font-semibold capitalize">{certificate.status}</span>
                                  </div>
                                </>
                              )}
                            </div>
                            {!certificate.file_url && (
                              <p className="text-xs text-amber-600 text-center mt-2">
                                ⚠️ No certificate document uploaded
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>

            {/* Certificate Review Dialog - Simplified */}
            <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
              <DialogContent className="max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-base sm:text-lg">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    Review Certificate
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    {selectedCertificate?.student_name} - {selectedCertificate?.company_name}
                  </DialogDescription>
                </DialogHeader>
                {selectedCertificate && (
                  <div className="space-y-4">
                    {/* Quick Info */}
                    <Card className="bg-gray-50">
                      <CardContent className="p-3 sm:p-4 space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Student:</span>
                          <span className="font-medium">{selectedCertificate.student_name}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Roll Number:</span>
                          <span className="font-medium">{selectedCertificate.student_roll_number}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Company:</span>
                          <span className="font-medium truncate ml-2">{selectedCertificate.company_name}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Position:</span>
                          <span className="font-medium truncate ml-2">{selectedCertificate.position}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{selectedCertificate.duration}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={getStatusColor(selectedCertificate.status)}>
                            <span className="capitalize">{selectedCertificate.status}</span>
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Comments Section */}
                    <div className="space-y-2">
                      <Label htmlFor="comments" className="text-sm sm:text-base font-semibold">
                        Your Comments & Feedback
                      </Label>
                      <Textarea
                        id="comments"
                        placeholder="Provide your feedback for this certificate..."
                        value={teacherComments}
                        onChange={(e) => setTeacherComments(e.target.value)}
                        rows={4}
                        disabled={processingAction}
                        className="resize-none text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Your comments will be shared with the student
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        className="flex-1"
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
                            className="flex-1"
                            onClick={() => handleApproveCertificate(selectedCertificate.id, "rejected")}
                            disabled={processingAction}
                          >
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            {processingAction ? "Processing..." : "Reject"}
                          </Button>
                          <Button
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                            onClick={() => handleApproveCertificate(selectedCertificate.id, "approved")}
                            disabled={processingAction}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            {processingAction ? "Processing..." : "Approve"}
                          </Button>
                        </>
                      )}
                      {selectedCertificate.status !== "pending" && (
                        <div className="text-sm text-gray-600 text-center py-2 flex-1">
                          Already {selectedCertificate.status}
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