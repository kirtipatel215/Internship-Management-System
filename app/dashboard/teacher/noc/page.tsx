"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building,
  Loader2,
  RefreshCw,
  AlertCircle,
  GraduationCap,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
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
  const [expandedNOC, setExpandedNOC] = useState<number | null>(null)
  const [feedback, setFeedback] = useState("")
  const [filterStatus, setFilterStatus] = useState("pending")
  const [searchText, setSearchText] = useState("")
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
    } catch (error: any) {
      console.error("Error fetching NOC data:", error)
      setError(error.message || "Failed to load NOC data")
      toast.error("Using offline data due to connection issues")
    } finally {
      setLoading(false)
    }
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
      const newStatus = action === "approve" ? "approved" : "rejected"
      const result = await updateNOCStatus(nocId, newStatus, feedbackText, approverId, "teacher")

      if (result.success) {
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

        setStats((prevStats) => ({
          ...prevStats,
          pendingTeacherApproval: Math.max(0, prevStats.pendingTeacherApproval - 1),
          [action === "approve" ? "teacherApproved" : "teacherRejected"]:
            prevStats[action === "approve" ? "teacherApproved" : "teacherRejected"] + 1,
        }))

        setExpandedNOC(null)
        setFeedback("")

        const message =
          action === "approve"
            ? "NOC request approved - Student can now proceed with internship"
            : "NOC request rejected due to academic concerns"

        toast.success(message)
      } else {
        throw new Error(result.error || `Failed to ${action} request`)
      }
    } catch (error: any) {
      console.error(`Error ${action === "approve" ? "approving" : "rejecting"} NOC:`, error)
      toast.error(error.message || `Failed to ${action} request`)
    } finally {
      setProcessing(null)
    }
  }

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

  const statusFiltered = useMemo(() => {
    if (filterStatus === "all") return nocRequests
    if (filterStatus === "pending")
      return nocRequests.filter((req) => req.status === "pending_teacher_approval")
    if (filterStatus === "approved")
      return nocRequests.filter((req) => req.status === "approved" || req.status === "teacher_approved")
    return nocRequests.filter((req) => req.status === "rejected" && req.teacher_feedback)
  }, [nocRequests, filterStatus])

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
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">NOC Academic Approval</h1>
            <p className="text-sm md:text-base text-gray-600">Review and provide academic approval for student internship requests</p>
          </div>
          
          {/* Filters - Horizontal on Mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search..."
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchNOCData} disabled={loading} size="sm">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-red-800 text-sm">{error}</span>
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

        {/* Stats Cards - Hidden on Mobile, Grid on Desktop */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            {filteredRequests.length} of {nocRequests.length} requests
          </span>
          {searchText && (
            <Badge variant="outline">"{searchText}"</Badge>
          )}
        </div>

        {/* NOC Requests List */}
        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-600 text-sm">
                  {filterStatus === "pending"
                    ? "All requests have been reviewed"
                    : `No ${filterStatus} requests at this time`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => {
              const isExpanded = expandedNOC === request.id
              return (
                <Card key={request.id} className={isExpanded ? "ring-2 ring-blue-500" : ""}>
                  <CardContent className="p-4">
                    {/* Minimal View */}
                    <div
                      className="cursor-pointer"
                      onClick={() => setExpandedNOC(isExpanded ? null : request.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{request.student_name}</h3>
                            <p className="text-sm text-gray-600 truncate">{request.company_name}</p>
                            <p className="text-xs text-gray-500 truncate">{request.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant={
                              request.status === "approved" || request.status === "teacher_approved"
                                ? "default"
                                : request.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {request.status === "approved" || request.status === "teacher_approved"
                              ? "Approved"
                              : request.status === "pending_teacher_approval"
                                ? "Pending"
                                : "Rejected"}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded View */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        {/* Student Details */}
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Email:</span> {request.student_email}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Duration:</span> {request.duration}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Start Date:</span>{" "}
                            {new Date(request.start_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Submitted:</span>{" "}
                            {new Date(request.submitted_date).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Description */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                          <p className="text-sm text-gray-600">{request.description}</p>
                        </div>

                        {/* Documents */}
                        {request.documents && request.documents.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Documents</p>
                            <div className="flex flex-wrap gap-2">
                              {request.documents.map((doc, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDoc(doc)}
                                  className="text-xs"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  {getDocName(doc, index)}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TP Officer Feedback */}
                        {request.tp_officer_feedback && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Building className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">TP Officer Feedback</span>
                            </div>
                            <p className="text-sm text-blue-700">{request.tp_officer_feedback}</p>
                          </div>
                        )}

                        {/* Teacher Feedback (if already reviewed) */}
                        {request.teacher_feedback && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <GraduationCap className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">My Review</span>
                            </div>
                            <p className="text-sm text-green-700">{request.teacher_feedback}</p>
                          </div>
                        )}

                        {/* Review Form (for pending requests) */}
                        {request.status === "pending_teacher_approval" && (
                          <div className="space-y-3 pt-3 border-t">
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Your Academic Review <span className="text-red-500">*</span>
                              </label>
                              <Textarea
                                placeholder="Consider curriculum alignment, learning outcomes, and academic value..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={3}
                                disabled={processing === request.id}
                                className="text-sm"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleTeacherNOCAction(request.id, "approve")}
                                disabled={processing !== null || !feedback.trim()}
                                className="bg-green-600 hover:bg-green-700 flex-1"
                                size="sm"
                              >
                                {processing === request.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleTeacherNOCAction(request.id, "reject")}
                                disabled={processing !== null || !feedback.trim()}
                                className="flex-1"
                                size="sm"
                              >
                                {processing === request.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="mr-2 h-4 w-4" />
                                )}
                                Reject
                              </Button>
                            </div>
                          </div>
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
  )
}