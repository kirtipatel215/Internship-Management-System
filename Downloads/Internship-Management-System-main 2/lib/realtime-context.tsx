"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { subscribeToDatabase, type DatabaseEvent } from "./database"
import type {
  User,
  Student,
  WeeklyReport,
  Certificate,
  NOCRequest,
  Company,
  Opportunity,
  AssignedTask,
  Application,
} from "./data"

interface RealtimeContextType {
  // Real-time data
  users: User[]
  students: Student[]
  reports: WeeklyReport[]
  certificates: Certificate[]
  nocRequests: NOCRequest[]
  companies: Company[]
  opportunities: Opportunity[]
  tasks: AssignedTask[]
  applications: Application[]

  // Loading states
  isLoading: boolean

  // Refresh functions
  refreshData: () => void

  // Event handlers
  onDataUpdate: (callback: (event: DatabaseEvent) => void) => () => void
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

interface RealtimeProviderProps {
  children: ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [users, setUsers] = useState<User[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [nocRequests, setNocRequests] = useState<NOCRequest[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [tasks, setTasks] = useState<AssignedTask[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load initial data
  const loadData = async () => {
    try {
      setIsLoading(true)
      const { db } = await import("./database")

      setUsers(db.getAllUsers())
      setStudents(db.getAllStudents())
      setReports(db.getAllReports())
      setCertificates(db.getAllCertificates())
      setNocRequests(db.getAllNOCRequests())
      setCompanies(db.getAllCompanies())
      setOpportunities(db.getAllOpportunities())
      setTasks(db.getAllTasks())
      setApplications(db.getAllApplications())
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle real-time updates
  const handleDatabaseEvent = (event: DatabaseEvent) => {
    console.log("[v0] Database event received:", event.type, event.data)

    switch (event.type) {
      case "USER_CREATED":
      case "USER_UPDATED":
        setUsers((prev) => {
          const filtered = prev.filter((u) => u.id !== event.data.id)
          return [...filtered, event.data as User].sort((a, b) => a.id - b.id)
        })
        break
      case "USER_DELETED":
        setUsers((prev) => prev.filter((u) => u.id !== event.data.id))
        break

      case "STUDENT_CREATED":
      case "STUDENT_UPDATED":
        setStudents((prev) => {
          const filtered = prev.filter((s) => s.id !== event.data.id)
          return [...filtered, event.data as Student].sort((a, b) => a.id - b.id)
        })
        break
      case "STUDENT_DELETED":
        setStudents((prev) => prev.filter((s) => s.id !== event.data.id))
        break

      case "REPORT_CREATED":
      case "REPORT_UPDATED":
        setReports((prev) => {
          const filtered = prev.filter((r) => r.id !== event.data.id)
          return [...filtered, event.data as WeeklyReport].sort((a, b) => b.id - a.id)
        })
        break
      case "REPORT_DELETED":
        setReports((prev) => prev.filter((r) => r.id !== event.data.id))
        break

      case "CERTIFICATE_CREATED":
      case "CERTIFICATE_UPDATED":
        setCertificates((prev) => {
          const filtered = prev.filter((c) => c.id !== event.data.id)
          return [...filtered, event.data as Certificate].sort((a, b) => b.id - a.id)
        })
        break
      case "CERTIFICATE_DELETED":
        setCertificates((prev) => prev.filter((c) => c.id !== event.data.id))
        break

      case "NOC_CREATED":
      case "NOC_UPDATED":
        setNocRequests((prev) => {
          const filtered = prev.filter((n) => n.id !== event.data.id)
          return [...filtered, event.data as NOCRequest].sort((a, b) => b.id - a.id)
        })
        break
      case "NOC_DELETED":
        setNocRequests((prev) => prev.filter((n) => n.id !== event.data.id))
        break

      case "COMPANY_CREATED":
      case "COMPANY_UPDATED":
        setCompanies((prev) => {
          const filtered = prev.filter((c) => c.id !== event.data.id)
          return [...filtered, event.data as Company].sort((a, b) => a.id - b.id)
        })
        break
      case "COMPANY_DELETED":
        setCompanies((prev) => prev.filter((c) => c.id !== event.data.id))
        break

      case "OPPORTUNITY_CREATED":
      case "OPPORTUNITY_UPDATED":
        setOpportunities((prev) => {
          const filtered = prev.filter((o) => o.id !== event.data.id)
          return [...filtered, event.data as Opportunity].sort((a, b) => b.id - a.id)
        })
        break
      case "OPPORTUNITY_DELETED":
        setOpportunities((prev) => prev.filter((o) => o.id !== event.data.id))
        break

      case "TASK_CREATED":
      case "TASK_UPDATED":
        setTasks((prev) => {
          const filtered = prev.filter((t) => t.id !== event.data.id)
          return [...filtered, event.data as AssignedTask].sort((a, b) => b.id - a.id)
        })
        break
      case "TASK_DELETED":
        setTasks((prev) => prev.filter((t) => t.id !== event.data.id))
        break

      case "APPLICATION_CREATED":
      case "APPLICATION_UPDATED":
        setApplications((prev) => {
          const filtered = prev.filter((a) => a.id !== event.data.id)
          return [...filtered, event.data as Application].sort((a, b) => b.id - a.id)
        })
        break
      case "APPLICATION_DELETED":
        setApplications((prev) => prev.filter((a) => a.id !== event.data.id))
        break
    }
  }

  // Subscribe to database events
  useEffect(() => {
    loadData()
    const unsubscribe = subscribeToDatabase(handleDatabaseEvent)
    return unsubscribe
  }, [])

  const refreshData = () => {
    loadData()
  }

  const onDataUpdate = (callback: (event: DatabaseEvent) => void) => {
    return subscribeToDatabase(callback)
  }

  const value: RealtimeContextType = {
    users,
    students,
    reports,
    certificates,
    nocRequests,
    companies,
    opportunities,
    tasks,
    applications,
    isLoading,
    refreshData,
    onDataUpdate,
  }

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider")
  }
  return context
}

// Custom hooks for specific data
export function useUsers() {
  const { users, isLoading } = useRealtime()
  return { users, isLoading }
}

export function useStudents() {
  const { students, isLoading } = useRealtime()
  return { students, isLoading }
}

export function useReports() {
  const { reports, isLoading } = useRealtime()
  return { reports, isLoading }
}

export function useCertificates() {
  const { certificates, isLoading } = useRealtime()
  return { certificates, isLoading }
}

export function useNOCRequests() {
  const { nocRequests, isLoading } = useRealtime()
  return { nocRequests, isLoading }
}

export function useCompanies() {
  const { companies, isLoading } = useRealtime()
  return { companies, isLoading }
}

export function useOpportunities() {
  const { opportunities, isLoading } = useRealtime()
  return { opportunities, isLoading }
}

export function useTasks() {
  const { tasks, isLoading } = useRealtime()
  return { tasks, isLoading }
}

export function useApplications() {
  const { applications, isLoading } = useRealtime()
  return { applications, isLoading }
}
