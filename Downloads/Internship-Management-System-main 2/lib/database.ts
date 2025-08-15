import type {
  User,
  Student,
  WeeklyReport,
  Certificate,
  NOCRequest,
  Company,
  Opportunity,
  AssignedTask,
  TaskStatus,
  Application,
  SystemLog,
} from "./data"

// Database event types for real-time updates
export type DatabaseEvent =
  | { type: "USER_CREATED" | "USER_UPDATED" | "USER_DELETED"; data: User }
  | { type: "STUDENT_CREATED" | "STUDENT_UPDATED" | "STUDENT_DELETED"; data: Student }
  | { type: "REPORT_CREATED" | "REPORT_UPDATED" | "REPORT_DELETED"; data: WeeklyReport }
  | { type: "CERTIFICATE_CREATED" | "CERTIFICATE_UPDATED" | "CERTIFICATE_DELETED"; data: Certificate }
  | { type: "NOC_CREATED" | "NOC_UPDATED" | "NOC_DELETED"; data: NOCRequest }
  | { type: "COMPANY_CREATED" | "COMPANY_UPDATED" | "COMPANY_DELETED"; data: Company }
  | { type: "OPPORTUNITY_CREATED" | "OPPORTUNITY_UPDATED" | "OPPORTUNITY_DELETED"; data: Opportunity }
  | { type: "TASK_CREATED" | "TASK_UPDATED" | "TASK_DELETED"; data: AssignedTask }
  | { type: "APPLICATION_CREATED" | "APPLICATION_UPDATED" | "APPLICATION_DELETED"; data: Application }

// Event listeners for real-time updates
type EventListener = (event: DatabaseEvent) => void
const eventListeners: EventListener[] = []

// Subscribe to database events
export const subscribeToDatabase = (listener: EventListener) => {
  eventListeners.push(listener)
  return () => {
    const index = eventListeners.indexOf(listener)
    if (index > -1) {
      eventListeners.splice(index, 1)
    }
  }
}

// Emit database events
const emitEvent = (event: DatabaseEvent) => {
  eventListeners.forEach((listener) => listener(event))
}

// In-memory database with localStorage persistence
class InMemoryDatabase {
  private users: User[] = []
  private students: Student[] = []
  private reports: WeeklyReport[] = []
  private certificates: Certificate[] = []
  private nocRequests: NOCRequest[] = []
  private companies: Company[] = []
  private opportunities: Opportunity[] = []
  private tasks: AssignedTask[] = []
  private taskStatuses: TaskStatus[] = []
  private applications: Application[] = []
  private systemLogs: SystemLog[] = []

  constructor() {
    this.loadFromStorage()
    this.initializeDefaultData()
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return

    try {
      const data = localStorage.getItem("ims_database")
      if (data) {
        const parsed = JSON.parse(data)
        this.users = parsed.users || []
        this.students = parsed.students || []
        this.reports = parsed.reports || []
        this.certificates = parsed.certificates || []
        this.nocRequests = parsed.nocRequests || []
        this.companies = parsed.companies || []
        this.opportunities = parsed.opportunities || []
        this.tasks = parsed.tasks || []
        this.taskStatuses = parsed.taskStatuses || []
        this.applications = parsed.applications || []
        this.systemLogs = parsed.systemLogs || []
      }
    } catch (error) {
      console.error("Failed to load database from storage:", error)
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return

    try {
      const data = {
        users: this.users,
        students: this.students,
        reports: this.reports,
        certificates: this.certificates,
        nocRequests: this.nocRequests,
        companies: this.companies,
        opportunities: this.opportunities,
        tasks: this.tasks,
        taskStatuses: this.taskStatuses,
        applications: this.applications,
        systemLogs: this.systemLogs,
      }
      localStorage.setItem("ims_database", JSON.stringify(data))
    } catch (error) {
      console.error("Failed to save database to storage:", error)
    }
  }

  private initializeDefaultData() {
    // Initialize with four distinct email accounts if empty
    if (this.users.length === 0) {
      this.users = [
        {
          id: 1,
          name: "John Doe",
          email: "john.doe@charusat.edu.in",
          role: "student",
          department: "Computer Engineering",
          rollNumber: "21CE001",
          phone: "+91 9876543210",
          status: "active",
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Dr. Sarah Wilson",
          email: "sarah.wilson@charusat.ac.in",
          role: "teacher",
          department: "Computer Engineering",
          employeeId: "EMP001",
          phone: "+91 9876543220",
          status: "active",
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          name: "TP Officer",
          email: "tp@charusat.ac.in",
          role: "tp-officer",
          department: "T&P Cell",
          employeeId: "TPO001",
          phone: "+91 9876543230",
          status: "active",
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 4,
          name: "Admin User",
          email: "admin@charusat.ac.in",
          role: "admin",
          department: "IT Department",
          employeeId: "ADM001",
          phone: "+91 9876543240",
          status: "active",
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]

      // Initialize student data for the student user
      this.students = [
        {
          id: 1,
          name: "John Doe",
          email: "john.doe@charusat.edu.in",
          rollNumber: "21CE001",
          department: "Computer Engineering",
          semester: "6th",
          phone: "+91 9876543210",
          teacherId: 2,
          company: "TechCorp Solutions",
          position: "Software Developer Intern",
          status: "active",
          progress: 75,
          reportsSubmitted: 8,
          totalReports: 12,
          lastActivity: new Date().toISOString().split("T")[0],
          cgpa: 8.5,
        },
      ]

      // Initialize some sample companies
      this.companies = [
        {
          id: 1,
          name: "TechCorp Solutions",
          email: "hr@techcorp.com",
          website: "https://techcorp.com",
          industry: "Information Technology",
          location: "Ahmedabad, Gujarat",
          description: "Leading software development company",
          verificationStatus: "verified",
          verifiedBy: "TP Officer",
          verifiedAt: new Date().toISOString(),
          contactPerson: "Rajesh Kumar",
          contactPhone: "+91 9876543210",
          establishedYear: 2015,
          employeeCount: "100-500",
          submittedAt: new Date().toISOString(),
        },
      ]

      // Initialize some sample opportunities
      this.opportunities = [
        {
          id: 1,
          companyId: 1,
          companyName: "TechCorp Solutions",
          title: "Software Developer Intern",
          description: "Join our development team to work on cutting-edge web applications",
          requirements: ["React.js", "Node.js", "MongoDB"],
          skills: ["JavaScript", "HTML/CSS", "Git"],
          location: "Ahmedabad, Gujarat",
          duration: "6 months",
          stipend: 15000,
          type: "internship",
          status: "active",
          postedBy: "HR Team",
          postedAt: new Date().toISOString(),
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          positions: 5,
          applicants: 0,
        },
      ]

      this.saveToStorage()
    }
  }

  // User operations
  createUser(userData: Omit<User, "id" | "createdAt" | "lastLogin">): User {
    const newUser: User = {
      ...userData,
      id: Math.max(0, ...this.users.map((u) => u.id)) + 1,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }
    this.users.push(newUser)
    this.saveToStorage()
    emitEvent({ type: "USER_CREATED", data: newUser })
    return newUser
  }

  getUserByEmail(email: string): User | null {
    return this.users.find((user) => user.email === email) || null
  }

  getUserById(id: number): User | null {
    return this.users.find((user) => user.id === id) || null
  }

  updateUser(id: number, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex((user) => user.id === id)
    if (userIndex === -1) return null

    this.users[userIndex] = { ...this.users[userIndex], ...updates }
    this.saveToStorage()
    emitEvent({ type: "USER_UPDATED", data: this.users[userIndex] })
    return this.users[userIndex]
  }

  getAllUsers(): User[] {
    return [...this.users]
  }

  // Student operations
  createStudent(studentData: Omit<Student, "id">): Student {
    const newStudent: Student = {
      ...studentData,
      id: Math.max(0, ...this.students.map((s) => s.id)) + 1,
    }
    this.students.push(newStudent)
    this.saveToStorage()
    emitEvent({ type: "STUDENT_CREATED", data: newStudent })
    return newStudent
  }

  getStudentByUserId(userId: number): Student | null {
    const user = this.getUserById(userId)
    if (!user) return null
    return this.students.find((student) => student.email === user.email) || null
  }

  getStudentsByTeacher(teacherId: number): Student[] {
    return this.students.filter((student) => student.teacherId === teacherId)
  }

  updateStudent(id: number, updates: Partial<Student>): Student | null {
    const studentIndex = this.students.findIndex((student) => student.id === id)
    if (studentIndex === -1) return null

    this.students[studentIndex] = { ...this.students[studentIndex], ...updates }
    this.saveToStorage()
    emitEvent({ type: "STUDENT_UPDATED", data: this.students[studentIndex] })
    return this.students[studentIndex]
  }

  getAllStudents(): Student[] {
    return [...this.students]
  }

  // Weekly Report operations
  createReport(reportData: Omit<WeeklyReport, "id" | "submittedAt">): WeeklyReport {
    const newReport: WeeklyReport = {
      ...reportData,
      id: Math.max(0, ...this.reports.map((r) => r.id)) + 1,
      submittedAt: new Date().toISOString(),
    }
    this.reports.push(newReport)
    this.saveToStorage()
    emitEvent({ type: "REPORT_CREATED", data: newReport })
    return newReport
  }

  getReportsByStudent(studentId: number): WeeklyReport[] {
    return this.reports.filter((report) => report.studentId === studentId)
  }

  getReportsByTeacher(teacherId: number): WeeklyReport[] {
    return this.reports.filter((report) => report.teacherId === teacherId)
  }

  updateReport(id: number, updates: Partial<WeeklyReport>): WeeklyReport | null {
    const reportIndex = this.reports.findIndex((report) => report.id === id)
    if (reportIndex === -1) return null

    this.reports[reportIndex] = { ...this.reports[reportIndex], ...updates }
    this.saveToStorage()
    emitEvent({ type: "REPORT_UPDATED", data: this.reports[reportIndex] })
    return this.reports[reportIndex]
  }

  getAllReports(): WeeklyReport[] {
    return [...this.reports]
  }

  // Certificate operations
  createCertificate(certData: Omit<Certificate, "id" | "uploadDate">): Certificate {
    const newCert: Certificate = {
      ...certData,
      id: Math.max(0, ...this.certificates.map((c) => c.id)) + 1,
      uploadDate: new Date().toISOString(),
    }
    this.certificates.push(newCert)
    this.saveToStorage()
    emitEvent({ type: "CERTIFICATE_CREATED", data: newCert })
    return newCert
  }

  getCertificatesByStudent(studentId: number): Certificate[] {
    return this.certificates.filter((cert) => cert.studentId === studentId)
  }

  getCertificatesByTeacher(teacherId: number): Certificate[] {
    return this.certificates.filter((cert) => cert.teacherId === teacherId)
  }

  updateCertificate(id: number, updates: Partial<Certificate>): Certificate | null {
    const certIndex = this.certificates.findIndex((cert) => cert.id === id)
    if (certIndex === -1) return null

    this.certificates[certIndex] = { ...this.certificates[certIndex], ...updates }
    this.saveToStorage()
    emitEvent({ type: "CERTIFICATE_UPDATED", data: this.certificates[certIndex] })
    return this.certificates[certIndex]
  }

  getAllCertificates(): Certificate[] {
    return [...this.certificates]
  }

  // NOC Request operations
  createNOCRequest(nocData: Omit<NOCRequest, "id" | "submittedAt">): NOCRequest {
    const newNOC: NOCRequest = {
      ...nocData,
      id: Math.max(0, ...this.nocRequests.map((n) => n.id)) + 1,
      submittedAt: new Date().toISOString(),
    }
    this.nocRequests.push(newNOC)
    this.saveToStorage()
    emitEvent({ type: "NOC_CREATED", data: newNOC })
    return newNOC
  }

  getNOCRequestsByStudent(studentId: number): NOCRequest[] {
    return this.nocRequests.filter((noc) => noc.studentId === studentId)
  }

  updateNOCRequest(id: number, updates: Partial<NOCRequest>): NOCRequest | null {
    const nocIndex = this.nocRequests.findIndex((noc) => noc.id === id)
    if (nocIndex === -1) return null

    this.nocRequests[nocIndex] = { ...this.nocRequests[nocIndex], ...updates }
    this.saveToStorage()
    emitEvent({ type: "NOC_UPDATED", data: this.nocRequests[nocIndex] })
    return this.nocRequests[nocIndex]
  }

  getAllNOCRequests(): NOCRequest[] {
    return [...this.nocRequests]
  }

  // Company operations
  createCompany(companyData: Omit<Company, "id" | "submittedAt">): Company {
    const newCompany: Company = {
      ...companyData,
      id: Math.max(0, ...this.companies.map((c) => c.id)) + 1,
      submittedAt: new Date().toISOString(),
    }
    this.companies.push(newCompany)
    this.saveToStorage()
    emitEvent({ type: "COMPANY_CREATED", data: newCompany })
    return newCompany
  }

  updateCompany(id: number, updates: Partial<Company>): Company | null {
    const companyIndex = this.companies.findIndex((company) => company.id === id)
    if (companyIndex === -1) return null

    this.companies[companyIndex] = { ...this.companies[companyIndex], ...updates }
    this.saveToStorage()
    emitEvent({ type: "COMPANY_UPDATED", data: this.companies[companyIndex] })
    return this.companies[companyIndex]
  }

  getAllCompanies(): Company[] {
    return [...this.companies]
  }

  // Opportunity operations
  createOpportunity(oppData: Omit<Opportunity, "id" | "postedAt">): Opportunity {
    const newOpp: Opportunity = {
      ...oppData,
      id: Math.max(0, ...this.opportunities.map((o) => o.id)) + 1,
      postedAt: new Date().toISOString(),
    }
    this.opportunities.push(newOpp)
    this.saveToStorage()
    emitEvent({ type: "OPPORTUNITY_CREATED", data: newOpp })
    return newOpp
  }

  updateOpportunity(id: number, updates: Partial<Opportunity>): Opportunity | null {
    const oppIndex = this.opportunities.findIndex((opp) => opp.id === id)
    if (oppIndex === -1) return null

    this.opportunities[oppIndex] = { ...this.opportunities[oppIndex], ...updates }
    this.saveToStorage()
    emitEvent({ type: "OPPORTUNITY_UPDATED", data: this.opportunities[oppIndex] })
    return this.opportunities[oppIndex]
  }

  getAllOpportunities(): Opportunity[] {
    return [...this.opportunities]
  }

  getActiveOpportunities(): Opportunity[] {
    return this.opportunities.filter((opp) => opp.status === "active")
  }

  // Application operations
  createApplication(appData: Omit<Application, "id" | "submittedAt">): Application {
    const newApp: Application = {
      ...appData,
      id: Math.max(0, ...this.applications.map((a) => a.id)) + 1,
      submittedAt: new Date().toISOString(),
    }
    this.applications.push(newApp)

    // Update opportunity applicant count
    const opportunity = this.opportunities.find((opp) => opp.id === newApp.opportunityId)
    if (opportunity) {
      opportunity.applicants += 1
    }

    this.saveToStorage()
    emitEvent({ type: "APPLICATION_CREATED", data: newApp })
    return newApp
  }

  getApplicationsByStudent(studentId: number): Application[] {
    return this.applications.filter((app) => app.studentId === studentId)
  }

  getApplicationsByOpportunity(opportunityId: number): Application[] {
    return this.applications.filter((app) => app.opportunityId === opportunityId)
  }

  updateApplication(id: number, updates: Partial<Application>): Application | null {
    const appIndex = this.applications.findIndex((app) => app.id === id)
    if (appIndex === -1) return null

    this.applications[appIndex] = { ...this.applications[appIndex], ...updates }
    this.saveToStorage()
    emitEvent({ type: "APPLICATION_UPDATED", data: this.applications[appIndex] })
    return this.applications[appIndex]
  }

  getAllApplications(): Application[] {
    return [...this.applications]
  }

  // Task operations
  createTask(taskData: Omit<AssignedTask, "id" | "createdAt" | "updatedAt">): AssignedTask {
    const newTask: AssignedTask = {
      ...taskData,
      id: Math.max(0, ...this.tasks.map((t) => t.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.tasks.push(newTask)
    this.saveToStorage()
    emitEvent({ type: "TASK_CREATED", data: newTask })
    return newTask
  }

  getTasksByTeacher(teacherId: number): AssignedTask[] {
    return this.tasks.filter((task) => task.teacherId === teacherId && !task.isDeleted)
  }

  updateTask(id: number, updates: Partial<AssignedTask>): AssignedTask | null {
    const taskIndex = this.tasks.findIndex((task) => task.id === id)
    if (taskIndex === -1) return null

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.saveToStorage()
    emitEvent({ type: "TASK_UPDATED", data: this.tasks[taskIndex] })
    return this.tasks[taskIndex]
  }

  getAllTasks(): AssignedTask[] {
    return this.tasks.filter((task) => !task.isDeleted)
  }

  // System log operations
  createSystemLog(logData: Omit<SystemLog, "id" | "timestamp">): SystemLog {
    const newLog: SystemLog = {
      ...logData,
      id: Math.max(0, ...this.systemLogs.map((l) => l.id)) + 1,
      timestamp: new Date().toISOString(),
    }
    this.systemLogs.push(newLog)
    this.saveToStorage()
    return newLog
  }

  getSystemLogs(): SystemLog[] {
    return [...this.systemLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  // Analytics operations
  getAnalytics() {
    return {
      totalUsers: this.users.length,
      totalStudents: this.students.length,
      totalTeachers: this.users.filter((u) => u.role === "teacher").length,
      totalCompanies: this.companies.length,
      totalOpportunities: this.opportunities.length,
      totalApplications: this.applications.length,
      totalReports: this.reports.length,
      totalCertificates: this.certificates.length,
      totalNOCRequests: this.nocRequests.length,
      activeStudents: this.students.filter((s) => s.status === "active").length,
      completedStudents: this.students.filter((s) => s.status === "completed").length,
      verifiedCompanies: this.companies.filter((c) => c.verificationStatus === "verified").length,
      activeOpportunities: this.opportunities.filter((o) => o.status === "active").length,
      approvedReports: this.reports.filter((r) => r.status === "approved").length,
      approvedCertificates: this.certificates.filter((c) => c.status === "approved").length,
      approvedNOCs: this.nocRequests.filter((n) => n.status === "approved").length,
    }
  }
}

// Create singleton database instance
export const database = new InMemoryDatabase()

// Export database operations
export const db = {
  // User operations
  createUser: (userData: Omit<User, "id" | "createdAt" | "lastLogin">) => database.createUser(userData),
  getUserByEmail: (email: string) => database.getUserByEmail(email),
  getUserById: (id: number) => database.getUserById(id),
  updateUser: (id: number, updates: Partial<User>) => database.updateUser(id, updates),
  getAllUsers: () => database.getAllUsers(),

  // Student operations
  createStudent: (studentData: Omit<Student, "id">) => database.createStudent(studentData),
  getStudentByUserId: (userId: number) => database.getStudentByUserId(userId),
  getStudentsByTeacher: (teacherId: number) => database.getStudentsByTeacher(teacherId),
  updateStudent: (id: number, updates: Partial<Student>) => database.updateStudent(id, updates),
  getAllStudents: () => database.getAllStudents(),

  // Report operations
  createReport: (reportData: Omit<WeeklyReport, "id" | "submittedAt">) => database.createReport(reportData),
  getReportsByStudent: (studentId: number) => database.getReportsByStudent(studentId),
  getReportsByTeacher: (teacherId: number) => database.getReportsByTeacher(teacherId),
  updateReport: (id: number, updates: Partial<WeeklyReport>) => database.updateReport(id, updates),
  getAllReports: () => database.getAllReports(),

  // Certificate operations
  createCertificate: (certData: Omit<Certificate, "id" | "uploadDate">) => database.createCertificate(certData),
  getCertificatesByStudent: (studentId: number) => database.getCertificatesByStudent(studentId),
  getCertificatesByTeacher: (teacherId: number) => database.getCertificatesByTeacher(teacherId),
  updateCertificate: (id: number, updates: Partial<Certificate>) => database.updateCertificate(id, updates),
  getAllCertificates: () => database.getAllCertificates(),

  // NOC operations
  createNOCRequest: (nocData: Omit<NOCRequest, "id" | "submittedAt">) => database.createNOCRequest(nocData),
  getNOCRequestsByStudent: (studentId: number) => database.getNOCRequestsByStudent(studentId),
  updateNOCRequest: (id: number, updates: Partial<NOCRequest>) => database.updateNOCRequest(id, updates),
  getAllNOCRequests: () => database.getAllNOCRequests(),

  // Company operations
  createCompany: (companyData: Omit<Company, "id" | "submittedAt">) => database.createCompany(companyData),
  updateCompany: (id: number, updates: Partial<Company>) => database.updateCompany(id, updates),
  getAllCompanies: () => database.getAllCompanies(),

  // Opportunity operations
  createOpportunity: (oppData: Omit<Opportunity, "id" | "postedAt">) => database.createOpportunity(oppData),
  updateOpportunity: (id: number, updates: Partial<Opportunity>) => database.updateOpportunity(id, updates),
  getAllOpportunities: () => database.getAllOpportunities(),
  getActiveOpportunities: () => database.getActiveOpportunities(),

  // Application operations
  createApplication: (appData: Omit<Application, "id" | "submittedAt">) => database.createApplication(appData),
  getApplicationsByStudent: (studentId: number) => database.getApplicationsByStudent(studentId),
  getApplicationsByOpportunity: (opportunityId: number) => database.getApplicationsByOpportunity(opportunityId),
  updateApplication: (id: number, updates: Partial<Application>) => database.updateApplication(id, updates),
  getAllApplications: () => database.getAllApplications(),

  // Task operations
  createTask: (taskData: Omit<AssignedTask, "id" | "createdAt" | "updatedAt">) => database.createTask(taskData),
  getTasksByTeacher: (teacherId: number) => database.getTasksByTeacher(teacherId),
  updateTask: (id: number, updates: Partial<AssignedTask>) => database.updateTask(id, updates),
  getAllTasks: () => database.getAllTasks(),

  // System log operations
  createSystemLog: (logData: Omit<SystemLog, "id" | "timestamp">) => database.createSystemLog(logData),
  getSystemLogs: () => database.getSystemLogs(),

  // Analytics
  getAnalytics: () => database.getAnalytics(),
}
