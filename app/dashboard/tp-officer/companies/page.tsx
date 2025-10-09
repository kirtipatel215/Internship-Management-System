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
import { Building, Plus, CheckCircle, Clock, Eye, ExternalLink, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { getAllCompanies, createCompany, verifyCompany } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

export default function TPOfficerCompanies() {
  const [companies, setCompanies] = useState<any[]>([]) // Initialize as empty array
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setIsLoading(true)
        console.log("Loading companies...")
        const companiesData = await getAllCompanies()
        
        // Ensure we always have an array
        if (Array.isArray(companiesData)) {
          console.log(`Loaded ${companiesData.length} companies`)
          setCompanies(companiesData)
        } else {
          console.warn("Companies data is not an array:", companiesData)
          setCompanies([])
        }
      } catch (error) {
        console.error("Error loading companies:", error)
        setCompanies([])
        toast({
          title: "Error",
          description: "Failed to load companies. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadCompanies()
  }, [])

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)

    try {
      const newCompany = await createCompany({
        name: formData.get("name") as string,
        industry: formData.get("industry") as string,
        location: formData.get("location") as string,
        website: formData.get("website") as string,
        contactPerson: formData.get("contactPerson") as string,
        contactEmail: formData.get("contactEmail") as string,
        contactPhone: formData.get("contactPhone") as string,
        description: formData.get("description") as string,
      })

      setCompanies((prev) => [newCompany, ...prev])
      setShowAddForm(false)

      toast({
        title: "Company Added",
        description: "Company has been added successfully and is pending verification.",
      })

      // Reset form
      ;(e.target as HTMLFormElement).reset()
    } catch (error: any) {
      console.error("Error adding company:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add company. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyCompany = async (companyId: number) => {
    try {
      const result = await verifyCompany(companyId, "T&P Officer")
      
      if (result.success) {
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === companyId
              ? { ...company, verified: true, status: "active" }
              : company
          )
        )

        toast({
          title: "Company Verified",
          description: "Company has been verified successfully.",
        })
      } else {
        throw new Error(result.error || "Failed to verify company")
      }
    } catch (error: any) {
      console.error("Error verifying company:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to verify company. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Safe filtering with array check
  const filteredCompanies = Array.isArray(companies) 
    ? companies.filter((company) => {
        const searchMatch = company.name?.toLowerCase().includes(searchTerm.toLowerCase())
        const statusMatch = filterStatus === "all" || company.status === filterStatus
        return searchMatch && statusMatch
      })
    : []

  const verifiedCount = Array.isArray(companies) 
    ? companies.filter((company) => company.verified).length 
    : 0
    
  const pendingCount = Array.isArray(companies) 
    ? companies.filter((company) => !company.verified).length 
    : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Company Management</h1>
            <p className="text-gray-600">Manage and verify company partnerships</p>
          </div>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto mx-4">
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
                <DialogDescription>Add a new company to the verified partners list.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCompany} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input id="name" name="name" placeholder="Enter company name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select name="industry" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Information Technology">Information Technology</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Consulting">Consulting</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" name="location" placeholder="City, State" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" type="url" placeholder="https://company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input id="contactPerson" name="contactPerson" placeholder="HR Manager" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input id="contactEmail" name="contactEmail" type="email" placeholder="hr@company.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input id="contactPhone" name="contactPhone" placeholder="+91 9876543210" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of the company and its services"
                    rows={3}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Adding..." : "Add Company"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Company Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Companies</p>
                  <p className="text-2xl font-bold">{companies.length}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Partnerships</p>
                  <p className="text-2xl font-bold text-purple-600">{verifiedCount}</p>
                </div>
                <Building className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading companies...</p>
            </CardContent>
          </Card>
        )}

        {/* Companies List */}
        {!isLoading && filteredCompanies.length > 0 && (
          <div className="space-y-4">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-lg sm:text-xl font-semibold">{company.name}</h3>
                        {company.verified ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        <Badge variant="outline">{company.industry}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">
                            <strong>Location:</strong> {company.location}
                          </p>
                          <p className="text-gray-600 mb-1">
                            <strong>Contact:</strong> {company.contactPerson || company.contact_person}
                          </p>
                          <p className="text-gray-600">
                            <strong>Email:</strong> {company.contactEmail || company.contact_email}
                          </p>
                        </div>
                        <div>
                          {company.contactPhone || company.contact_phone ? (
                            <p className="text-gray-600 mb-1">
                              <strong>Phone:</strong> {company.contactPhone || company.contact_phone}
                            </p>
                          ) : null}
                          {company.website && (
                            <p className="text-gray-600 mb-1">
                              <strong>Website:</strong>{" "}
                              <a 
                                href={company.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {company.website}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                      {company.description && (
                        <p className="text-gray-700 text-sm mb-3">{company.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 lg:ml-4">
                      <Button variant="outline" size="sm" className="w-full lg:w-auto bg-transparent">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {company.website && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full lg:w-auto bg-transparent"
                          onClick={() => window.open(company.website, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Visit Website
                        </Button>
                      )}
                      {!company.verified && (
                        <Button 
                          size="sm" 
                          onClick={() => handleVerifyCompany(company.id)} 
                          className="w-full lg:w-auto"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify Company
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCompanies.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">No companies found</p>
              <p className="text-sm text-gray-400">
                {companies.length === 0 
                  ? "Click 'Add Company' to get started." 
                  : "Try adjusting your search criteria."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}