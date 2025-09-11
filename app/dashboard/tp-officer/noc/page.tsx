"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Download,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Eye,
  Building,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

import { getAllNOCRequests, updateNOCStatus, getCurrentUser } from "@/lib/data"

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
  approved_date?: string
  reviewed_date?: string
  status: "pending" | "approved" | "rejected" | "pending_teacher_approval"
  description: string
  feedback?: string
  documents: any[]
  company_verified?: boolean
}

interface NOCStats {
  pendingNOCs: number
  approvedNOCs: number
  rejectedNOCs: number
  totalNOCs: number
  thisMonth: number
}

export default function TPOfficerNOC() {
  // State Management
  const [selectedNOC, setSelectedNOC] = useState<number | null>(null)
  const [feedback, setFeedback] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [nocRequests, setNocRequests] = useState<NOCRequest[]>([])
  const [stats, setStats] = useState<NOCStats>({
    pendingNOCs: 0,
    approvedNOCs: 0,
    rejectedNOCs: 0,
    totalNOCs: 0,
    thisMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    fetchNOCData()
    fetchCurrentUser()
  }, [])

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

      console.log("[v0] 🔄 Fetching NOC requests for TP Officer...")

      const nocData = await getAllNOCRequests()

      if (!nocData || !Array.isArray(nocData)) {
        throw new Error("Failed to fetch NOC data")
      }

      const statsData = {
        pendingNOCs: nocData.filter((req) => req.status === "pending").length,
        approvedNOCs: nocData.filter((req) => req.status === "pending_teacher_approval" || req.status === "approved")
          .length,
        rejectedNOCs: nocData.filter((req) => req.status === "rejected").length,
        totalNOCs: nocData.length,
        thisMonth: nocData.filter((req) => {
          const submittedDate = new Date(req.submitted_date)
          const now = new Date()
          return submittedDate.getMonth() === now.getMonth() && submittedDate.getFullYear() === now.getFullYear()
        }).length,
      }

      setStats(statsData)
      setNocRequests(nocData)
      console.log("[v0] ✅ Successfully loaded", nocData.length, "NOC requests")
    } catch (error: any) {
      console.error("[v0] ❌ Error fetching NOC data:", error)
      setError(error.message || "Failed to load NOC data")

      // Fallback to mock data
      const mockStats = {
        pendingNOCs: 12,
        approvedNOCs: 156,
        rejectedNOCs: 8,
        totalNOCs: 176,
        thisMonth: 34,
      }

      setStats(mockStats)
      setNocRequests(generateMockNOCRequests(15))

      toast.error("Using offline data due to connection issues")
    } finally {
      setLoading(false)
    }
  }

  // Generate mock NOC requests
  const generateMockNOCRequests = (count: number): NOCRequest[] => {
    const mockData = [
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
        status: "pending" as const,
        description: "Full-stack web development using React and Node.js",
        company_verified: true,
        documents: ["offer_letter.pdf", "company_profile.pdf"],
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
        status: "pending" as const,
        description: "Data analysis and visualization using Python and Tableau",
        company_verified: false,
        documents: ["offer_letter.pdf"],
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
        submitted_date: "2024-03-20",
        status: "pending_teacher_approval" as const,
        description: "User interface design and user experience research",
        company_verified: true,
        documents: ["offer_letter.pdf", "project_details.pdf"],
        approved_date: "2024-03-22",
        feedback:
          "All documents verified. Company is in our approved list. Forwarded to teacher for academic approval.",
      },
      {
        id: 4,
        student_id: "student_4",
        student_name: "Neha Singh",
        student_email: "neha.singh@charusat.edu.in",
        company_name: "Unknown Corp",
        position: "Marketing Intern",
        duration: "4 months",
        start_date: "2024-04-10",
        submitted_date: "2024-03-18",
        status: "rejected" as const,
        description: "Digital marketing and social media management",
        company_verified: false,
        documents: ["offer_letter.pdf"],
        reviewed_date: "2024-03-20",
        feedback: "Company verification failed. Unable to verify legitimacy of the organization.",
      },
    ]

    // Extend array to match count
    const extended = []
    for (let i = 0; i < count; i++) {
      const baseIndex = i % mockData.length
      const item = { ...mockData[baseIndex] }
      item.id = i + 1
      item.student_id = `student_${i + 1}`
      extended.push(item)
    }

    return extended
  }

  const handleNOCAction = async (nocId: number, action: "approve" | "reject") => {
    try {
      setProcessing(nocId)

      const feedbackText = feedback.trim()
      if (!feedbackText) {
        toast.error("Please provide feedback for your decision")
        return
      }

      const approverId = currentUser?.id || "tp_officer_1"

      console.log(`[v0] 🔄 TP Officer ${action === "approve" ? "approving" : "rejecting"} NOC request ${nocId}`)

      const result = await updateNOCStatus(
        nocId,
        action === "approve" ? "approved" : "rejected",
        feedbackText,
        approverId,
        "tp_officer",
      )

      if (result.success) {
        setNocRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.id === nocId
              ? {
                  ...req,
                  status: action === "approve" ? "pending_teacher_approval" : "rejected",
                  feedback: feedbackText,
                  reviewed_date: new Date().toISOString(),
                  ...(action === "approve" && { approved_date: new Date().toISOString() }),
                }
              : req,
          ),
        )

        // Update stats
        setStats((prevStats) => ({
          ...prevStats,
          pendingNOCs: Math.max(0, prevStats.pendingNOCs - 1),
          [action === "approve" ? "approvedNOCs" : "rejectedNOCs"]:
            prevStats[action === "approve" ? "approvedNOCs" : "rejectedNOCs"] + 1,
        }))

        // Reset form
        setSelectedNOC(null)
        setFeedback("")

        const message =
          action === "approve" ? "NOC approved and forwarded to teacher for academic review" : "NOC request rejected"

        toast.success(message)
        console.log("[v0] ✅ NOC request updated successfully")
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

  // Filter requests
  const filteredRequests =
    filterStatus === "all" ? nocRequests : nocRequests.filter((req) => req.status === filterStatus)

  if (loading) {
    return (
      <DashboardLayout role="tp-officer">
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
    <DashboardLayout role="tp-officer">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NOC Company Verification</h1>
            <p className="text-gray-600">Review and verify company legitimacy for student internship requests</p>
          </div>
          <div className="flex gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending Verification</SelectItem>
                <SelectItem value="pending_teacher_approval">Awaiting Teacher</SelectItem>
                <SelectItem value="approved">Fully Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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

        {/* NOC Stats - Dynamic */}
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
                  <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingNOCs}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${
              filterStatus === "pending_teacher_approval" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setFilterStatus("pending_teacher_approval")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Awaiting Teacher</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {nocRequests.filter((r) => r.status === "pending_teacher_approval").length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600">Fully Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {nocRequests.filter((r) => r.status === "approved").length}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejectedNOCs}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
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
              {filterStatus === "pending_teacher_approval"
                ? "Awaiting Teacher"
                : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </Badge>
          )}
        </div>

        {/* NOC Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {filterStatus !== "all" ? filterStatus : ""} requests found
                </h3>
                <p className="text-gray-600">
                  {filterStatus === "pending"
                    ? "All requests have been reviewed"
                    : `No ${filterStatus} requests at this time`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className={selectedNOC === request.id ? "ring-2 ring-blue-500" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{request.student_name}</h3>
                          <p className="text-sm text-gray-600">{request.student_email}</p>
                        </div>
                        <Badge
                          variant={
                            request.status === "approved"
                              ? "default"
                              : request.status === "rejected"
                                ? "destructive"
                                : request.status === "pending_teacher_approval"
                                  ? "secondary"
                                  : "outline"
                          }
                          className="flex items-center gap-1"
                        >
                          {request.status === "approved" && <CheckCircle className="h-3 w-3" />}
                          {request.status === "rejected" && <XCircle className="h-3 w-3" />}
                          {(request.status === "pending" || request.status === "pending_teacher_approval") && (
                            <Clock className="h-3 w-3" />
                          )}
                          {request.status === "pending_teacher_approval"
                            ? "Awaiting Teacher"
                            : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                        {request.company_verified ? (
                          <Badge variant="default" className="bg-green-600">
                            <Building className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <Building className="h-3 w-3 mr-1" />
                            Unverified
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
                          {request.approved_date && (
                            <p className="text-sm text-gray-600">
                              TP Approved: {new Date(request.approved_date).toLocaleDateString()}
                            </p>
                          )}
                          {request.reviewed_date && (
                            <p className="text-sm text-gray-600">
                              Reviewed: {new Date(request.reviewed_date).toLocaleDateString()}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {request.documents &&
                              request.documents.map((doc: any, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {typeof doc === "string" ? doc : doc.name || `Document ${index + 1}`}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{request.description}</p>

                      {request.feedback && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium">TP Officer Feedback:</span>
                          </div>
                          <p className="text-sm text-gray-700">{request.feedback}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Documents
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      {request.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedNOC(selectedNOC === request.id ? null : request.id)}
                          disabled={processing !== null}
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Review Form */}
                  {selectedNOC === request.id && request.status === "pending" && (
                    <div className="border-t pt-4 mt-4">
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2">Company Verification Guidelines</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Verify company legitimacy and registration status</li>
                            <li>• Check if company is in approved/blacklisted database</li>
                            <li>• Validate offer letter authenticity and details</li>
                            <li>• Ensure internship aligns with university policies</li>
                          </ul>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Company Verification Comments <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            placeholder="Provide detailed feedback on company verification, document authenticity, and compliance with university policies..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={3}
                            disabled={processing === request.id}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleNOCAction(request.id, "approve")}
                            disabled={processing !== null || !feedback.trim()}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processing === request.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Verify & Forward to Teacher
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleNOCAction(request.id, "reject")}
                            disabled={processing !== null || !feedback.trim()}
                          >
                            {processing === request.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="mr-2 h-4 w-4" />
                            )}
                            Reject NOC
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
