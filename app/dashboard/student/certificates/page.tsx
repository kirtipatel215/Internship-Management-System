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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Upload, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Download, 
  Eye, 
  Award, 
  Loader2,
  FileText,
  Calendar,
  Building,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  Paperclip,
  Menu,
  Filter
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { getCertificatesByStudent, createCertificate, getCurrentUser, uploadFile, getApprovedInternshipsByStudent } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Certificate {
  id: number
  student_id: string
  student_name: string
  student_email: string
  certificate_type: string
  title: string
  company_name: string
  duration: string
  start_date: string
  end_date: string
  file_name?: string
  file_url?: string
  file_size?: number
  status: 'pending' | 'approved' | 'rejected'
  upload_date: string
  approved_date?: string
  approved_by?: string
  feedback?: string
  created_at: string
}

interface ApprovedInternship {
  id: number
  student_id: string
  company_name: string
  internship_title: string
  start_date: string
  end_date: string
  duration: string
  status: 'approved'
  approved_date: string
  approved_by: string
}

const STATUS_META = {
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    chipClass: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200",
  },
  pending: {
    label: "Under Review",
    icon: Clock,
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    chipClass: "text-amber-700 bg-amber-50 ring-1 ring-amber-200",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    chipClass: "text-rose-700 bg-rose-50 ring-1 ring-rose-200",
  },
}

function UploadZone({ onFileSelect, selectedFile, busy }: {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
  busy?: boolean
}) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return "Only PDF files are allowed"
    }
    if (file.size > 10 * 1024 * 1024) {
      return "File must be under 10MB"
    }
    if (file.size < 1024) {
      return "File too small - may be corrupted"
    }
    return null
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    
    if (busy) return
    
    const files = Array.from(e.dataTransfer.files || [])
    if (files.length > 0) {
      const file = files[0]
      const error = validateFile(file)
      if (error) {
        return // You might want to show an error toast here
      }
      onFileSelect(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || busy) return
    
    const error = validateFile(file)
    if (error) {
      return // You might want to show an error toast here
    }
    
    onFileSelect(file)
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
          "relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer",
          // Responsive padding
          "p-4 sm:p-6",
          dragOver && !busy
            ? "border-blue-400 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400",
          busy && "opacity-50 cursor-not-allowed"
        )}
        onClick={triggerFileSelect}
      >
        <div className="text-center">
          <div className={cn(
            "mx-auto rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-colors",
            // Responsive icon size
            "h-10 w-10 sm:h-12 sm:w-12",
            dragOver && !busy ? "bg-blue-100" : "bg-gray-100"
          )}>
            {busy ? (
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 animate-spin" />
            ) : (
              <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
            )}
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {busy ? "Processing..." : "Upload Certificate"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            {busy 
              ? "Please wait while we process your file..." 
              : "Drag and drop your PDF file here, or click to browse"
            }
          </p>
          <p className="text-xs text-gray-400 mb-3 sm:mb-4">PDF files only, max 10MB</p>
          
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation()
              triggerFileSelect()
            }}
            className="rounded-lg text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            <Paperclip className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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

      {selectedFile && (
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm font-medium">Selected File</Label>
          <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  <span className="text-green-600 ml-2">✓ Valid PDF</span>
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onFileSelect(null)
              }}
              disabled={busy}
              className="text-gray-500 hover:text-red-600 flex-shrink-0 ml-2 p-1"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function CertificateCard({ certificate, onView, onDownload }: {
  certificate: Certificate
  onView: () => void
  onDownload: () => void
}) {
  const meta = STATUS_META[certificate.status] || STATUS_META.pending
  const StatusIcon = meta.icon

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm h-full">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col space-y-4">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors leading-tight">
                  {certificate.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{certificate.company_name}</p>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <span className={cn(
                "inline-flex items-center gap-1 text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border",
                meta.badgeClass
              )}>
                <StatusIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">{meta.label}</span>
                <span className="sm:hidden">{meta.label.split(' ')[0]}</span>
              </span>
            </div>
          </div>

          {/* Tags Section */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <div className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">{certificate.duration}</span>
              <span className="sm:hidden">{certificate.duration.split(' ')[0]}</span>
            </div>
            <div className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden md:inline">
                {new Date(certificate.start_date).toLocaleDateString()} - {new Date(certificate.end_date).toLocaleDateString()}
              </span>
              <span className="md:hidden">
                {new Date(certificate.start_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              </span>
            </div>
            {certificate.file_name && (
              <div className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md">
                <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline">PDF Certificate</span>
                <span className="sm:hidden">PDF</span>
              </div>
            )}
          </div>

          {/* Footer Section */}
          <div className="space-y-3 pt-2 border-t">
            <div className="text-xs text-gray-500">
              <span className="block sm:inline">
                Uploaded {new Date(certificate.upload_date || certificate.created_at).toLocaleDateString()}
              </span>
              {certificate.approved_date && (
                <span className="text-emerald-600 block sm:inline sm:ml-2">
                  <span className="hidden sm:inline">•</span> Approved {new Date(certificate.approved_date).toLocaleDateString()}
                </span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onView}
                className="h-7 sm:h-8 px-2 sm:px-3 text-xs flex-1 sm:flex-initial"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                onClick={onDownload}
                className="h-7 sm:h-8 px-2 sm:px-3 text-xs flex-1 sm:flex-initial"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
        
        {/* Feedback Section */}
        {certificate.feedback && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs font-medium text-amber-800 mb-1">Faculty Feedback</p>
            <p className="text-xs text-amber-700 leading-relaxed">{certificate.feedback}</p>
          </div>
        )}

        {/* Approved By Section */}
        {certificate.approved_by && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <User className="h-3 w-3" />
            <span className="truncate">Approved by {certificate.approved_by}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function StudentCertificates() {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [approvedInternships, setApprovedInternships] = useState<ApprovedInternship[]>([])
  const [selectedInternship, setSelectedInternship] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitProgress, setSubmitProgress] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const loadUserAndData = async () => {
      try {
        setIsLoading(true)
        
        const user = await getCurrentUser()
        if (!user) {
          toast({
            title: "Authentication Error",
            description: "User not found. Please log in again.",
            variant: "destructive",
          })
          return
        }
        
        setCurrentUser(user)
        
        // Load certificates
        const userCertificates = await getCertificatesByStudent(user.id)
        console.log('Loaded certificates:', userCertificates)
        
        if (Array.isArray(userCertificates)) {
          setCertificates(userCertificates)
        } else {
          console.warn('Certificates is not an array:', userCertificates)
          setCertificates([])
        }

        // Load approved internships
        const userApprovedInternships = await getApprovedInternshipsByStudent(user.id)
        console.log('Loaded approved internships:', userApprovedInternships)
        
        if (Array.isArray(userApprovedInternships)) {
          setApprovedInternships(userApprovedInternships)
        } else {
          console.warn('Approved internships is not an array:', userApprovedInternships)
          setApprovedInternships([])
        }
        
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Loading Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
        setCertificates([])
        setApprovedInternships([])
      } finally {
        setIsLoading(false)
      }
    }

    loadUserAndData()
  }, [toast])

  const resetForm = () => {
    setSelectedFile(null)
    setSelectedInternship("")
    setShowUploadForm(false)
  }

  const getSelectedInternshipData = (): ApprovedInternship | null => {
    if (!selectedInternship) return null
    return approvedInternships.find(internship => internship.id.toString() === selectedInternship) || null
  }

  const handleUploadCertificate = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "User not found. Please log in again.",
        variant: "destructive",
      })
      return
    }

    if (!selectedFile) {
      toast({
        title: "Missing File",
        description: "Please select a certificate file first.",
        variant: "destructive",
      })
      return
    }

    if (!selectedInternship) {
      toast({
        title: "Select Internship",
        description: "Please select an approved internship from the list.",
        variant: "destructive",
      })
      return
    }

    const internshipData = getSelectedInternshipData()
    if (!internshipData) {
      toast({
        title: "Invalid Selection",
        description: "Selected internship not found. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const startTime = Date.now()

    try {
      const formData = new FormData(event.target as HTMLFormElement)

      // Get additional notes if any
      const additionalNotes = formData.get("additional-notes") as string

      // Upload file with progress
      setSubmitProgress(`⚡ Uploading ${selectedFile.name}...`)
      
      const uploadFileName = `certificate_${currentUser.rollNumber || currentUser.id}_${Date.now()}.pdf`
      const uploadResult = await uploadFile(selectedFile, 'certificates', uploadFileName)

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'File upload failed')
      }

      const uploadTime = Date.now() - startTime
      console.log(`⚡ Upload completed in ${uploadTime}ms`)

      // Create certificate record using approved internship data
      setSubmitProgress("📝 Creating certificate record...")
      
      const certificateData = {
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        internshipTitle: internshipData.position, // Using position as internship title
        company: internshipData.company_name,
        duration: internshipData.duration,
        startDate: internshipData.start_date,
        endDate: internshipData.end_date,
        fileName: uploadResult.fileName,
        fileUrl: uploadResult.fileUrl,
        fileSize: selectedFile.size,
        additionalNotes: additionalNotes || undefined,
        internshipId: internshipData.id // Link to the approved internship
      }

      console.log('Creating certificate with data:', certificateData)

      const newCertificate = await createCertificate(certificateData)
      
      const totalTime = Date.now() - startTime
      console.log(`✅ Total time: ${totalTime}ms`)

      // Add to local state
      setCertificates((prev) => [newCertificate, ...prev])
      resetForm()

      // Reset form
      ;(event.target as HTMLFormElement).reset()

      toast({
        title: "✅ Certificate Uploaded",
        description: `Certificate uploaded in ${(totalTime/1000).toFixed(1)}s. Now pending approval.`,
      })

    } catch (error: any) {
      const totalTime = Date.now() - startTime
      console.error(`❌ Failed after ${totalTime}ms:`, error)
      
      let errorMessage = "Failed to upload certificate. Please try again."
      const errorMsg = (error.message || "").toLowerCase()
      
      if (errorMsg.includes('timeout')) {
        errorMessage = "⏱️ Upload timeout. Try with a smaller file or better connection."
      } else if (errorMsg.includes('network')) {
        errorMessage = "🌐 Network error. Please check your connection and try again."
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setSubmitProgress("")
    }
  }

  const handleViewCertificate = (certificate: Certificate) => {
    if (certificate.file_url) {
      window.open(certificate.file_url, '_blank', 'noopener,noreferrer')
    } else {
      toast({
        title: "View Certificate",
        description: `Opening certificate: ${certificate.title}`,
      })
    }
  }

  const handleDownloadCertificate = async (certificate: Certificate) => {
    if (certificate.file_url && certificate.file_name) {
      try {
        const response = await fetch(certificate.file_url)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = certificate.file_name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "✅ Download Started",
          description: `Downloading ${certificate.file_name}`,
        })
      } catch (error) {
        toast({
          title: "Download Failed",
          description: "Could not download the certificate file.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Download Certificate",
        description: `Mock download: ${certificate.title}`,
      })
    }
  }

  if (isLoading) {
    return (
      <AuthGuard allowedRoles={["student"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-gray-500 text-sm sm:text-base">Loading certificates and internships...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-0">
          {/* Header Section - Responsive */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Internship Certificates</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Upload and manage your internship completion certificates for faculty approval
              </p>
            </div>
            <Button 
              onClick={() => setShowUploadForm(!showUploadForm)}
              disabled={approvedInternships.length === 0}
              className="rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-700 transition-colors disabled:bg-gray-400 text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Upload Certificate
            </Button>
          </div>

          {/* No Approved Internships Message */}
          {approvedInternships.length === 0 && (
            <Card className="border-0 shadow-sm bg-amber-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-amber-800">No Approved Internships</h3>
                    <p className="text-amber-700 text-sm leading-relaxed mt-1">
                      You need to have approved internships before you can upload certificates. 
                      Please apply for internships and wait for faculty approval.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards - Responsive Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-purple-100">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-purple-700 leading-tight">Total Certificates</p>
                    <p className="text-lg sm:text-2xl font-bold text-purple-900 mt-1">{certificates.length}</p>
                  </div>
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50 to-amber-100">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-amber-700 leading-tight">Pending</p>
                    <p className="text-lg sm:text-2xl font-bold text-amber-900 mt-1">
                      {certificates.filter(c => c.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-emerald-100">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-emerald-700 leading-tight">Approved</p>
                    <p className="text-lg sm:text-2xl font-bold text-emerald-900 mt-1">
                      {certificates.filter(c => c.status === 'approved').length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-gradient-to-r from-rose-50 to-rose-100">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-rose-700 leading-tight">Rejected</p>
                    <p className="text-lg sm:text-2xl font-bold text-rose-900 mt-1">
                      {certificates.filter(c => c.status === 'rejected').length}
                    </p>
                  </div>
                  <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-rose-600 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload Form - Responsive */}
          {showUploadForm && approvedInternships.length > 0 && (
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-lg sm:text-xl text-gray-900">Upload Internship Certificate</CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-600">
                  Submit your internship completion certificate for an approved internship
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <form onSubmit={handleUploadCertificate} className="space-y-4 sm:space-y-6">
                  {/* Internship Selection - Responsive */}
                  <div className="space-y-2">
                    <Label htmlFor="internship-select" className="text-sm font-medium text-gray-700">
                      Select Approved Internship *
                    </Label>
                    <Select value={selectedInternship} onValueChange={setSelectedInternship}>
                      <SelectTrigger className="rounded-lg border-gray-300 focus:border-purple-500 text-sm">
                        <SelectValue placeholder="Choose from your approved internships" />
                      </SelectTrigger>
                      <SelectContent>
                        {approvedInternships.map((internship) => (
                          <SelectItem key={internship.id} value={internship.id.toString()}>
                            <div className="flex flex-col py-1">
                              <div className="font-medium text-sm">{internship.internship_title}</div>
                              <div className="text-xs text-gray-500 flex flex-wrap items-center gap-1 mt-1">
                                <div className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  <span className="truncate max-w-[120px]">{internship.company_name}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {new Date(internship.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                                    {new Date(internship.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                                  </span>
                                </div>
                                <span>•</span>
                                <span>{internship.duration}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedInternship && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-xs sm:text-sm">
                          <strong>Selected:</strong> {getSelectedInternshipData()?.internship_title} at {getSelectedInternshipData()?.company_name}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Notes - Responsive */}
                  <div className="space-y-2">
                    <Label htmlFor="additional-notes" className="text-sm font-medium text-gray-700">
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="additional-notes"
                      name="additional-notes"
                      placeholder="Any additional information about your internship achievements..."
                      rows={3}
                      className="rounded-lg border-gray-300 focus:border-purple-500 text-sm resize-none"
                    />
                  </div>

                  {/* File Upload - Responsive */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Certificate File (PDF) *
                    </Label>
                    <UploadZone 
                      onFileSelect={setSelectedFile}
                      selectedFile={selectedFile}
                      busy={isSubmitting}
                    />
                  </div>

                  {/* Form Actions - Responsive */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !selectedFile || !selectedInternship} 
                      className="rounded-lg px-4 sm:px-6 py-2.5 bg-purple-600 hover:bg-purple-700 transition-colors min-w-0 sm:min-w-[160px] order-2 sm:order-1"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm truncate">{submitProgress || "Uploading..."}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Certificate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={resetForm}
                      disabled={isSubmitting}
                      className="rounded-lg px-4 sm:px-6 py-2.5 border-gray-300 order-1 sm:order-2"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Certificates List - Responsive */}
          <div className="space-y-4 sm:space-y-6">
            {Array.isArray(certificates) && certificates.length > 0 ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Certificates</h2>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} total
                  </div>
                </div>
                
                {/* Responsive Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  {certificates.map((certificate) => (
                    <CertificateCard
                      key={certificate.id}
                      certificate={certificate}
                      onView={() => handleViewCertificate(certificate)}
                      onDownload={() => handleDownloadCertificate(certificate)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <Card className="border-0 shadow-sm bg-gray-50">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 sm:mb-6">
                    <Award className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No certificates uploaded yet</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed">
                    Upload your internship completion certificates for faculty approval and academic record keeping.
                  </p>
                  {approvedInternships.length > 0 ? (
                    <Button 
                      onClick={() => setShowUploadForm(true)}
                      className="rounded-lg px-4 sm:px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Your First Certificate
                    </Button>
                  ) : (
                    <div className="text-gray-500">
                      <p className="text-sm">Get your internships approved first to upload certificates</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}