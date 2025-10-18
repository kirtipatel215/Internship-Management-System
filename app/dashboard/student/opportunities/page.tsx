"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
  Search, MapPin, Calendar, Building, Send, Briefcase, 
  FileText, Clock, DollarSign, CheckCircle2, XCircle, 
  RefreshCw, ChevronDown, ChevronUp, MessageSquare, Download
} from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser, downloadFile } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface Application {
  id: number
  student_id: string
  opportunity_id: number
  status: string
  feedback?: string | null
  cover_letter: string
  applied_date: string
  resume_file_name?: string | null
  resume_file_url?: string | null
}

interface Opportunity {
  id: number
  title: string
  company_name: string
  location: string
  duration: string
  description: string
  requirements: string[]
  stipend: string
  positions: number
  applicants: number
  deadline: string
  verified: boolean
  job_type: string
  status: string
  posted_date: string
}

export default function StudentOpportunities() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLocation, setFilterLocation] = useState("all")
  const [filterDuration, setFilterDuration] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [coverLetter, setCoverLetter] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    initializeData()
  }, [])

  // Show pending opportunities on load
  useEffect(() => {
    if (!loading && applications.length > 0) {
      setFilterStatus("pending")
    }
  }, [loading, applications])

  const initializeData = async () => {
    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to view opportunities",
          variant: "destructive",
        })
        return
      }
      setCurrentUser(user)
      await loadAllData(user.id)
    } catch (error) {
      console.error("❌ Initialization error:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAllData = async (userId: string) => {
    if (!supabase) {
      toast({
        title: "Error",
        description: "Database connection not available",
        variant: "destructive",
      })
      return
    }

    try {
      const { data: oppsData, error: oppsError } = await supabase
        .from("job_opportunities")
        .select("*")
        .eq("status", "active")
        .order("posted_date", { ascending: false })

      if (oppsError) {
        console.error("❌ Error loading opportunities:", oppsError)
        throw oppsError
      }

      console.log("✅ Loaded opportunities:", oppsData?.length || 0)
      setOpportunities(oppsData || [])

      if (oppsData && oppsData.length > 0) {
        const locations = [...new Set(
          oppsData.map((opp: Opportunity) => opp.location.split(',')[0].trim())
        )].filter(Boolean).sort()
        setAvailableLocations(locations)
      }

      const { data: appsData, error: appsError } = await supabase
        .from("applications")
        .select("*")
        .eq("student_id", userId)
        .order("applied_date", { ascending: false })

      if (appsError) {
        console.error("❌ Error loading applications:", appsError)
      } else {
        console.log("✅ Loaded applications:", appsData?.length || 0)
        setApplications(appsData || [])
      }

    } catch (error) {
      console.error("❌ Error in loadAllData:", error)
      throw error
    }
  }

  const handleRefresh = async () => {
    if (!currentUser) return
    setRefreshing(true)
    try {
      await loadAllData(currentUser.id)
      toast({
        title: "Refreshed",
        description: "Data updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleApply = async () => {
    if (!selectedOpportunity || !coverLetter.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (coverLetter.trim().length < 50) {
      toast({
        title: "Error",
        description: "Cover letter must be at least 50 characters.",
        variant: "destructive",
      })
      return
    }

    setIsApplying(true)

    try {
      if (!currentUser) throw new Error("User not found")
      if (!supabase) throw new Error("Database not available")

      console.log("🚀 Submitting application...")

      const { data: newApplication, error: insertError } = await supabase
        .from("applications")
        .insert({
          student_id: currentUser.id,
          student_name: currentUser.name,
          student_email: currentUser.email,
          opportunity_id: selectedOpportunity.id,
          cover_letter: coverLetter.trim(),
          status: "pending",
          applied_date: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error("❌ Insert error:", insertError)
        if (insertError.code === '23505') {
          throw new Error("You have already applied for this opportunity.")
        }
        throw new Error(insertError.message)
      }

      console.log("✅ Application submitted:", newApplication)

      // Update applicant count
      const { error: updateError } = await supabase
        .from("job_opportunities")
        .update({ 
          applicants: selectedOpportunity.applicants + 1
        })
        .eq("id", selectedOpportunity.id)

      if (updateError) {
        console.warn("⚠️ Could not update applicant count:", updateError)
      }

      toast({
        title: "✅ Application Submitted",
        description: `Your application for ${selectedOpportunity.title} has been submitted successfully.`,
      })

      setCoverLetter("")
      setSelectedOpportunity(null)
      setDialogOpen(false)

      await loadAllData(currentUser.id)

    } catch (error: any) {
      console.error("❌ Application error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApplying(false)
    }
  }

  const hasApplied = (opportunityId: number): boolean => {
    return applications.some(app => app.opportunity_id === opportunityId)
  }

  const getApplication = (opportunityId: number): Application | null => {
    return applications.find(app => app.opportunity_id === opportunityId) || null
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: any, className: string, text: string }> = {
      pending: { 
        icon: Clock, 
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        text: "Under Review"
      },
      shortlisted: { 
        icon: CheckCircle2, 
        className: "bg-blue-100 text-blue-800 border-blue-300",
        text: "Shortlisted"
      },
      rejected: { 
        icon: XCircle, 
        className: "bg-red-100 text-red-800 border-red-300",
        text: "Not Selected"
      },
      accepted: { 
        icon: CheckCircle2, 
        className: "bg-green-100 text-green-800 border-green-300",
        text: "Accepted"
      },
      selected: { 
        icon: CheckCircle2, 
        className: "bg-green-100 text-green-800 border-green-300",
        text: "Accepted"
      },
      interviewed: { 
        icon: CheckCircle2, 
        className: "bg-purple-100 text-purple-800 border-purple-300",
        text: "Interviewed"
      },
    }
    
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge className={`${config.className} flex items-center gap-1 border text-xs`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const handleViewDocuments = (app: Application) => {
    setSelectedApplication(app)
    setDocumentsDialogOpen(true)
  }

  const handleDownloadDocument = async (fileUrl: string, fileName: string) => {
    try {
      const result = await downloadFile(fileUrl, fileName)
      if (result.success) {
        toast({
          title: "Success",
          description: "Document downloaded successfully",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download document",
        variant: "destructive",
      })
    }
  }

  const toggleCard = (id: number) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCards(newExpanded)
  }

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const searchMatch =
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.company_name.toLowerCase().includes(searchTerm.toLowerCase())

    const locationMatch =
      filterLocation === "all" || 
      opportunity.location.toLowerCase().includes(filterLocation.toLowerCase())

    const durationMatch = 
      filterDuration === "all" || 
      opportunity.duration.toLowerCase().includes(`${filterDuration.toLowerCase()} month`)

    // Status filter based on application status
    let statusMatch = true
    if (filterStatus !== "all") {
      const application = getApplication(opportunity.id)
      if (filterStatus === "not-applied") {
        statusMatch = !application
      } else {
        statusMatch = application?.status === filterStatus
      }
    }

    return searchMatch && locationMatch && durationMatch && statusMatch
  })

  if (loading) {
    return (
      <AuthGuard allowedRoles={["student"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading opportunities...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const pendingCount = applications.filter(app => app.status === 'pending').length

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Internship Opportunities</h1>
              <p className="text-gray-600 text-sm">Discover and apply for verified internship positions</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="ml-4"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto sm:overflow-x-visible pb-1 sm:pb-0">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px] sm:w-[160px] flex-shrink-0">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="not-applied">Not Applied</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="interviewed">Interviewed</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterLocation} onValueChange={setFilterLocation}>
                    <SelectTrigger className="w-[140px] sm:w-[160px] flex-shrink-0">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {availableLocations.map((location) => (
                        <SelectItem key={location} value={location.toLowerCase()}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterDuration} onValueChange={setFilterDuration}>
                    <SelectTrigger className="w-[140px] sm:w-[160px] flex-shrink-0">
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Durations</SelectItem>
                      <SelectItem value="1">1 month</SelectItem>
                      <SelectItem value="2">2 months</SelectItem>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="4">4 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="flex sm:grid sm:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
            <Card className="flex-shrink-0 min-w-[200px] sm:min-w-0 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("all")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Total Opportunities</p>
                    <p className="text-2xl font-bold">{opportunities.length}</p>
                  </div>
                  <Briefcase className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="flex-shrink-0 min-w-[200px] sm:min-w-0 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("all")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">My Applications</p>
                    <p className="text-2xl font-bold">{applications.length}</p>
                  </div>
                  <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="flex-shrink-0 min-w-[200px] sm:min-w-0 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("pending")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold">{pendingCount}</p>
                  </div>
                  <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Opportunities List */}
          <div className="space-y-3 sm:space-y-4">
            {filteredOpportunities.map((opportunity) => {
              const applied = hasApplied(opportunity.id)
              const application = getApplication(opportunity.id)
              const status = application?.status
              const feedback = application?.feedback
              const isExpanded = expandedCards.has(opportunity.id)

              return (
                <Card key={opportunity.id} className="hover:shadow-md transition-shadow overflow-hidden">
                  <Collapsible open={isExpanded} onOpenChange={() => toggleCard(opportunity.id)}>
                    <CardContent className="p-4 sm:p-6">
                      {/* Minimal View */}
                      <div className="flex items-start justify-between gap-3">
                        <div 
                          className="flex-1 min-w-0 cursor-pointer" 
                          onClick={() => toggleCard(opportunity.id)}
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold truncate">{opportunity.title}</h3>
                            {opportunity.verified && (
                              <Badge className="bg-green-600 text-white text-xs flex-shrink-0">
                                ✓
                              </Badge>
                            )}
                            {applied && status && getStatusBadge(status)}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{opportunity.company_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{opportunity.location.split(',')[0]}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span>{opportunity.stipend}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{opportunity.positions} positions</span>
                            <span>•</span>
                            <span>{opportunity.applicants || 0} applicants</span>
                            <span>•</span>
                            <span className="hidden sm:inline">Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>
                            <span className="sm:hidden">Deadline: {new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {!applied ? (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedOpportunity(opportunity)
                                setDialogOpen(true)
                              }}
                              className="text-xs h-8 sm:h-9 sm:text-sm"
                            >
                              Apply
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                application && handleViewDocuments(application)
                              }}
                              className="text-xs h-8 sm:h-9 sm:text-sm"
                            >
                              View
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => toggleCard(opportunity.id)}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <CollapsibleContent className="pt-4 border-t mt-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Description</h4>
                            <p className="text-sm text-gray-700">{opportunity.description}</p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Requirements</h4>
                            <div className="flex flex-wrap gap-2">
                              {opportunity.requirements?.map((req: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                            <div>
                              <span className="font-medium">Duration:</span> {opportunity.duration}
                            </div>
                            <div>
                              <span className="font-medium">Type:</span> {opportunity.job_type}
                            </div>
                            <div>
                              <span className="font-medium">Posted:</span> {new Date(opportunity.posted_date).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Deadline:</span> {new Date(opportunity.deadline).toLocaleDateString()}
                            </div>
                          </div>

                          {applied && feedback && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-blue-900 mb-1">TP Officer Feedback:</p>
                                  <p className="text-sm text-blue-800">{feedback}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </CardContent>
                  </Collapsible>
                </Card>
              )
            })}
          </div>

          {filteredOpportunities.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2 font-medium">No opportunities found</p>
                <p className="text-sm text-gray-400">
                  Try adjusting your filters or check back later for new opportunities.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Apply Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px] mx-4">
            <DialogHeader>
              <DialogTitle>Apply for {selectedOpportunity?.title}</DialogTitle>
              <DialogDescription>
                Submit your application for this internship at {selectedOpportunity?.company_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cover-letter">Cover Letter *</Label>
                <Textarea
                  id="cover-letter"
                  placeholder="Write a compelling cover letter explaining why you're interested in this position and what makes you a good fit..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                <p className={`text-xs mt-1 ${coverLetter.length < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                  {coverLetter.length} characters (minimum 50 required)
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleApply} 
                  disabled={isApplying || coverLetter.trim().length < 50} 
                  className="flex-1"
                >
                  {isApplying ? "Submitting..." : "Submit Application"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    setSelectedOpportunity(null)
                    setCoverLetter("")
                  }}
                  disabled={isApplying}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Documents Dialog */}
        <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] mx-4 max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>My Application</DialogTitle>
              <DialogDescription>
                View your submitted application details
              </DialogDescription>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Application Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Applied Date</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {new Date(selectedApplication.applied_date).toLocaleString()}
                  </p>
                </div>

                {selectedApplication.feedback && (
                  <div>
                    <Label className="text-sm font-medium">TP Officer Feedback</Label>
                    <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">{selectedApplication.feedback}</p>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Cover Letter</Label>
                  <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedApplication.cover_letter}
                    </p>
                  </div>
                </div>

                {selectedApplication.resume_file_url && (
                  <div>
                    <Label className="text-sm font-medium">Resume</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-1"
                      onClick={() => handleDownloadDocument(
                        selectedApplication.resume_file_url!,
                        selectedApplication.resume_file_name || "resume.pdf"
                      )}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume ({selectedApplication.resume_file_name || "resume.pdf"})
                    </Button>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setDocumentsDialogOpen(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </AuthGuard>
  )
}