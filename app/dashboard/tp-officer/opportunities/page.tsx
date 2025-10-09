"use client"

import type React from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Briefcase, Plus, Eye, Edit, Trash2, MapPin, Calendar, Building, Users, CheckCircle, XCircle, MessageSquare } from "lucide-react"
import { useState, useEffect } from "react"
import { getAllOpportunities, createOpportunity, getAllCompanies, updateOpportunity, deleteOpportunity } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function TPOfficerOpportunities() {
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showApplicationsDialog, setShowApplicationsDialog] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingApplications, setLoadingApplications] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        console.log("Loading opportunities and companies...")
        
        const [opportunitiesData, companiesData] = await Promise.all([
          getAllOpportunities(),
          getAllCompanies()
        ])
        
        if (Array.isArray(opportunitiesData)) {
          console.log(`Loaded ${opportunitiesData.length} opportunities`)
          setOpportunities(opportunitiesData)
        } else {
          console.warn("Opportunities data is not an array:", opportunitiesData)
          setOpportunities([])
        }
        
        if (Array.isArray(companiesData)) {
          const verifiedCompanies = companiesData.filter((company) => company.verified)
          console.log(`Loaded ${verifiedCompanies.length} verified companies`)
          setCompanies(verifiedCompanies)
        } else {
          console.warn("Companies data is not an array:", companiesData)
          setCompanies([])
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setOpportunities([])
        setCompanies([])
        toast({
          title: "Error",
          description: "Failed to load data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAddOpportunity = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)

    try {
      const requirements = (formData.get("requirements") as string)
        .split(",")
        .map((req) => req.trim())
        .filter((req) => req)

      const newOpportunity = await createOpportunity({
        title: formData.get("title") as string,
        company: formData.get("company") as string,
        location: formData.get("location") as string,
        duration: formData.get("duration") as string,
        type: formData.get("type") as string,
        description: formData.get("description") as string,
        requirements,
        stipend: formData.get("stipend") as string,
        positions: Number.parseInt(formData.get("positions") as string),
        deadline: formData.get("deadline") as string,
        verified: true,
        postedBy: "3",
      })

      setOpportunities((prev) => [newOpportunity, ...prev])
      setShowAddForm(false)

      toast({
        title: "Opportunity Posted",
        description: "Internship opportunity has been posted successfully.",
      })

      ;(e.target as HTMLFormElement).reset()
    } catch (error: any) {
      console.error("Error posting opportunity:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to post opportunity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditOpportunity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOpportunity) return
    
    setIsSubmitting(true)
    const formData = new FormData(e.target as HTMLFormElement)

    try {
      const requirements = (formData.get("requirements") as string)
        .split(",")
        .map((req) => req.trim())
        .filter((req) => req)

      const result = await updateOpportunity(selectedOpportunity.id, {
        title: formData.get("title") as string,
        company: formData.get("company") as string,
        location: formData.get("location") as string,
        duration: formData.get("duration") as string,
        type: formData.get("type") as string,
        description: formData.get("description") as string,
        requirements,
        stipend: formData.get("stipend") as string,
        positions: Number.parseInt(formData.get("positions") as string),
        deadline: formData.get("deadline") as string,
      })

      if (result.success) {
        setOpportunities((prev) =>
          prev.map((opp) => (opp.id === selectedOpportunity.id ? { ...opp, ...result.data } : opp))
        )
        setShowEditForm(false)
        setSelectedOpportunity(null)

        toast({
          title: "Opportunity Updated",
          description: "Internship opportunity has been updated successfully.",
        })
      }
    } catch (error: any) {
      console.error("Error updating opportunity:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update opportunity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteOpportunity = async (opportunityId: number) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return

    try {
      const result = await deleteOpportunity(opportunityId)
      
      if (result.success) {
        setOpportunities((prev) => prev.filter((opp) => opp.id !== opportunityId))
        toast({
          title: "Opportunity Deleted",
          description: "Internship opportunity has been deleted successfully.",
        })
      }
    } catch (error: any) {
      console.error("Error deleting opportunity:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete opportunity. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewApplications = async (opportunity: any) => {
    setSelectedOpportunity(opportunity)
    setShowApplicationsDialog(true)
    setLoadingApplications(true)

    try {
      console.log("Fetching applications for opportunity:", opportunity.id)
      
      if (!supabase) {
        // Mock applications
        setApplications([
          {
            id: 1,
            student_name: "John Doe",
            student_email: "john.doe@charusat.edu.in",
            cover_letter: "I am very interested in this position...",
            resume_file_name: "john_doe_resume.pdf",
            resume_file_url: "https://example.com/resume.pdf",
            portfolio_url: "https://johndoe.portfolio.com",
            status: "pending",
            applied_date: new Date().toISOString(),
            feedback: null,
          },
          {
            id: 2,
            student_name: "Jane Smith",
            student_email: "jane.smith@charusat.edu.in",
            cover_letter: "I have 2 years of experience in React...",
            resume_file_name: "jane_smith_resume.pdf",
            resume_file_url: "https://example.com/resume2.pdf",
            portfolio_url: "https://janesmith.dev",
            status: "shortlisted",
            applied_date: new Date().toISOString(),
            feedback: "Good profile, schedule for interview",
          },
        ])
      } else {
        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .eq("opportunity_id", opportunity.id)
          .order("applied_date", { ascending: false })

        if (error) {
          console.error("Error fetching applications:", error)
          setApplications([])
        } else {
          setApplications(data || [])
        }
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      setApplications([])
    } finally {
      setLoadingApplications(false)
    }
  }

  const handleUpdateApplicationStatus = async (
    applicationId: number,
    newStatus: string,
    feedback?: string
  ) => {
    try {
      if (!supabase) {
        // Mock update
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId
              ? { ...app, status: newStatus, feedback: feedback || app.feedback }
              : app
          )
        )
        toast({
          title: "Application Updated",
          description: `Application status changed to ${newStatus}`,
        })
        return
      }

      const { error } = await supabase
        .from("applications")
        .update({
          status: newStatus,
          feedback: feedback || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)

      if (error) {
        console.error("Error updating application:", error)
        toast({
          title: "Error",
          description: "Failed to update application status.",
          variant: "destructive",
        })
      } else {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId
              ? { ...app, status: newStatus, feedback: feedback || app.feedback }
              : app
          )
        )
        toast({
          title: "Application Updated",
          description: `Application status changed to ${newStatus}`,
        })
      }
    } catch (error) {
      console.error("Error updating application:", error)
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (opportunity: any) => {
    setSelectedOpportunity(opportunity)
    setShowEditForm(true)
  }

  const activeOpportunities = Array.isArray(opportunities)
    ? opportunities.filter((opp) => opp.status === "active").length
    : 0
    
  const totalApplications = Array.isArray(opportunities)
    ? opportunities.reduce((sum, opp) => sum + (opp.applicants || 0), 0)
    : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Internship Opportunities</h1>
            <p className="text-gray-600">Manage and post internship opportunities for students</p>
          </div>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Post Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto mx-4">
              <DialogHeader>
                <DialogTitle>Post New Internship Opportunity</DialogTitle>
                <DialogDescription>Create a new internship opportunity for students to apply.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddOpportunity} className="space-y-4">
                <OpportunityForm companies={companies} isSubmitting={isSubmitting} onCancel={() => setShowAddForm(false)} />
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Opportunities</p>
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
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{activeOpportunities}</p>
                </div>
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-purple-600">{totalApplications}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-orange-600">{opportunities.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading opportunities...</p>
            </CardContent>
          </Card>
        )}

        {/* Opportunities List */}
        {!isLoading && opportunities.length > 0 && (
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-lg sm:text-xl font-semibold">{opportunity.title}</h3>
                        <Badge variant="default" className="bg-green-600">
                          {opportunity.status}
                        </Badge>
                        <Badge variant="outline">{opportunity.type || opportunity.job_type}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{opportunity.company || opportunity.company_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{opportunity.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{opportunity.duration}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3 text-sm sm:text-base">{opportunity.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Array.isArray(opportunity.requirements) && opportunity.requirements.map((req: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Stipend:</span> {opportunity.stipend}
                        </div>
                        <div>
                          <span className="font-medium">Positions:</span> {opportunity.positions}
                        </div>
                        <div>
                          <span className="font-medium">Applications:</span> {opportunity.applicants || 0}
                        </div>
                        <div>
                          <span className="font-medium">Deadline:</span>{" "}
                          {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 lg:ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full lg:w-auto bg-transparent"
                        onClick={() => handleViewApplications(opportunity)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Applications ({opportunity.applicants || 0})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full lg:w-auto bg-transparent"
                        onClick={() => openEditDialog(opportunity)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full lg:w-auto text-red-600 hover:text-red-700 bg-transparent"
                        onClick={() => handleDeleteOpportunity(opportunity.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && opportunities.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">No opportunities posted yet</p>
              <p className="text-sm text-gray-400">Click "Post Opportunity" to create your first internship listing.</p>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>Edit Internship Opportunity</DialogTitle>
              <DialogDescription>Update the internship opportunity details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditOpportunity} className="space-y-4">
              <OpportunityForm
                companies={companies}
                isSubmitting={isSubmitting}
                initialData={selectedOpportunity}
                onCancel={() => {
                  setShowEditForm(false)
                  setSelectedOpportunity(null)
                }}
              />
            </form>
          </DialogContent>
        </Dialog>

        {/* Applications Dialog */}
        <Dialog open={showApplicationsDialog} onOpenChange={setShowApplicationsDialog}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>
                Applications for {selectedOpportunity?.title}
              </DialogTitle>
              <DialogDescription>
                Review and manage student applications for this opportunity.
              </DialogDescription>
            </DialogHeader>
            
            {loadingApplications ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">No applications yet</p>
                <p className="text-sm text-gray-400">Students haven't applied to this opportunity yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onUpdateStatus={handleUpdateApplicationStatus}
                  />
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

// Reusable Opportunity Form Component
function OpportunityForm({
  companies,
  isSubmitting,
  initialData,
  onCancel,
}: {
  companies: any[]
  isSubmitting: boolean
  initialData?: any
  onCancel: () => void
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Position Title *</Label>
          <Input
            id="title"
            name="title"
            placeholder="Software Development Intern"
            defaultValue={initialData?.title}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Select name="company" defaultValue={initialData?.company || initialData?.company_name} required>
            <SelectTrigger>
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.length > 0 ? (
                companies.map((company) => (
                  <SelectItem key={company.id} value={company.name}>
                    {company.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  No verified companies available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            name="location"
            placeholder="Bangalore, Karnataka"
            defaultValue={initialData?.location}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration *</Label>
          <Select name="duration" defaultValue={initialData?.duration} required>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2 months">2 months</SelectItem>
              <SelectItem value="3 months">3 months</SelectItem>
              <SelectItem value="4 months">4 months</SelectItem>
              <SelectItem value="6 months">6 months</SelectItem>
              <SelectItem value="12 months">12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select name="type" defaultValue={initialData?.type || initialData?.job_type} required>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stipend">Stipend *</Label>
          <Input
            id="stipend"
            name="stipend"
            placeholder="₹25,000/month"
            defaultValue={initialData?.stipend}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="positions">Number of Positions *</Label>
          <Input
            id="positions"
            name="positions"
            type="number"
            placeholder="5"
            defaultValue={initialData?.positions}
            required
            min="1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Application Deadline *</Label>
          <Input
            id="deadline"
            name="deadline"
            type="date"
            defaultValue={initialData?.deadline}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Job Description *</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Detailed description of the internship role, responsibilities, and expectations..."
          rows={4}
          defaultValue={initialData?.description}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements *</Label>
        <Textarea
          id="requirements"
          name="requirements"
          placeholder="React, Node.js, JavaScript, Git (comma-separated)"
          rows={2}
          defaultValue={initialData?.requirements?.join(", ")}
          required
        />
        <p className="text-xs text-gray-500">Enter skills/requirements separated by commas</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (initialData ? "Updating..." : "Posting...") : initialData ? "Update Opportunity" : "Post Opportunity"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </>
  )
}

// Application Card Component
function ApplicationCard({
  application,
  onUpdateStatus,
}: {
  application: any
  onUpdateStatus: (id: number, status: string, feedback?: string) => void
}) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState(application.feedback || "")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "shortlisted":
        return "bg-blue-100 text-blue-800"
      case "interviewed":
        return "bg-purple-100 text-purple-800"
      case "selected":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-lg">{application.student_name}</h4>
              <p className="text-sm text-gray-600">{application.student_email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Applied: {new Date(application.applied_date).toLocaleDateString()}
              </p>
            </div>
            <Badge className={getStatusColor(application.status)}>
              {application.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <div>
              <Label className="text-sm font-medium">Cover Letter</Label>
              <p className="text-sm text-gray-700 mt-1">{application.cover_letter}</p>
            </div>

            {application.portfolio_url && (
              <div>
                <Label className="text-sm font-medium">Portfolio</Label>
                <a
                  href={application.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline block mt-1"
                >
                  {application.portfolio_url}
                </a>
              </div>
            )}

            {application.resume_file_url && (
              <div>
                <Label className="text-sm font-medium">Resume</Label>
                <a
                  href={application.resume_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline block mt-1"
                >
                  {application.resume_file_name || "View Resume"}
                </a>
              </div>
            )}

            {application.feedback && !showFeedback && (
              <div className="bg-gray-50 p-3 rounded">
                <Label className="text-sm font-medium">Feedback</Label>
                <p className="text-sm text-gray-700 mt-1">{application.feedback}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {application.status === "pending" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100"
                  onClick={() => onUpdateStatus(application.id, "shortlisted")}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Shortlist
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-50 hover:bg-red-100 text-red-600"
                  onClick={() => onUpdateStatus(application.id, "rejected")}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}

            {application.status === "shortlisted" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-purple-50 hover:bg-purple-100"
                  onClick={() => onUpdateStatus(application.id, "interviewed")}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Interviewed
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-50 hover:bg-red-100 text-red-600"
                  onClick={() => onUpdateStatus(application.id, "rejected")}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}

            {application.status === "interviewed" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 text-green-600"
                  onClick={() => onUpdateStatus(application.id, "selected")}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Select
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-50 hover:bg-red-100 text-red-600"
                  onClick={() => onUpdateStatus(application.id, "rejected")}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFeedback(!showFeedback)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              {showFeedback ? "Hide" : "Add"} Comment
            </Button>
          </div>

          {showFeedback && (
            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor={`feedback-${application.id}`}>Comment/Feedback</Label>
              <Textarea
                id={`feedback-${application.id}`}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback or comments..."
                rows={3}
                className="w-full"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onUpdateStatus(application.id, application.status, feedback)
                    setShowFeedback(false)
                  }}
                >
                  Save Comment
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowFeedback(false)
                    setFeedback(application.feedback || "")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}