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
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
	Plus, 
	Upload, 
	CheckCircle, 
	Clock, 
	AlertCircle, 
	MessageSquare, 
	Download, 
	FileText, 
	Calendar,
	Star,
	Eye,
	TrendingUp,
	Award,
	User,
	Building,
	Mail,
	Hash,
	Target,
	BookOpen,
	Filter,
	Search,
	Briefcase,
	MapPin,
	CalendarDays,
	Activity,
	CheckCircle2,
	XCircle
} from "lucide-react"
import { useState, useEffect } from "react"
import { getReportsByStudent, createWeeklyReport, getCurrentUser, getApprovedInternshipsByStudent, uploadFile, formatFileSize as formatDataFileSize } from "@/lib/data" // Added uploadFile and formatFileSize for completeness
import { useToast } from "@/hooks/use-toast"

// Define proper interfaces
interface WeeklyReport {
	id: number
	student_id?: string
	studentId?: string
	student_name?: string
	studentName?: string
	student_email?: string
	studentEmail?: string
	week_number?: number
	week?: number
	title: string
	description: string
	achievements: string[] | string
	status: 'pending' | 'approved' | 'revision_required' | 'rejected' // Added rejected for completeness
	file_name?: string
	fileName?: string
	file_url?: string
	fileUrl?: string
	file_size?: number
	fileSize?: number
	feedback?: string
	grade?: string
	submitted_date?: string
	submittedDate?: string
	created_at?: string
	createdAt?: string
	comments?: string
}

interface User {
	id: string
	name: string
	email: string
	role: string
	department?: string
	rollNumber?: string
	loginTime?: string
}

interface Internship {
	id: number
	company_name: string
	position: string
	start_date: string
	end_date: string
	duration: string
	isActive: boolean
	durationMonths: number
	expectedWeeks: number
	reports: WeeklyReport[]
	submittedWeeks: number
	completionRate: number
	status: 'active' | 'completed'
}

export default function WeeklyReports() {
	const [showForm, setShowForm] = useState<boolean>(false)
	const [reports, setReports] = useState<WeeklyReport[]>([])
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
	const [uploadedFile, setUploadedFile] = useState<File | null>(null)
	const [currentUser, setCurrentUser] = useState<User | null>(null)
	const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null)
	const [searchTerm, setSearchTerm] = useState<string>("")
	const [statusFilter, setStatusFilter] = useState<string>("all")
	const [internships, setInternships] = useState<Internship[]>([])
	const [selectedInternshipId, setSelectedInternshipId] = useState<number | null>(null)
	const [activeTab, setActiveTab] = useState<string>("active")
	const { toast } = useToast()

	useEffect(() => {
		const loadData = async () => {
			try {
				const user = await getCurrentUser()
				if (user) {
					setCurrentUser(user)
					
					// Fetch user's approved internships
					const approvedInternships = await getApprovedInternshipsByStudent(user.id)
					
					// Fetch all reports
					const userReports = await getReportsByStudent(user.id)
					setReports(Array.isArray(userReports) ? userReports : [])
					
					// Process internships with their reports
					const processedInternships = approvedInternships.map((internship: any) => {
						const startDate = new Date(internship.start_date)
						const endDate = new Date(internship.end_date)
						
						// Calculate expected weeks/months using the data service utilities (assuming they are correctly defined)
						// Since we don't have access to the original utility functions, we'll use a simple approximation here
						const durationMonths = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
						const expectedWeeks = Math.max(1, Math.ceil(durationMonths * 4.33)) // Approx weeks in a month
						
						// Determine if internship is active
						const today = new Date()
						const isActive = today >= startDate && today <= endDate
						
						// Filter reports for this internship (by date range)
						const internshipReports: WeeklyReport[] = userReports
							.filter((report: any) => {
								const reportDate = new Date(report.submitted_date || report.created_at)
								return reportDate >= startDate && reportDate <= endDate
							})
							.map((report: any) => ({
								// Normalize DB fields to UI fields
								...report,
								week: report.week_number || report.week,
								submittedDate: report.submitted_date || report.created_at,
								fileUrl: report.file_url || report.fileUrl,
								fileName: report.file_name || report.fileName,
								fileSize: report.file_size || report.fileSize,
								// Ensure achievements is an array for UI display
								achievements: Array.isArray(report.achievements) ? report.achievements : (report.achievements || '').split('\n').filter(Boolean),
							}));
						
						return {
							...internship,
							durationMonths,
							expectedWeeks,
							isActive,
							reports: internshipReports,
							submittedWeeks: internshipReports.length,
							completionRate: Math.round((internshipReports.length / expectedWeeks) * 100) || 0,
							status: today > endDate ? 'completed' : 'active'
						} as Internship
					})
					
					setInternships(processedInternships)
					
					// Set selected internship to active one by default
					const active = processedInternships.find((i: any) => i.isActive)
					if (active) {
						setSelectedInternshipId(active.id)
						setActiveTab('active')
					} else if (processedInternships.length > 0) {
						setSelectedInternshipId(processedInternships[0].id)
						setActiveTab(processedInternships[0].status)
					}
				} else {
					setReports([])
					setInternships([])
				}
			} catch (error) {
				console.error('Error loading user data:', error)
				toast({
					title: "Error",
					description: "Failed to load user data. Please refresh the page.",
					variant: "destructive",
				})
			}
		}

		loadData()
	}, [toast])

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			// Validate file type
			const allowedTypes = ['pdf', 'docx', 'doc']
			const fileExtension = file.name.split('.').pop()?.toLowerCase()
			
			if (!fileExtension || !allowedTypes.includes(fileExtension)) {
				toast({
					title: "❌ Invalid File Type",
					description: "Please upload a PDF or Word document.",
					variant: "destructive",
				})
				e.target.value = ''
				setUploadedFile(null)
				return
			}

			// Validate file size (10MB max)
			if (file.size > 10 * 1024 * 1024) {
				toast({
					title: "📁 File Too Large",
					description: "Please upload a file smaller than 10MB.",
					variant: "destructive",
				})
				e.target.value = ''
				setUploadedFile(null)
				return
			}

			setUploadedFile(file)
		}
	}

	const handleSubmitReport = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsSubmitting(true)

		const formData = new FormData(e.target as HTMLFormElement)

		if (!currentUser) {
			toast({
				title: "⚠️ Authentication Error",
				description: "User not found. Please refresh the page and try again.",
				variant: "destructive",
			})
			setIsSubmitting(false)
			return
		}

		try {
			const achievementsText = formData.get("achievements") as string
			const achievements = achievementsText
				.split("\n")
				.map(achievement => achievement.trim())
				.filter(achievement => achievement.length > 0)

			// Get current internship
			const currentInternship = internships.find(i => i.id === selectedInternshipId)
			
			// Determine the correct week number: 1 + (number of already submitted reports for this internship)
			const weekNumber = currentInternship ? currentInternship.reports.length + 1 : reports.length + 1 
			
			// Basic validation checks
			const title = formData.get("title") as string
			const description = formData.get("description") as string
			if (!title || !description || achievements.length === 0) {
				toast({
					title: "⚠️ Missing Fields",
					description: "Please fill in the Title, Description, and at least one Achievement.",
					variant: "destructive",
				})
				setIsSubmitting(false)
				return
			}

			const reportData = {
				studentId: currentUser.id,
				studentName: currentUser.name,
				studentEmail: currentUser.email,
				week: weekNumber,
				title: title,
				description: description,
				achievements: achievements,
				comments: (formData.get("comments") as string) || null,
			}

			console.log('Submitting report with data:', reportData)

			const newReport = await createWeeklyReport(reportData, uploadedFile || undefined)

			// Ensure the returned data matches the WeeklyReport interface structure
			const normalizedNewReport: WeeklyReport = {
				...newReport,
				id: newReport.id,
				week: newReport.week_number || newReport.week || reportData.week,
				title: newReport.title,
				description: newReport.description,
				achievements: newReport.achievements,
				status: newReport.status,
				studentId: newReport.student_id || newReport.studentId || reportData.studentId,
				studentName: newReport.student_name || newReport.studentName || reportData.studentName,
				studentEmail: newReport.student_email || newReport.studentEmail || reportData.studentEmail,
				fileName: newReport.file_name || newReport.fileName,
				fileUrl: newReport.file_url || newReport.fileUrl,
				fileSize: newReport.file_size || newReport.fileSize,
				submittedDate: newReport.submitted_date || newReport.submittedDate || newReport.created_at || newReport.createdAt || new Date().toISOString()
			}

			setReports((prev) => [...prev, normalizedNewReport])
			
			// Update internships state
			if (currentInternship) {
				setInternships(prev => prev.map(internship => {
					if (internship.id === currentInternship.id) {
						const updatedReports = [...internship.reports, normalizedNewReport]
						return {
							...internship,
							reports: updatedReports,
							submittedWeeks: updatedReports.length,
							completionRate: Math.round((updatedReports.length / internship.expectedWeeks) * 100)
						}
					}
					return internship
				}))
			}

			setShowForm(false)
			setUploadedFile(null)

			toast({
				title: "🎉 Report Submitted Successfully!",
				description: `Week ${weekNumber} report has been submitted and is pending review.`,
			})

			;(e.target as HTMLFormElement).reset()
		} catch (error: any) {
			console.error('Report submission error:', error)
			toast({
				title: "❌ Submission Failed",
				description: error.message || "Failed to submit report. Please try again.",
				variant: "destructive",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDownload = (report: WeeklyReport) => {
		if (report.fileUrl || report.file_url) {
			const link = document.createElement('a')
			link.href = report.fileUrl || report.file_url || ''
			link.download = report.fileName || report.file_name || `week_${report.week || report.week_number || 1}_report.pdf`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			
			toast({
				title: "📥 Download Started",
				description: "Your file is being downloaded.",
			})
		} else {
			toast({
				title: "❌ Download Error",
				description: "File not available for download.",
				variant: "destructive",
			})
		}
	}

	const activeInternships = internships.filter(i => i.isActive)
	const completedInternships = internships.filter(i => !i.isActive)
	const selectedInternship = internships.find(i => i.id === selectedInternshipId)

	const formatDate = (dateString: string | undefined): string => {
		if (!dateString) return 'Unknown date'
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			})
		} catch (error) {
			return 'Invalid date'
		}
	}

	const getStatusConfig = (status: string) => {
		switch (status) {
			case "approved":
				return {
					variant: "default" as const,
					icon: <CheckCircle className="h-3 w-3" />,
					text: "Approved",
					color: "text-green-600",
					bgColor: "bg-green-50",
					borderColor: "border-green-200"
				}
			case "revision_required":
				return {
					variant: "destructive" as const,
					icon: <AlertCircle className="h-3 w-3" />,
					text: "Needs Revision",
					color: "text-orange-600",
					bgColor: "bg-orange-50",
					borderColor: "border-orange-200"
				}
			case "rejected": // Added rejected status for completeness
				return {
					variant: "destructive" as const,
					icon: <XCircle className="h-3 w-3" />,
					text: "Rejected",
					color: "text-red-600",
					bgColor: "bg-red-50",
					borderColor: "border-red-200"
				}
			default:
				return {
					variant: "secondary" as const,
					icon: <Clock className="h-3 w-3" />,
					text: "Under Review",
					color: "text-blue-600",
					bgColor: "bg-blue-50",
					borderColor: "border-blue-200"
				}
		}
	}

	const getGradeColor = (grade: string) => {
		if (grade === 'A' || grade === 'A+') return 'text-green-600 bg-green-100'
		if (grade === 'B' || grade === 'B+') return 'text-blue-600 bg-blue-100'
		if (grade === 'C') return 'text-yellow-600 bg-yellow-100'
		if (grade === 'D' || grade === 'F') return 'text-red-600 bg-red-100' // Added fail grades
		return 'text-gray-600 bg-gray-100'
	}

	// Use the imported formatDataFileSize from the data service
	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes"
		return formatDataFileSize(bytes)
	}

	// Show loading state while user data is being fetched
	if (!currentUser) {
		return (
			<AuthGuard allowedRoles={["student"]}>
				<DashboardLayout>
					<div className="space-y-6">
						<div className="flex justify-center items-center h-64">
							<div className="text-center">
								<div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
								<p className="mt-4 text-gray-600 font-medium">Loading your reports...</p>
								<p className="text-sm text-gray-400">Please wait a moment</p>
							</div>
						</div>
					</div>
				</DashboardLayout>
			</AuthGuard>
		)
	}

	return (
		<AuthGuard allowedRoles={["student"]}>
			<DashboardLayout>
				<div className="space-y-8">
					{/* Header Section */}
					<div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
						<div className="flex justify-between items-start">
							<div>
								<div className="flex items-center gap-3 mb-2">
									<BookOpen className="h-8 w-8" />
									<h1 className="text-3xl font-bold">Weekly Reports</h1>
								</div>
								<p className="text-blue-100 mb-4">Track your internship progress by internship periods</p>
								<div className="flex items-center gap-4 text-sm">
									<div className="flex items-center gap-1">
										<User className="h-4 w-4" />
										<span>{currentUser.name}</span>
									</div>
									<div className="flex items-center gap-1">
										<Hash className="h-4 w-4" />
										<span>{currentUser.rollNumber}</span>
									</div>
									<div className="flex items-center gap-1">
										<Building className="h-4 w-4" />
										<span>{currentUser.department}</span>
									</div>
								</div>
							</div>
							{selectedInternship && (
								<Button 
									onClick={() => setShowForm(!showForm)} 
									disabled={isSubmitting || !selectedInternship.isActive}
									className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
									size="lg"
								>
									<Plus className="mr-2 h-5 w-5" />
									New Report (Week {selectedInternship.submittedWeeks + 1})
								</Button>
							)}
						</div>
					</div>

					{/* Internships Tabs */}
					<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="active" className="flex items-center gap-2">
								<Activity className="h-4 w-4" />
								Active Internships ({activeInternships.length})
							</TabsTrigger>
							<TabsTrigger value="completed" className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4" />
								Completed Internships ({completedInternships.length})
							</TabsTrigger>
						</TabsList>

						{/* Active Internships Tab */}
						<TabsContent value="active" className="space-y-6">
							{activeInternships.length === 0 ? (
								<Card className="shadow-sm">
									<CardContent className="p-12 text-center">
										<div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
											<Briefcase className="h-12 w-12 text-gray-400" />
										</div>
										<h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Internships</h3>
										<p className="text-gray-600 mb-6 max-w-md mx-auto">
											You don't have any active internships at the moment. Once your NOC is approved and your internship starts, you can submit weekly reports here.
										</p>
									</CardContent>
								</Card>
							) : (
								<div className="space-y-6">
									{activeInternships.map((internship) => (
										<Card 
											key={internship.id} 
											className={`border-l-4 shadow-lg cursor-pointer transition-all duration-300 ${
												internship.id === selectedInternshipId ? 'border-l-blue-600 ring-2 ring-blue-100' : 'border-l-green-500 hover:shadow-xl'
											}`}
											onClick={() => setSelectedInternshipId(internship.id)}
										>
											<CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<div className="flex items-center gap-3 mb-2">
															<Badge className="bg-green-500 hover:bg-green-600">
																<Activity className="h-3 w-3 mr-1" />
																Active
															</Badge>
															<CardTitle className="text-2xl">{internship.company_name}</CardTitle>
														</div>
														<CardDescription className="text-base">{internship.position}</CardDescription>
														<div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
															<div className="flex items-center gap-1">
																<Calendar className="h-4 w-4" />
																<span>{formatDate(internship.start_date)} - {formatDate(internship.end_date)}</span>
															</div>
															<div className="flex items-center gap-1">
																<CalendarDays className="h-4 w-4" />
																<span>{internship.durationMonths} months ({internship.expectedWeeks} weeks)</span>
															</div>
														</div>
													</div>
													<div className="text-right">
														<div className="text-3xl font-bold text-green-600">{internship.completionRate}%</div>
														<p className="text-sm text-gray-600">Completion</p>
													</div>
												</div>
											</CardHeader>
											<CardContent className="p-6">
												<div className="space-y-4">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-6">
															<div className="text-center">
																<p className="text-2xl font-bold text-blue-600">{internship.submittedWeeks}</p>
																<p className="text-sm text-gray-600">Submitted</p>
															</div>
															<div className="text-center">
																<p className="text-2xl font-bold text-orange-600">{Math.max(0, internship.expectedWeeks - internship.submittedWeeks)}</p>
																<p className="text-sm text-gray-600">Remaining</p>
															</div>
															<div className="text-center">
																<p className="text-2xl font-bold text-green-600">
																	{internship.reports.filter(r => r.status === 'approved').length}
																</p>
																<p className="text-sm text-gray-600">Approved</p>
															</div>
														</div>
														<Button 
															onClick={(e) => {
																e.stopPropagation(); // Prevent card onClick from triggering again
																setSelectedInternshipId(internship.id)
																window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
															}}
															variant="outline"
														>
															<Eye className="h-4 w-4 mr-2" />
															View Reports ({internship.reports.length})
														</Button>
													</div>
													<Progress value={internship.completionRate} className="h-3" />
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</TabsContent>

						{/* Completed Internships Tab */}
						<TabsContent value="completed" className="space-y-6">
							{completedInternships.length === 0 ? (
								<Card className="shadow-sm">
									<CardContent className="p-12 text-center">
										<div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
											<CheckCircle2 className="h-12 w-12 text-gray-400" />
										</div>
										<h3 className="text-xl font-semibold text-gray-900 mb-2">No Completed Internships</h3>
										<p className="text-gray-600 mb-6 max-w-md mx-auto">
											Once you complete your internships, they will appear here with all your submitted reports.
										</p>
									</CardContent>
								</Card>
							) : (
								<div className="space-y-6">
									{completedInternships.map((internship) => (
										<Card 
											key={internship.id} 
											className={`border-l-4 shadow-lg cursor-pointer transition-all duration-300 ${
												internship.id === selectedInternshipId ? 'border-l-blue-600 ring-2 ring-blue-100' : 'border-l-gray-400 hover:shadow-xl'
											}`}
											onClick={() => setSelectedInternshipId(internship.id)}
										>
											<CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<div className="flex items-center gap-3 mb-2">
															<Badge variant="secondary">
																<CheckCircle2 className="h-3 w-3 mr-1" />
																Completed
															</Badge>
															<CardTitle className="text-2xl">{internship.company_name}</CardTitle>
														</div>
														<CardDescription className="text-base">{internship.position}</CardDescription>
														<div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
															<div className="flex items-center gap-1">
																<Calendar className="h-4 w-4" />
																<span>{formatDate(internship.start_date)} - {formatDate(internship.end_date)}</span>
															</div>
															<div className="flex items-center gap-1">
																<CalendarDays className="h-4 w-4" />
																<span>{internship.durationMonths} months ({internship.expectedWeeks} weeks)</span>
															</div>
														</div>
													</div>
													<div className="text-right">
														<div className="text-3xl font-bold text-gray-600">{internship.completionRate}%</div>
														<p className="text-sm text-gray-600">Completion</p>
													</div>
												</div>
											</CardHeader>
											<CardContent className="p-6">
												<div className="space-y-4">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-6">
															<div className="text-center">
																<p className="text-2xl font-bold text-blue-600">{internship.submittedWeeks}</p>
																<p className="text-sm text-gray-600">Total Reports</p>
															</div>
															<div className="text-center">
																<p className="text-2xl font-bold text-green-600">
																	{internship.reports.filter(r => r.status === 'approved').length}
																</p>
																<p className="text-sm text-gray-600">Approved</p>
															</div>
															<div className="text-center">
																<p className="text-2xl font-bold text-orange-600">
																	{internship.reports.filter(r => r.status === 'revision_required').length}
																</p>
																<p className="text-sm text-gray-600">Revised</p>
															</div>
														</div>
														<Button 
															onClick={(e) => {
																e.stopPropagation();
																setSelectedInternshipId(internship.id)
																setActiveTab("completed")
																window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
															}}
															variant="outline"
														>
															<Eye className="h-4 w-4 mr-2" />
															View Reports ({internship.reports.length})
														</Button>
													</div>
													<Progress value={internship.completionRate} className="h-3" />
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>

					{/* Submit New Report Form - CORRECTED */}
					{showForm && selectedInternship && selectedInternship.isActive && (
						<Card className="shadow-lg border-2 border-blue-100">
							<CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
								<CardTitle className="flex items-center gap-3">
									<Upload className="h-6 w-6 text-blue-600" />
									Submit Weekly Report - Week {selectedInternship.submittedWeeks + 1}
								</CardTitle>
								<CardDescription>
									For {selectedInternship.company_name} - {selectedInternship.position}
								</CardDescription>
							</CardHeader>
							<CardContent className="p-6">
								<form onSubmit={handleSubmitReport} className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label htmlFor="title" className="flex items-center gap-2">
												<Target className="h-4 w-4" />
												Report Title *
											</Label>
											<Input 
												id="title" 
												name="title" 
												placeholder="e.g., Mobile App Development Progress" 
												required 
												disabled={isSubmitting}
												className="transition-colors focus:border-blue-400"
											/>
										</div>
										
										<div className="space-y-2">
											<Label htmlFor="report-file" className="flex items-center gap-2">
												<FileText className="h-4 w-4" />
												Report File (PDF/DOCX)
											</Label>
											<Input 
												id="report-file" 
												type="file" 
												accept=".pdf,.docx,.doc"
												onChange={handleFileChange}
												disabled={isSubmitting}
												className="transition-colors"
											/>
											{uploadedFile && (
												<div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
													<CheckCircle className="h-4 w-4 text-green-600" />
													<span className="text-sm text-green-700">
														{uploadedFile.name} ({formatFileSize(uploadedFile.size)})
													</span>
												</div>
											)}
										</div>
									</div>
									
									<div className="space-y-2">
										<Label htmlFor="description" className="flex items-center gap-2">
											<BookOpen className="h-4 w-4" />
											Work Description *
										</Label>
										<Textarea
											id="description"
											name="description"
											placeholder="Describe the tasks completed, challenges faced, and learning outcomes during this week..."
											rows={4}
											required
											disabled={isSubmitting}
											className="transition-colors focus:border-blue-400"
										/>
									</div>
									
									<div className="space-y-2">
										<Label htmlFor="achievements" className="flex items-center gap-2">
											<Award className="h-4 w-4" />
											Key Achievements *
										</Label>
										<Textarea
											id="achievements"
											name="achievements"
											placeholder="• Completed user authentication module&#10;• Fixed 5 critical bugs&#10;• Learned Redux state management"
											rows={3}
											required
											disabled={isSubmitting}
											className="transition-colors focus:border-blue-400"
										/>
									</div>
									
									<div className="space-y-2">
										<Label htmlFor="comments" className="flex items-center gap-2">
											<MessageSquare className="h-4 w-4" />
											Additional Comments (Optional)
										</Label>
										<Textarea
											id="comments"
											name="comments"
											placeholder="Any additional notes, questions for your mentor, or feedback about the internship experience..."
											rows={2}
											disabled={isSubmitting}
											className="transition-colors focus:border-blue-400"
										/>
									</div>
									
									<div className="flex gap-3 pt-4">
										<Button type="submit" disabled={isSubmitting} className="flex-1 md:flex-none" size="lg">
											{isSubmitting ? (
												<>
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
													Submitting...
												</>
											) : (
												<>
													<Upload className="mr-2 h-4 w-4" />
													Submit Report
												</>
											)}
										</Button>
										<Button 
											variant="outline" 
											type="button" 
											onClick={() => {
												setShowForm(false)
												setUploadedFile(null)
											}}
											disabled={isSubmitting}
											size="lg"
										>
											Cancel
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					)}

					{/* Reports List for Selected Internship */}
					{selectedInternship && (
						<div className="space-y-6">
							<Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="flex items-center gap-2">
												<Briefcase className="h-6 w-6 text-indigo-600" />
												Reports for {selectedInternship.company_name}
											</CardTitle>
											<CardDescription className="mt-1">
												{selectedInternship.position} • {selectedInternship.reports.length} of {selectedInternship.expectedWeeks} weeks completed
											</CardDescription>
										</div>
										<Badge variant={selectedInternship.isActive ? "default" : "secondary"} className="text-lg px-4 py-2">
											{selectedInternship.isActive ? (
												<>
													<Activity className="h-4 w-4 mr-2" />
													Active
												</>
											) : (
												<>
													<CheckCircle2 className="h-4 w-4 mr-2" />
													Completed
												</>
											)}
										</Badge>
									</div>
								</CardHeader>
							</Card>

							{/* Search and Filter */}
							<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
								<div className="flex items-center gap-4 w-full sm:w-auto">
									<div className="relative flex-1 sm:w-64">
										<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
										<Input
											placeholder="Search reports..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-10"
										/>
									</div>
									<div className="flex items-center gap-2">
										<Filter className="h-4 w-4 text-gray-500" />
										<select
											value={statusFilter}
											onChange={(e) => setStatusFilter(e.target.value)}
											className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="all">All Status</option>
											<option value="pending">Under Review</option>
											<option value="approved">Approved</option>
											<option value="revision_required">Needs Revision</option>
											<option value="rejected">Rejected</option>
										</select>
									</div>
								</div>
								<Badge variant="secondary" className="text-sm">
									{selectedInternship.reports.filter(report => {
										const achievementsString = Array.isArray(report.achievements) ? report.achievements.join(' ') : (report.achievements as string) || '';
										const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
												report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
												achievementsString.toLowerCase().includes(searchTerm.toLowerCase()); // Added achievements to search
										const matchesStatus = statusFilter === "all" || report.status === statusFilter
										return matchesSearch && matchesStatus
									}).length} reports found
								</Badge>
							</div>

							{/* Reports Cards */}
							<div className="space-y-4">
								{selectedInternship.reports
									.filter(report => {
										const achievementsString = Array.isArray(report.achievements) ? report.achievements.join(' ') : (report.achievements as string) || '';
										const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
												report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
												achievementsString.toLowerCase().includes(searchTerm.toLowerCase());
										const matchesStatus = statusFilter === "all" || report.status === statusFilter
										return matchesSearch && matchesStatus
									})
									.sort((a, b) => (b.week || b.week_number || 0) - (a.week || a.week_number || 0))
									.map((report) => {
										const statusConfig = getStatusConfig(report.status)
										const achievementsArray = Array.isArray(report.achievements) ? report.achievements : (report.achievements as string || '').split('\n').filter(Boolean);
										return (
											<Card key={report.id} className={`shadow-sm hover:shadow-md transition-all duration-200 border ${statusConfig.borderColor} ${statusConfig.bgColor}`}>
												<CardContent className="p-6">
													<div className="flex items-start justify-between">
														<div className="flex-1">
															<div className="flex items-center gap-3 mb-3">
																<div className="flex items-center gap-2">
																	<div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
																		<span className="text-sm font-bold text-blue-600">{report.week || report.week_number || 1}</span>
																	</div>
																	<h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
																</div>
																<Badge variant={statusConfig.variant} className="flex items-center gap-1">
																	{statusConfig.icon}
																	{statusConfig.text}
																</Badge>
																{report.grade && (
																	<Badge variant="outline" className={`${getGradeColor(report.grade)} font-bold`}>
																		<Star className="h-3 w-3 mr-1" />
																		{report.grade}
																	</Badge>
																)}
															</div>
															
															<div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
																<div className="flex items-center gap-1">
																	<Calendar className="h-4 w-4" />
																	<span>Submitted: {formatDate(report.submittedDate || report.submitted_date)}</span>
																</div>
																{(report.fileUrl || report.file_url) && (
																	<div className="flex items-center gap-1">
																		<FileText className="h-4 w-4" />
																		<span>File attached ({report.fileSize ? formatFileSize(report.fileSize) : 'N/A'})</span>
																	</div>
																)}
																{achievementsArray.length > 0 && (
																	<div className="flex items-center gap-1">
																		<Award className="h-4 w-4" />
																		<span>{achievementsArray.length} achievements</span>
																	</div>
																)}
															</div>
															
															<p className="text-gray-700 line-clamp-2 mb-4">{report.description}</p>

															{report.feedback && (
																<div className="bg-white/80 border border-gray-200 p-3 rounded-lg mb-3">
																	<div className="flex items-center gap-2 mb-1">
																		<MessageSquare className="h-4 w-4 text-blue-600" />
																		<span className="text-sm font-medium text-blue-600">Mentor Feedback:</span>
																	</div>
																	<p className="text-sm text-gray-700 line-clamp-2">{report.feedback}</p>
																</div>
															)}
														</div>
														
														<div className="flex flex-col gap-2 ml-6 w-32 flex-shrink-0">
															<Dialog>
																<DialogTrigger asChild>
																	<Button variant="outline" size="sm" className="w-full">
																		<Eye className="h-4 w-4 mr-1" />
																		View Details
																	</Button>
																</DialogTrigger>
																<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
																	<DialogHeader>
																		<DialogTitle className="flex items-center gap-3">
																			<div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
																				<span className="text-lg font-bold text-blue-600">{report.week || report.week_number || 1}</span>
																			</div>
																			Week {report.week || report.week_number || 1}: {report.title}
																		</DialogTitle>
																		<DialogDescription>
																			{selectedInternship.company_name} - {selectedInternship.position}
																		</DialogDescription>
																	</DialogHeader>
																	
																	<div className="space-y-6 mt-6">
																		{/* Status and Grade */}
																		<div className="flex items-center gap-4">
																			<Badge variant={statusConfig.variant} className="flex items-center gap-1">
																				{statusConfig.icon}
																				{statusConfig.text}
																			</Badge>
																			{report.grade && (
																				<Badge variant="outline" className={`${getGradeColor(report.grade)} font-bold text-lg px-3 py-1`}>
																					<Star className="h-4 w-4 mr-1" />
																					Grade: {report.grade}
																				</Badge>
																			)}
																		</div>

																		{/* Student Info */}
																		<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
																			<div className="flex items-center gap-2">
																				<User className="h-4 w-4 text-gray-500" />
																				<span className="text-sm text-gray-600">Student:</span>
																				<span className="font-medium">{report.studentName || report.student_name}</span>
																			</div>
																			<div className="flex items-center gap-2">
																				<Mail className="h-4 w-4 text-gray-500" />
																				<span className="text-sm text-gray-600">Email:</span>
																				<span className="font-medium">{report.studentEmail || report.student_email}</span>
																			</div>
																			<div className="flex items-center gap-2">
																				<Calendar className="h-4 w-4 text-gray-500" />
																				<span className="text-sm text-gray-600">Submitted:</span>
																				<span className="font-medium">{formatDate(report.submittedDate || report.submitted_date)}</span>
																			</div>
																			{(report.fileUrl || report.file_url) && (
																				<div className="flex items-center gap-2">
																					<FileText className="h-4 w-4 text-gray-500" />
																					<span className="text-sm text-gray-600">File:</span>
																					<span className="font-medium">{report.fileName || report.file_name || 'Report file'} ({report.fileSize ? formatFileSize(report.fileSize) : 'N/A'})</span>
																				</div>
																			)}
																		</div>

																		{/* Work Description */}
																		<div className="space-y-3">
																			<h4 className="font-semibold text-gray-900 flex items-center gap-2">
																				<BookOpen className="h-5 w-5 text-blue-600" />
																				Work Description
																			</h4>
																			<div className="p-4 bg-white border border-gray-200 rounded-lg">
																				<p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
																			</div>
																		</div>

																		{/* Key Achievements */}
																		{achievementsArray.length > 0 && (
																			<div className="space-y-3">
																				<h4 className="font-semibold text-gray-900 flex items-center gap-2">
																					<Award className="h-5 w-5 text-yellow-600" />
																					Key Achievements ({achievementsArray.length})
																				</h4>
																				<div className="p-4 bg-white border border-gray-200 rounded-lg">
																					<ul className="space-y-2">
																						{achievementsArray.map((achievement: string, index: number) => (
																							<li key={index} className="flex items-start gap-2">
																								<CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
																								<span className="text-gray-700">{achievement}</span>
																							</li>
																						))}
																					</ul>
																				</div>
																			</div>
																		)}

																		{/* Additional Comments */}
																		{report.comments && (
																			<div className="space-y-3">
																				<h4 className="font-semibold text-gray-900 flex items-center gap-2">
																					<MessageSquare className="h-5 w-5 text-purple-600" />
																					Additional Comments
																				</h4>
																				<div className="p-4 bg-white border border-gray-200 rounded-lg">
																					<p className="text-gray-700 whitespace-pre-wrap">{report.comments}</p>
																				</div>
																			</div>
																		)}

																		{/* Mentor Feedback */}
																		{report.feedback && (
																			<div className="space-y-3">
																				<h4 className="font-semibold text-gray-900 flex items-center gap-2">
																					<MessageSquare className="h-5 w-5 text-blue-600" />
																					Mentor Feedback
																				</h4>
																				<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
																					<p className="text-blue-800 whitespace-pre-wrap">{report.feedback}</p>
																				</div>
																			</div>
																		)}

																		{/* Action Buttons */}
																		<div className="flex gap-3 pt-4 border-t">
																			{(report.fileUrl || report.file_url) && (
																				<Button 
																					variant="outline" 
																					onClick={() => handleDownload(report)}
																					className="flex-1"
																				>
																					<Download className="h-4 w-4 mr-2" />
																					Download File
																				</Button>
																			)}
																			{report.status === "revision_required" && (
																				<Button 
																					onClick={() => {
																						toast({
																							title: "📝 Resubmission Feature",
																							description: "Feature coming soon for report resubmission.",
																						})
																					}}
																					className="flex-1"
																				>
																					<Upload className="h-4 w-4 mr-2" />
																					Resubmit Report
																				</Button>
																			)}
																		</div>
																	</div>
																</DialogContent>
															</Dialog>
															
															{(report.fileUrl || report.file_url) && (
																<Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
																	<Download className="h-4 w-4 mr-1" />
																	Download
																</Button>
															)}
															
															{report.status === "revision_required" && (
																<Button size="sm" onClick={() => {
																	toast({
																		title: "📝 Resubmission Feature",
																		description: "Feature coming soon for report resubmission.",
																	})
																}}>
																	<Upload className="h-4 w-4 mr-1" />
																	Resubmit
																</Button>
															)}
														</div>
													</div>
												</CardContent>
											</Card>
										)
									})}
							</div>

							{/* Empty State for No Reports */}
							{selectedInternship.reports.filter(report => {
								const achievementsString = Array.isArray(report.achievements) ? report.achievements.join(' ') : (report.achievements as string) || '';
								const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
										report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
										achievementsString.toLowerCase().includes(searchTerm.toLowerCase());
								const matchesStatus = statusFilter === "all" || report.status === statusFilter
								return matchesSearch && matchesStatus
							}).length === 0 && selectedInternship.reports.length === 0 && (
								<Card className="shadow-sm">
									<CardContent className="p-12 text-center">
										<div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
											<FileText className="h-12 w-12 text-gray-400" />
										</div>
										<h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
										<p className="text-gray-600 mb-6 max-w-md mx-auto">
											Start documenting your progress for {selectedInternship.company_name}. 
											Submit your first weekly report to track your achievements.
										</p>
										{selectedInternship.isActive && (
											<Button 
												onClick={() => {
													setShowForm(true)
													window.scrollTo({ top: 0, behavior: 'smooth' })
												}}
												size="lg"
												className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
											>
												<Plus className="mr-2 h-5 w-5" />
												Submit Your First Report
											</Button>
										)}
									</CardContent>
								</Card>
							)}

							{/* No Search Results */}
							{selectedInternship.reports.length > 0 && selectedInternship.reports.filter(report => {
								const achievementsString = Array.isArray(report.achievements) ? report.achievements.join(' ') : (report.achievements as string) || '';
								const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
										report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
										achievementsString.toLowerCase().includes(searchTerm.toLowerCase());
								const matchesStatus = statusFilter === "all" || report.status === statusFilter
								return matchesSearch && matchesStatus
							}).length === 0 && (
								<Card className="shadow-sm">
									<CardContent className="p-8 text-center">
										<div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
											<Search className="h-8 w-8 text-gray-400" />
										</div>
										<h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
										<p className="text-gray-600 mb-4">
											No reports match your current search criteria. Try adjusting your filters or search term.
										</p>
										<Button 
											variant="outline" 
											onClick={() => {
												setSearchTerm("")
												setStatusFilter("all")
											}}
										>
											Clear Filters
										</Button>
									</CardContent>
								</Card>
							)}
						</div>
					)}

					{/* No Internships at All */}
					{internships.length === 0 && (
						<Card className="shadow-sm">
							<CardContent className="p-12 text-center">
								<div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
									<Briefcase className="h-12 w-12 text-gray-400" />
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">No Internships Found</h3>
								<p className="text-gray-600 mb-6 max-w-md mx-auto">
									You haven't been approved for any internships yet. Once your NOC request is approved and your internship starts, you'll be able to submit weekly reports here.
								</p>
								<Button 
									onClick={() => window.location.href = '/student/noc-requests'}
									size="lg"
									className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
								>
									<Plus className="mr-2 h-5 w-5" />
									Request NOC
								</Button>
							</CardContent>
						</Card>
					)}

					{/* Summary Statistics Footer */}
					{internships.length > 0 && (
						<Card className="bg-gradient-to-r from-gray-50 to-blue-50 shadow-sm">
							<CardContent className="p-6">
								<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
									<div className="text-center">
										<p className="text-2xl font-bold text-gray-900">{internships.length}</p>
										<p className="text-sm text-gray-600">Total Internships</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-green-600">{activeInternships.length}</p>
										<p className="text-sm text-gray-600">Active</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-blue-600">{reports.length}</p>
										<p className="text-sm text-gray-600">Total Reports</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-purple-600">
											{reports.filter(r => r.status === 'approved').length}
										</p>
										<p className="text-sm text-gray-600">Approved Reports</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</DashboardLayout>
		</AuthGuard>
	)
}