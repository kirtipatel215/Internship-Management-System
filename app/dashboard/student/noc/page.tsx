"use client"
import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast, useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Data helpers
import { getNOCRequestsByStudent, createNOCRequest, getCurrentUser, uploadFile } from "@/lib/data"

// NOC Certificate Generator
import { 
  generateAndDownloadNOCPDF, 
  generateNOCCertificateNumber,
  type NOCCertificateData 
} from "@/lib/noc-generator"

// Icons
import {
  Plus,
  FileText,
  Clock,
  XCircle,
  Eye,
  Download,
  Pencil,
  Upload,
  Paperclip,
  Building,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Search,
  Filter,
  DollarSign,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

// Dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type NOCRequest = {
  id: number
  company: string
  position: string
  startDate: string
  endDate: string
  stipend?: string
  submittedDate: string
  approvedDate?: string
  status: "approved" | "pending" | "rejected" | string
  description: string
  feedback?: string
  documents?: string[]
  studentName?: string
  studentEmail?: string
  rollNumber?: string
  department?: string
  approvedBy?: string
  [key: string]: any
}

const STATUS_META: Record<string, { label: string; icon: React.ElementType; badgeClass: string; chipClass: string }> = {
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    badgeClass: "bg-emerald-600 text-white",
    chipClass: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200",
  },
  pending: {
    label: "Under Review",
    icon: Clock,
    badgeClass: "bg-amber-500 text-white",
    chipClass: "text-amber-700 bg-amber-50 ring-1 ring-amber-200",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    badgeClass: "bg-rose-600 text-white",
    chipClass: "text-rose-700 bg-rose-50 ring-1 ring-rose-200",
  },
  unknown: {
    label: "Unknown",
    icon: AlertCircle,
    badgeClass: "bg-gray-500 text-white",
    chipClass: "text-gray-700 bg-gray-50 ring-1 ring-gray-200",
  },
}

function prettyStatus(s?: string) {
  const k = (s || "unknown").toLowerCase()
  return STATUS_META[k] ?? STATUS_META.unknown
}

// Calculate duration from start and end dates
function calculateDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))

  if (diffMonths === 1) return "1 month"
  if (diffMonths < 12) return `${diffMonths} months`

  const years = Math.floor(diffMonths / 12)
  const remainingMonths = diffMonths % 12

  if (remainingMonths === 0) return `${years} year${years > 1 ? "s" : ""}`
  return `${years} year${years > 1 ? "s" : ""} ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`
}

// Enhanced Upload Zone Component with optimizations
function UploadZone({
  onFiles,
  busy,
  selectedFiles,
}: {
  onFiles: (files: File[]) => void
  busy?: boolean
  selectedFiles: File[]
}) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Only PDF files are allowed"
    }
    if (file.size > 10 * 1024 * 1024) {
      return "File size must be less than 10MB"
    }
    if (file.size < 1024) {
      return "File seems too small to be a valid PDF"
    }
    return null
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)

    const droppedFiles = Array.from(e.dataTransfer.files || [])
    const validFiles: File[] = []
    const errors: string[] = []

    droppedFiles.forEach((file) => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      toast({
        title: "Invalid Files",
        description: errors.join(", "),
        variant: "destructive",
      })
    }

    if (validFiles.length > 0) {
      onFiles([validFiles[0]])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const error = validateFile(selectedFile)
    if (error) {
      toast({
        title: "Invalid File",
        description: error,
        variant: "destructive",
      })
      return
    }

    onFiles([selectedFile])
  }

  const triggerFileSelect = () => {
    if (busy) return
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!busy) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer",
          dragOver && !busy ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          busy && "opacity-50 cursor-not-allowed",
        )}
        onClick={triggerFileSelect}
      >
        <div className="text-center">
          <div
            className={cn(
              "mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4 transition-colors",
              dragOver && !busy ? "bg-blue-100" : "bg-gray-100",
            )}
          >
            {busy ? (
              <Clock className="h-6 w-6 text-gray-500 animate-spin" />
            ) : (
              <Upload className="h-6 w-6 text-gray-500" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {busy ? "Processing..." : "Upload Documents (Optional)"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {busy ? "Please wait while we process your file..." : "Upload offer letter or other supporting documents"}
          </p>
          <p className="text-xs text-gray-400 mb-4">PDF files only, max 10MB • Optional</p>

          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation()
              triggerFileSelect()
            }}
            className="rounded-lg"
          >
            <Paperclip className="h-4 w-4 mr-2" />
            {busy ? "Processing..." : "Choose PDF File"}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={busy}
          />
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Files</Label>
          {selectedFiles.map((file, index) => {
            const isValid = !validateFile(file)
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-3 border rounded-lg transition-colors",
                  isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-8 w-8 rounded flex items-center justify-center",
                      isValid ? "bg-green-100" : "bg-red-100",
                    )}
                  >
                    {isValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                      {isValid && <span className="text-green-600 ml-2">✓ Valid PDF</span>}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onFiles(selectedFiles.filter((_, i) => i !== index))
                  }}
                  disabled={busy}
                  className="text-gray-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Enhanced NOC Card Component with expandable design
function NOCCard({
  request,
  currentUser,
  isExpanded,
  onToggle,
  onDownloadNOC,
}: {
  request: NOCRequest
  currentUser: any
  isExpanded: boolean
  onToggle: () => void
  onDownloadNOC: () => void
}) {
  const meta = prettyStatus(request.status)
  const StatusIcon = meta.icon
  const duration = calculateDuration(request.startDate, request.endDate)

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
      {/* Minimal View - Always Visible */}
      <CardContent className="p-4 sm:p-6">
        <div 
          className="cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Building className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {request.company}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{request.position}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 sm:px-3 sm:py-1.5 rounded-full",
                  meta.chipClass,
                )}
              >
                <StatusIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">{meta.label}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <div className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
              <CalendarDays className="h-3 w-3 flex-shrink-0" />
              <span>{duration}</span>
            </div>
            <div className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>{new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            {request.stipend && (
              <div className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md">
                <DollarSign className="h-3 w-3 flex-shrink-0" />
                <span>{request.stipend}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {new Date(request.submittedDate).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-1 text-blue-600">
              <span className="text-xs font-medium">{isExpanded ? 'Less' : 'More'}</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </div>

        {/* Expanded View - Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4" onClick={(e) => e.stopPropagation()}>
            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">Description</Label>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs font-medium text-blue-900 mb-1">Start Date</p>
                <p className="text-sm text-blue-800">{new Date(request.startDate).toLocaleDateString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-xs font-medium text-green-900 mb-1">End Date</p>
                <p className="text-sm text-green-800">{new Date(request.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Feedback */}
            {request.feedback && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs font-medium text-amber-800 mb-1">Feedback</p>
                <p className="text-xs text-amber-700">{request.feedback}</p>
              </div>
            )}

            {/* Documents */}
            {request.documents && request.documents.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">Documents</Label>
                {request.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileText className="h-4 w-4 text-red-600 flex-shrink-0" />
                      <span className="text-xs text-gray-900 truncate">Document {index + 1}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.open(doc, "_blank")}
                      className="h-7 px-2 flex-shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
              {request.status === "approved" ? (
                <Button 
                  onClick={onDownloadNOC} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download NOC Certificate
                </Button>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-500">
                    {request.status === "pending" ? "Awaiting approval from T&P Officer" : "Request was rejected"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function NOCRequests() {
  const [showForm, setShowForm] = useState(false)
  const [nocRequests, setNocRequests] = useState<NOCRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<NOCRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Load current user and data
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)

        if (!user) return setNocRequests([])

        const rows = await getNOCRequestsByStudent(user.id)
        const normalized: NOCRequest[] = (rows || []).map((r: any) => ({
          id: r.id,
          company: r.company ?? r.company_name ?? "",
          position: r.position,
          startDate: r.start_date ?? r.startDate,
          endDate: r.end_date ?? r.endDate,
          stipend: r.stipend,
          submittedDate: r.submitted_date ?? r.submittedDate ?? new Date().toISOString(),
          approvedDate: r.approved_date ?? r.approvedDate,
          status: r.status ?? "pending",
          description: r.description ?? "",
          feedback: r.feedback ?? "",
          documents: Array.isArray(r.documents)
            ? r.documents
            : typeof r.documents === "string"
              ? (() => {
                  try {
                    const j = JSON.parse(r.documents)
                    return Array.isArray(j) ? j : []
                  } catch {
                    return []
                  }
                })()
              : [],
          studentName: r.student_name || user.name,
          studentEmail: r.student_email || user.email,
          rollNumber: r.roll_number || user.rollNumber,
          department: r.department || user.department,
          approvedBy: r.approved_by || r.teacher_approved_by,
          raw: r,
        }))
        setNocRequests(normalized)
      } catch (err) {
        console.error("Error loading data:", err)
        setNocRequests([])
      }
    }
    loadData()
  }, [])

  // Filter requests based on search and status
  useEffect(() => {
    let filtered = nocRequests

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (request) => request.company.toLowerCase().includes(term) || request.position.toLowerCase().includes(term),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter)
    }

    setFilteredRequests(filtered)
  }, [nocRequests, searchTerm, statusFilter])

  // Handle file selection
  const handleFileSelection = useCallback((files: File[]) => {
    setSelectedFiles(files)
  }, [])

  // Reset form
  const resetForm = useCallback(() => {
    setSelectedFiles([])
    setShowForm(false)
  }, [])

  // Toggle card expansion
  const toggleCard = (id: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Handle NOC Certificate Download
  const handleDownloadNOC = async (request: NOCRequest) => {
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "Please log in to download NOC certificate.",
        variant: "destructive",
      })
      return
    }

    if (request.status !== "approved") {
      toast({
        title: "NOC Not Approved",
        description: "NOC certificate can only be downloaded for approved requests.",
        variant: "destructive",
      })
      return
    }

    setIsDownloading(true)

    try {
      const certificateNumber = generateNOCCertificateNumber()

      const nocData: NOCCertificateData = {
        student: {
          name: request.studentName || currentUser.name || "Unknown Student",
          email: request.studentEmail || currentUser.email || "",
          id: currentUser.id,
          rollNumber: request.rollNumber || currentUser.rollNumber || "N/A",
          department: request.department || currentUser.department || "Computer Engineering",
        },
        internship: {
          company: request.company,
          position: request.position,
          duration: calculateDuration(request.startDate, request.endDate),
          startDate: request.startDate,
          endDate: request.endDate,
          description: request.description,
        },
        approval: {
          approvedBy: request.approvedBy || "T&P Officer",
          approvedDate: request.approvedDate || new Date().toISOString(),
          certificateNumber: certificateNumber,
        },
      }

      const result = await generateAndDownloadNOCPDF(nocData)

      if (!result.success) {
        throw new Error(result.error || "Failed to generate NOC certificate")
      }

      if (result.pdfBlob && result.fileName) {
        const url = window.URL.createObjectURL(result.pdfBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = result.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast({
          title: "NOC Certificate Downloaded",
          description: `Your NOC certificate has been downloaded successfully.`,
        })
      }

    } catch (error: any) {
      console.error("Error downloading NOC certificate:", error)
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download NOC certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "Please log in and try again.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const startTime = Date.now()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      const requestData = {
        studentId: currentUser.id,
        studentName: currentUser.name || currentUser.full_name || "Unknown",
        studentEmail: currentUser.email,
        company: (formData.get("company") as string)?.trim(),
        position: (formData.get("position") as string)?.trim(),
        startDate: formData.get("startDate") as string,
        endDate: formData.get("endDate") as string,
        stipend: (formData.get("stipend") as string)?.trim() || "",
        description: (formData.get("description") as string)?.trim(),
        documents: [] as string[],
      }

      if (
        !requestData.company ||
        !requestData.position ||
        !requestData.description ||
        !requestData.startDate ||
        !requestData.endDate
      ) {
        throw new Error("Please fill in all required fields")
      }

      const startDate = new Date(requestData.startDate)
      const endDate = new Date(requestData.endDate)
      if (endDate <= startDate) {
        throw new Error("End date must be after start date")
      }

      let fileUrl = null
      if (selectedFiles.length > 0) {
        const file = selectedFiles[0]

        if (file.size > 10 * 1024 * 1024) {
          throw new Error("File must be under 10MB. Please compress your PDF.")
        }

        if (file.type !== "application/pdf") {
          throw new Error("Only PDF files are allowed.")
        }

        setSubmitProgress(`⚡ Uploading ${file.name}...`)

        const uploadResult = await uploadFile(file, "noc-documents")

        if (!uploadResult.success || !uploadResult.fileUrl) {
          throw new Error(uploadResult.error || "File upload failed")
        }

        fileUrl = uploadResult.fileUrl
        requestData.documents = [fileUrl]
      } else {
        requestData.documents = []
      }

      setSubmitProgress("📝 Creating request...")

      const newRequest = await createNOCRequest(requestData)

      if (!newRequest?.id) {
        throw new Error("Request creation failed - no ID returned")
      }

      const totalTime = Date.now() - startTime

      const normalized: NOCRequest = {
        id: newRequest.id,
        company: newRequest.company_name || requestData.company,
        position: newRequest.position,
        startDate: newRequest.start_date || requestData.startDate,
        endDate: newRequest.end_date || requestData.endDate,
        stipend: newRequest.stipend ? `₹${newRequest.stipend}` : requestData.stipend,
        submittedDate: newRequest.submitted_date || new Date().toISOString(),
        approvedDate: newRequest.approved_date,
        status: newRequest.status || "pending",
        description: newRequest.description || requestData.description,
        feedback: newRequest.feedback || "",
        documents: fileUrl ? [fileUrl] : [],
        studentName: requestData.studentName,
        studentEmail: requestData.studentEmail,
        rollNumber: currentUser.rollNumber,
        department: currentUser.department,
      }

      setNocRequests((prev) => [normalized, ...prev])
      resetForm()
      form.reset()

      toast({
        title: "✅ Success!",
        description: `NOC request submitted successfully in ${(totalTime / 1000).toFixed(1)}s.`,
      })

      setTimeout(async () => {
        try {
          const updatedRequests = await getNOCRequestsByStudent(currentUser.id)
          setNocRequests(updatedRequests || [])
        } catch (error) {
          console.error("Error refreshing NOC requests:", error)
        }
      }, 1000)
    } catch (error: any) {
      const totalTime = Date.now() - startTime

      let errorMessage = "Submission failed. Please try again."
      const errorMsg = (error.message || "").toLowerCase()

      if (errorMsg.includes("timeout")) {
        errorMessage = "⏱️ Upload timeout. Try with a smaller file or better internet connection."
      } else if (errorMsg.includes("network")) {
        errorMessage = "🌐 Network error. Please check your connection and try again."
      } else if (errorMsg.includes("size") || errorMsg.includes("large")) {
        errorMessage = "📄 File too large. Please compress your PDF and try again."
      } else if (errorMsg.includes("date")) {
        errorMessage = "📅 Please check your start and end dates."
      } else if (errorMsg.includes("required") || errorMsg.includes("fill")) {
        errorMessage = "📝 Please fill in all required fields."
      }

      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setSubmitProgress("")
    }
  }

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">NOC Requests</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Manage your No Objection Certificate requests
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="rounded-xl px-4 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              New NOC Request
            </Button>
          </div>

          {/* Search and Filter Section - Horizontal on Mobile */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search company or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-lg border-gray-300"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px] rounded-lg border-gray-300">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards - Horizontal Scroll on Mobile */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-max sm:min-w-0">
              <Card 
                className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100 cursor-pointer hover:shadow-md transition-shadow min-w-[200px] sm:min-w-0"
                onClick={() => setStatusFilter("all")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Total</p>
                      <p className="text-2xl font-bold text-blue-900">{nocRequests.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="border-0 shadow-sm bg-gradient-to-r from-amber-50 to-amber-100 cursor-pointer hover:shadow-md transition-shadow min-w-[200px] sm:min-w-0"
                onClick={() => setStatusFilter("pending")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700">Pending</p>
                      <p className="text-2xl font-bold text-amber-900">
                        {nocRequests.filter((r) => r.status === "pending").length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-emerald-100 cursor-pointer hover:shadow-md transition-shadow min-w-[200px] sm:min-w-0"
                onClick={() => setStatusFilter("approved")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700">Approved</p>
                      <p className="text-2xl font-bold text-emerald-900">
                        {nocRequests.filter((r) => r.status === "approved").length}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="border-0 shadow-sm bg-gradient-to-r from-rose-50 to-rose-100 cursor-pointer hover:shadow-md transition-shadow min-w-[200px] sm:min-w-0"
                onClick={() => setStatusFilter("rejected")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-rose-700">Rejected</p>
                      <p className="text-2xl font-bold text-rose-900">
                        {nocRequests.filter((r) => r.status === "rejected").length}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-rose-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Create Form */}
          {showForm && (
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl text-gray-900">Submit New NOC Request</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Request NOC for an externally secured internship
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                        Company Name * (Paste Only)
                      </Label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="Paste company name here..."
                        required
                        onKeyDown={(e) => {
                          if (
                            e.key === 'Backspace' ||
                            e.key === 'Delete' ||
                            e.key === 'Tab' ||
                            e.key === 'Escape' ||
                            e.key === 'Enter' ||
                            (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) ||
                            (e.metaKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))
                          ) {
                            return
                          }
                          e.preventDefault()
                        }}
                        className="rounded-lg border-gray-300 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500">Copy and paste the exact company name from your offer letter</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                        Position *
                      </Label>
                      <Input
                        id="position"
                        name="position"
                        placeholder="e.g., Software Engineering Intern"
                        required
                        className="rounded-lg border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                        Start Date *
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        name="startDate"
                        required
                        className="rounded-lg border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                        End Date *
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        name="endDate"
                        required
                        className="rounded-lg border-gray-300 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stipend" className="text-sm font-medium text-gray-700">
                      Stipend (Optional)
                    </Label>
                    <Input
                      id="stipend"
                      name="stipend"
                      placeholder="e.g., ₹15,000/month, $500/month, or Unpaid"
                      className="rounded-lg border-gray-300 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500">Leave blank if unpaid or amount not disclosed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Job Description *
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the role, responsibilities, and learning outcomes..."
                      rows={4}
                      required
                      className="rounded-lg border-gray-300 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Supporting Documents (Optional)</Label>
                    <UploadZone onFiles={handleFileSelection} busy={isSubmitting} selectedFiles={selectedFiles} />
                    <p className="text-xs text-gray-500">
                      Upload offer letter or supporting documents (optional but recommended)
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg px-6 py-2.5 bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">{submitProgress || "Submitting..."}</span>
                        </div>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Submit Request
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={resetForm}
                      disabled={isSubmitting}
                      className="rounded-lg px-6 py-2.5 border-gray-300 bg-transparent"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* NOC Requests List */}
          <div className="space-y-4 sm:space-y-6">
            {filteredRequests.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {searchTerm || statusFilter !== "all"
                      ? `Filtered (${filteredRequests.length})`
                      : "Your NOC Requests"}
                  </h2>
                  {(searchTerm || statusFilter !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                      }}
                      className="rounded-lg text-xs sm:text-sm"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Clear</span>
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {filteredRequests.map((request) => (
                    <NOCCard
                      key={request.id}
                      request={request}
                      currentUser={currentUser}
                      isExpanded={expandedCards.has(request.id)}
                      onToggle={() => toggleCard(request.id)}
                      onDownloadNOC={() => handleDownloadNOC(request)}
                    />
                  ))}
                </div>
              </>
            ) : nocRequests.length > 0 ? (
              <Card className="border-0 shadow-sm bg-gray-50">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-200 flex items-center justify-center mb-4 sm:mb-6">
                    <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No matching requests</h3>
                  <p className="text-sm text-gray-600 mb-4 sm:mb-6">
                    Try adjusting your filters
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                    }}
                    className="rounded-lg px-4 sm:px-6 py-2.5"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm bg-gray-50">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-200 flex items-center justify-center mb-4 sm:mb-6">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No NOC requests yet</h3>
                  <p className="text-sm text-gray-600 mb-4 sm:mb-6">
                    Submit a NOC request for university approval
                  </p>
                  <Button onClick={() => setShowForm(true)} className="rounded-lg px-4 sm:px-6 py-2.5">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Request
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Loading overlay for download */}
          {isDownloading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-900">Generating NOC...</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Please wait</p>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}