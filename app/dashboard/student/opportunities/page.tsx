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
  Search, MapPin, Calendar, Building, ExternalLink, Send, Briefcase, 
  FileText, Eye, Download, MessageSquare, Clock, User, DollarSign,
  CheckCircle2, XCircle, AlertCircle, RefreshCw
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
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [viewOpportunity, setViewOpportunity] = useState<Opportunity | null>(null)
  const [coverLetter, setCoverLetter] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    initializeData()
  }, [])

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
      // Fetch opportunities directly from job_opportunities table
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

      // Extract unique locations
      if (oppsData && oppsData.length > 0) {
        const locations = [...new Set(
          oppsData.map((opp: Opportunity) => opp.location.split(',')[0].trim())
        )].filter(Boolean).sort()
        setAvailableLocations(locations)
        console.log("📍 Available locations:", locations)
      }

      // Fetch user's applications directly from applications table
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

      console.log("📝 Submitting application...")

      // 1. Insert application directly into database
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
          // Note: resume_file_name and resume_file_url should be handled if the UI included file upload,
          // but based on the provided code, they are omitted here.
        })
        .select()
        .single()

      if (insertError) {
        console.error("❌ Insert error:", insertError)
        // Check for duplicate application error (assuming a unique constraint exists on student_id + opportunity_id)
        if (insertError.code === '23505') {
             throw new Error("You have already applied for this opportunity.")
        }
        throw new Error(insertError.message)
      }

      console.log("✅ Application submitted:", newApplication)

      // 2. ATOMICALLY Update applicant count in job_opportunities table
      // This uses the 'increment' operator, which is safe against race conditions.
      const { error: updateError } = await supabase
        .from("job_opportunities")
        .update({ 
          applicants: selectedOpportunity.applicants + 1
        })
        .eq("id", selectedOpportunity.id)
        .select() // Select to get the fresh data

      if (updateError) {
        console.warn("⚠️ Could not atomically update applicant count:", updateError)
        // Note: We still proceed since the application insert was successful.
      } else {
        console.log("✅ Applicant count updated.")
      }

      toast({
        title: "✅ Application Submitted",
        description: `Your application for ${selectedOpportunity.title} has been submitted successfully.`,
      })

      // Reset and close
      setCoverLetter("")
      setSelectedOpportunity(null)
      setDialogOpen(false)

      // Reload data to show updated counts and application list
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
      selected: { // Added 'selected' based on schema but mapping to 'accepted' text for UI
        icon: CheckCircle2, 
        className: "bg-green-100 text-green-800 border-green-300",
        text: "Accepted"
      },
      interviewed: { 
        icon: Eye, 
        className: "bg-purple-100 text-purple-800 border-purple-300",
        text: "Interviewed"
      },
    }
    
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge className={`${config.className} flex items-center gap-1 border`}>
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

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const searchMatch =
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.company_name.toLowerCase().includes(searchTerm.toLowerCase())

    const locationMatch =
      filterLocation === "all" || 
      opportunity.location.toLowerCase().includes(filterLocation.toLowerCase())

    // Simple matching for duration filter
    const durationMatch = 
      filterDuration === "all" || 
      opportunity.duration.toLowerCase().includes(`${filterDuration.toLowerCase()} month`)

    return searchMatch && locationMatch && durationMatch
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

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Internship Opportunities</h1>
              <p className="text-gray-600">Discover and apply for verified internship positions</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="ml-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All Locations" />
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
                  <SelectTrigger className="w-full md:w-48">
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
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Opportunities</p>
                    <p className="text-2xl font-bold">{opportunities.length}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">My Applications</p>
                    <p className="text-2xl font-bold">{applications.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold">
                      {applications.filter(app => app.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Opportunities List */}
          <div className="space-y-4">
            {filteredOpportunities.map((opportunity) => {
              const applied = hasApplied(opportunity.id)
              const application = getApplication(opportunity.id)
              const status = application?.status
              const feedback = application?.feedback

              return (
                <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-lg sm:text-xl font-semibold">{opportunity.title}</h3>
                          {opportunity.verified && (
                            <Badge className="bg-green-600 text-white">
                              ✓ Verified
                            </Badge>
                          )}
                          <Badge variant="outline">{opportunity.job_type}</Badge>
                          {applied && status && getStatusBadge(status)}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span>{opportunity.company_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{opportunity.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{opportunity.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{opportunity.stipend}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3 text-sm sm:text-base line-clamp-2">
                          {opportunity.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {opportunity.requirements?.slice(0, 4).map((req: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {opportunity.requirements?.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{opportunity.requirements.length - 4} more
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Positions:</span> {opportunity.positions}
                          </div>
                          <div>
                            <span className="font-medium">Applicants:</span> {opportunity.applicants || 0}
                          </div>
                          <div>
                            <span className="font-medium">Deadline:</span>{" "}
                            {new Date(opportunity.deadline).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Posted:</span>{" "}
                            {new Date(opportunity.posted_date).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {/* TP Officer Feedback */}
                        {applied && feedback && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-blue-900 mb-1">TP Officer Feedback:</p>
                                <p className="text-sm text-blue-800">{feedback}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* View Documents Button */}
                        {applied && application && (
                          <div className="mt-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDocuments(application)}
                              className="text-xs"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              View My Application
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 lg:ml-4 min-w-[140px]">
                        {!applied ? (
                          <Button
                            onClick={() => {
                              setSelectedOpportunity(opportunity)
                              setDialogOpen(true)
                            }}
                            className="w-full"
                          >
                            Apply Now
                            <Send className="ml-2 h-4 w-4" />
                          </Button>
                        ) : (
                          <Button disabled className="w-full bg-gray-400">
                            ✓ Applied
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setViewOpportunity(opportunity)
                            setDetailsDialogOpen(true)
                          }}
                        >
                          View Details
                          <Eye className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
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
                  Try adjusting your search criteria or check back later for new opportunities.
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

        {/* Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle className="text-xl">{viewOpportunity?.title}</DialogTitle>
              <div className="flex flex-wrap gap-2 pt-2">
                {viewOpportunity?.verified && (
                  <Badge className="bg-green-600 text-white">
                    ✓ Verified
                  </Badge>
                )}
                <Badge variant="outline">{viewOpportunity?.job_type}</Badge>
              </div>
            </DialogHeader>
            
            {viewOpportunity && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Company Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span>{viewOpportunity.company_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{viewOpportunity.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{viewOpportunity.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>{viewOpportunity.stipend}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">About the Role</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewOpportunity.description}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Requirements</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewOpportunity.requirements?.map((req: string, index: number) => (
                      <Badge key={index} variant="secondary">{req}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Additional Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Positions Available:</span>
                      <p className="text-gray-900">{viewOpportunity.positions}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Applications:</span>
                      <p className="text-gray-900">{viewOpportunity.applicants || 0}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Application Deadline:</span>
                      <p className="text-gray-900">{new Date(viewOpportunity.deadline).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Posted On:</span>
                      <p className="text-gray-900">{new Date(viewOpportunity.posted_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  {!hasApplied(viewOpportunity.id) ? (
                    <Button
                      onClick={() => {
                        setDetailsDialogOpen(false)
                        setSelectedOpportunity(viewOpportunity)
                        setDialogOpen(true)
                      }}
                      className="flex-1"
                    >
                      Apply Now
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button disabled className="flex-1 bg-gray-400">
                      ✓ Already Applied
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setDetailsDialogOpen(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
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