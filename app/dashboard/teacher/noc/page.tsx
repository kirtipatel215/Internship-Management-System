"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Download,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Eye,
  Building,
  Loader2,
  RefreshCw,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Search,
  ExternalLink,
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"

import { getTeacherNOCRequests, updateNOCStatus, getCurrentUser } from "@/lib/data"

interface NOCRequest {
  id: number
  student_id: string
  student_name: string
  student_email: string
  company_name: string
  position: string
  duration: string
  start_date: string
  end_date?: string
  submitted_date: string
  tp_approved_date?: string
  teacher_approved_date?: string
  reviewed_date?: string
  status: "pending" | "tp_approved" | "teacher_approved" | "rejected" | "pending_teacher_approval" | "approved"
  description: string
  feedback?: string
  teacher_feedback?: string
  // Supports either array of urls (string) or objects { url, name }
  documents: Array<string | { url: string; name?: string }>
  company_verified?: boolean
  tp_officer_feedback?: string
}

interface NOCStats {
  pendingTeacherApproval: number
  teacherApproved: number
  teacherRejected: number
  totalNOCs: number
  thisMonth: number
}

export default function TeacherNOC() {
  // State Management
  const [selectedNOC, setSelectedNOC] = useState<number | null>(null)
  const [feedback, setFeedback] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchText, setSearchText] = useState("") // NEW: search text
  const [nocRequests, setNocRequests] = useState<NOCRequest[]>([])
  const [stats, setStats] = useState<NOCStats>({
    pendingTeacherApproval: 0,
    teacherApproved: 0,
    teacherRejected: 0,
    totalNOCs: 0,
    thisMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchNOCData()
    }
  }, [currentUser])

  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  const fetchNOCData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] 🔄 Fetching NOC requests for teacher approval...")

      const nocData = await getTeacherNOCRequests(currentUser?.id || "teacher_1")

      if (!nocData || !Array.isArray(nocData)) {
        throw new Error("Failed to fetch NOC data")
      }

      const statsData = {
        pendingTeacherApproval: nocData.filter((req: NOCRequest) => req.status === "pending_teacher_approval").length,
        teacherApproved: nocData.filter(
          (req: NOCRequest) => req.status === "approved" || req.status === "teacher_approved",
        ).length,
        teacherRejected: nocData.filter((req: NOCRequest) => req.status === "rejected" && req.teacher_feedback).length,
        totalNOCs: nocData.length,
        thisMonth: nocData.filter((req) => {
          const submittedDate = new Date(req.submitted_date)
          const now = new Date()
          return submittedDate.getMonth() === now.getMonth() && submittedDate.getFullYear() === now.getFullYear()
        }).length,
      }

      setStats(statsData)
      setNocRequests(nocData)
      console.log("[v0] ✅ Successfully loaded", nocData.length, "NOC requests for teacher review")
    } catch (error: any) {
      console.error("[v0] ❌ Error fetching NOC data:", error)
      setError(error.message || "Failed to load NOC data")

      // Fallback to mock data
      const mockStats = {
        pendingTeacherApproval: 8,
        teacherApproved: 45,
        teacherRejected: 3,
        totalNOCs: 56,
        thisMonth: 12,
      }

      setStats(mockStats)
      setNocRequests(generateMockTeacherNOCRequests(15))

      toast.error("Using offline data due to connection issues")
    } finally {
      setLoading(false)
    }
  }

  // Generate mock NOC requests for teacher approval
  const generateMockTeacherNOCRequests = (count: number): NOCRequest[] => {
    const mockData: NOCRequest[] = [
      {
        id: 1,
        student_id: "student_1",
        student_name: "Alex Kumar",
        student_email: "alex.kumar@charusat.edu.in",
        company_name: "TechCorp Solutions",
        position: "Software Development Intern",
        duration: "6 months",
        start_date: "2024-04-01",
        submitted_date: "2024-03-25",
        tp_approved_date: "2024-03-27",
        status: "pending_teacher_approval",
        description:
          "Full-stack web development using React and Node.js. Student will work on real client projects and learn industry best practices.",
        company_verified: true,
        documents: [
          "https://example.com/docs/alex-offer-letter.pdf",
          { url: "https://example.com/docs/techcorp-profile.pdf", name: "company_profile.pdf" },
        ],
        tp_officer_feedback: "Company verified and documents are in order. Approved for teacher review.",
      },
      {
        id: 2,
        student_id: "student_2",
        student_name: "Priya Sharma",
        student_email: "priya.sharma@charusat.edu.in",
        company_name: "DataFlow Inc",
        position: "Data Analyst Intern",
        duration: "4 months",
        start_date: "2024-04-15",
        submitted_date: "2024-03-24",
        tp_approved_date: "2024-03-26",
        status: "pending_teacher_approval",
        description:
          "Data analysis and visualization using Python and Tableau. Focus on machine learning applications in business intelligence.",
        company_verified: true,
        documents: [
          "https://example.com/docs/priya-offer.pdf",
          { url: "https://example.com/docs/project-outline.pdf", name: "project_outline.pdf" },
        ],
        tp_officer_feedback: "Excellent opportunity for data science learning. Company has good reputation.",
      },
      {
        id: 3,
        student_id: "student_3",
        student_name: "Raj Patel",
        student_email: "raj.patel@charusat.edu.in",
        company_name: "Creative Studios",
        position: "UI/UX Design Intern",
        duration: "3 months",
        start_date: "2024-03-20",
        submitted_date: "2024-03-18",
        tp_approved_date: "2024-03-20",
        teacher_approved_date: "2024-03-22",
        status: "approved",
        description: "User interface design and user experience research for mobile and web applications.",
        company_verified: true,
        documents: [
          "https://example.com/docs/raj-offer.pdf",
          { url: "https://example.com/docs/creative-project-details.pdf", name: "project_details.pdf" },
        ],
        tp_officer_feedback: "Company is in our approved list. Good learning opportunity.",
        teacher_feedback: "Excellent alignment with student's academic focus on HCI. Approved for internship.",
      },
      {
        id: 4,
        student_id: "student_4",
        student_name: "Neha Singh",
        student_email: "neha.singh@charusat.edu.in",
        company_name: "Marketing Solutions Ltd",
        position: "Digital Marketing Intern",
        duration: "4 months",
        start_date: "2024-04-10",
        submitted_date: "2024-03-18",
        tp_approved_date: "2024-03-20",
        reviewed_date: "2024-03-22",
        status: "rejected",
        description: "Digital marketing and social media management with focus on content creation.",
        company_verified: true,
        documents: ["https://example.com/docs/neha-offer.pdf"],
        tp_officer_feedback: "Company verified and opportunity looks good.",
        teacher_feedback:
          "This internship does not align with the student's Computer Engineering curriculum. Please find a more technical role.",
      },
    ]

    // Extend array to match count
    const extended: NOCRequest[] = []
    for (let i = 0; i < count; i++) {
      const baseIndex = i % mockData.length
      const item = { ...mockData[baseIndex] }
      item.id = i + 1
      item.student_id = `student_${i + 1}`
      item.student_name = `${item.student_name.split(" ")[0]} ${i + 1}`
      extended.push(item)
    }

    return extended
  }

  const handleTeacherNOCAction = async (nocId: number, action: "approve" | "reject") => {
    try {
      setProcessing(nocId)

      const feedbackText = feedback.trim()
      if (!feedbackText) {
        toast.error("Please provide feedback for your decision")
        return
      }

      const approverId = currentUser?.id || "teacher_1"

      console.log(`[v0] 🔄 Teacher ${action === "approve" ? "approving" : "rejecting"} NOC request ${nocId}`)

      const newStatus = action === "approve" ? "approved" : "rejected"
      const result = await updateNOCStatus(nocId, newStatus, feedbackText, approverId, "teacher")

      if (result.success) {
        // Update local state
        setNocRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.id === nocId
              ? {
                  ...req,
                  status: newStatus,
                  teacher_feedback: feedbackText,
                  reviewed_date: new Date().toISOString(),
                  ...(action === "approve" && { teacher_approved_date: new Date().toISOString() }),
                }
              : req,
          ),
        )

        // Update stats
        setStats((prevStats) => ({
          ...prevStats,
          pendingTeacherApproval: Math.max(0, prevStats.pendingTeacherApproval - 1),
          [action === "approve" ? "teacherApproved" : "teacherRejected"]:
            prevStats[action === "approve" ? "teacherApproved" : "teacherRejected"] + 1,
        }))

        // Reset form
        setSelectedNOC(null)
        setFeedback("")

        const message =
          action === "approve"
            ? "NOC request approved - Student can now proceed with internship"
            : "NOC request rejected due to academic concerns"

        toast.success(message)
        console.log("[v0] ✅ Teacher NOC decision recorded successfully")
      } else {
        throw new Error(result.error || `Failed to ${action} request`)
      }
    } catch (error: any) {
      console.error(`[v0] ❌ Error ${action === "approve" ? "approving" : "rejecting"} NOC:`, error)
      toast.error(error.message || `Failed to ${action} request`)
    } finally {
      setProcessing(null)
    }
  }

  // Helpers to normalize doc URLs and names
  const getDocUrl = (doc: string | { url: string; name?: string }) =>
    typeof doc === "string" ? doc : doc?.url

  const getDocName = (doc: string | { url: string; name?: string }, index: number) =>
    typeof doc === "string" ? doc.split("/").pop() || `Document ${index + 1}` : doc?.name || `Document ${index + 1}`

  const openDoc = (doc: string | { url: string; name?: string }) => {
    const url = getDocUrl(doc)
    if (!url) {
      toast.error("Document URL not available")
      return
    }
    window.open(url, "_blank", "noopener,noreferrer")
  }

  // Status filter
  const statusFiltered = useMemo(() => {
    if (filterStatus === "all") return nocRequests
    if (filterStatus === "pending")
      return nocRequests.filter((req) => req.status === "pending_teacher_approval")
    if (filterStatus === "approved")
      return nocRequests.filter((req) => req.status === "approved" || req.status === "teacher_approved")
    return nocRequests.filter((req) => req.status === "rejected" && req.teacher_feedback)
  }, [nocRequests, filterStatus])

  // Search filter (client-side)
  const filteredRequests = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    if (!q) return statusFiltered
    return statusFiltered.filter((r) => {
      const haystack = [
        r.student_name,
        r.student_email,
        r.company_name,
        r.position,
        r.description,
        r.duration,
        r.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [statusFiltered, searchText])

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading NOC requests...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="teacher">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NOC Academic Approval</h1>
            <p className="text-gray-600">Review and provide academic approval for student internship requests</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search box */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search name, company, role..."
                className="pl-9"
              />
            </div>
            {/* Status filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending My Approval</SelectItem>
                <SelectItem value="approved">Approved by Me</SelectItem>
                <SelectItem value="rejected">Rejected by Me</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchNOCData} disabled={loading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-red-800">{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNOCData}
              className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
            >
              Retry
            </Button>
          </div>
        )}

        {/* NOC Stats - Teacher Specific */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card
            className={`cursor-pointer transition-colors ${
              filterStatus === "pending" ? "ring-2 ring-orange-500 bg-orange-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setFilterStatus("pending")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending My Approval</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingTeacherApproval}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${
              filterStatus === "approved" ? "ring-2 ring-green-500 bg-green-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setFilterStatus("approved")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved by Me</p>
                  <p className="text-2xl font-bold text-green-600">{stats.teacherApproved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${
              filterStatus === "rejected" ? "ring-2 ring-red-500 bg-red-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setFilterStatus("rejected")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected by Me</p>
                  <p className="text-2xl font-bold text-red-600">{stats.teacherRejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${
              filterStatus === "all" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setFilterStatus("all")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.thisMonth}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Summary */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <span>
            Showing {filteredRequests.length} of {nocRequests.length} requests
          </span>
          {filterStatus !== "all" && (
            <Badge variant="outline">
              {filterStatus === "pending"
                ? "Pending My Approval"
                : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </Badge>
          )}
          {searchText && (
            <Badge variant="outline" className="ml-1">
              “{searchText}”
            </Badge>
          )}
        </div>

        {/* NOC Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {filterStatus !== "all" ? (filterStatus === "pending" ? "pending" : filterStatus) : ""} requests
                  found
                </h3>
                <p className="text-gray-600">
                  {filterStatus === "pending"
                    ? "All requests have been reviewed"
                    : `No ${filterStatus === "pending" ? "pending" : filterStatus} requests at this time`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => {
              const firstDoc = request.documents?.[0]
              const firstDocUrl = firstDoc ? getDocUrl(firstDoc) : null
              return (
                <Card key={request.id} className={selectedNOC === request.id ? "ring-2 ring-blue-500" : ""}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{request.student_name}</h3>
                            <p className="text-sm text-gray-600">{request.student_email}</p>
                          </div>
                          <Badge
                            variant={
                              request.status === "approved" || request.status === "teacher_approved"
                                ? "default"
                                : request.status === "rejected"
                                  ? "destructive"
                                  : request.status === "pending_teacher_approval"
                                    ? "secondary"
                                    : "outline"
                            }
                            className="flex items-center gap-1"
                          >
                            {(request.status === "approved" || request.status === "teacher_approved") && (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            {request.status === "rejected" && <XCircle className="h-3 w-3" />}
                            {request.status === "pending_teacher_approval" && <Clock className="h-3 w-3" />}
                            {request.status === "approved" || request.status === "teacher_approved"
                              ? "Approved"
                              : request.status === "pending_teacher_approval"
                                ? "Pending Approval"
                                : request.status === "rejected"
                                  ? "Rejected"
                                  : request.status}
                          </Badge>
                          {request.company_verified && (
                            <Badge variant="default" className="bg-green-600">
                              <Building className="h-3 w-3 mr-1" />
                              TP Verified
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{request.position}</h4>
                            <p className="text-sm text-gray-600">{request.company_name}</p>
                            <p className="text-sm text-gray-600">Duration: {request.duration}</p>
                            <p className="text-sm text-gray-600">
                              Start Date: {new Date(request.start_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Submitted: {new Date(request.submitted_date).toLocaleDateString()}
                            </p>
                            {request.tp_approved_date && (
                              <p className="text-sm text-gray-600">
                                TP Approved: {new Date(request.tp_approved_date).toLocaleDateString()}
                              </p>
                            )}
                            {request.teacher_approved_date && (
                              <p className="text-sm text-gray-600">
                                Teacher Approved: {new Date(request.teacher_approved_date).toLocaleDateString()}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {request.documents &&
                                request.documents.map((doc, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs cursor-pointer"
                                    onClick={() => openDoc(doc)}
                                  >
                                    {getDocName(doc, index)}
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">{request.description}</p>

                        {/* TP Officer Feedback */}
                        {request.tp_officer_feedback && (
                          <div className="p-3 bg-blue-50 rounded-lg mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Building className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">TP Officer Feedback:</span>
                            </div>
                            <p className="text-sm text-blue-700">{request.tp_officer_feedback}</p>
                          </div>
                        )}

                        {/* Teacher Feedback */}
                        {request.teacher_feedback && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <GraduationCap className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">My Academic Review:</span>
                            </div>
                            <p className="text-sm text-green-700">{request.teacher_feedback}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!firstDocUrl) {
                              toast.error("No document available")
                              return
                            }
                            window.open(firstDocUrl, "_blank", "noopener,noreferrer")
                          }}
                          disabled={!firstDocUrl}
                          title={firstDocUrl ? "Open first document" : "No document URL"}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Documents
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!request.documents?.length) {
                              toast.error("No documents to download")
                              return
                            }
                            // For simplicity, open all in new tabs. For real download, handle via server or blobs.
                            request.documents.forEach((doc) => {
                              const url = getDocUrl(doc)
                              if (url) window.open(url, "_blank", "noopener,noreferrer")
                            })
                          }}
                          title="Open all documents"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        {request.status === "pending_teacher_approval" && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedNOC(selectedNOC === request.id ? null : request.id)}
                            disabled={processing !== null}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <BookOpen className="h-4 w-4 mr-1" />
                            Academic Review
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Teacher Review Form */}
                    {selectedNOC === request.id && request.status === "pending_teacher_approval" && (
                      <div className="border-t pt-4 mt-4">
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">Academic Review Guidelines</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Does this internship align with the student's academic curriculum?</li>
                              <li>• Will the student gain relevant technical/academic skills?</li>
                              <li>• Is the duration appropriate for academic requirements?</li>
                              <li>• Does the role match the student's learning objectives?</li>
                            </ul>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Academic Review Comments <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                              placeholder="Provide your academic assessment of this internship opportunity. Consider curriculum alignment, learning outcomes, and academic value..."
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              rows={4}
                              disabled={processing === request.id}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleTeacherNOCAction(request.id, "approve")}
                              disabled={processing !== null || !feedback.trim()}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {processing === request.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                              )}
                              Final Approval
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleTeacherNOCAction(request.id, "reject")}
                              disabled={processing !== null || !feedback.trim()}
                            >
                              {processing === request.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="mr-2 h-4 w-4" />
                              )}
                              Reject (Academic Mismatch)
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
    </DashboardLayout>
  )
}
