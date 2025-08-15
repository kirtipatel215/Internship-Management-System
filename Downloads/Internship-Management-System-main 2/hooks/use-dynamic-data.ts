"use client"

import { useEffect, useState } from "react"
import { useRealtime } from "@/lib/realtime-context"
import {
  getCurrentUser,
  getCurrentStudent,
  getMyStudents,
  getMyReports,
  getMyCertificates,
  getMyNOCRequests,
  getMyApplications,
  getMyTasks,
} from "@/lib/auth-dynamic"
import type { User, Student, WeeklyReport, Certificate, NOCRequest, Application, AssignedTask } from "@/lib/data"

// Hook for current user data with real-time updates
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { onDataUpdate } = useRealtime()

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)

    if (currentUser) {
      const unsubscribe = onDataUpdate((event) => {
        if (event.type.includes("USER") && event.data.id === currentUser.id) {
          console.log("[v0] Current user updated:", event.data)
          setUser(event.data as User)
        }
      })

      return unsubscribe
    }
  }, [onDataUpdate])

  return { user, isLoading }
}

// Hook for current student data with real-time updates
export function useCurrentStudent() {
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { onDataUpdate } = useRealtime()

  useEffect(() => {
    const currentStudent = getCurrentStudent()
    setStudent(currentStudent)
    setIsLoading(false)

    if (currentStudent) {
      const unsubscribe = onDataUpdate((event) => {
        if (event.type.includes("STUDENT") && event.data.id === currentStudent.id) {
          console.log("[v0] Current student updated:", event.data)
          setStudent(event.data as Student)
        }
      })

      return unsubscribe
    }
  }, [onDataUpdate])

  return { student, isLoading }
}

// Hook for teacher's students with real-time updates
export function useMyStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { onDataUpdate } = useRealtime()

  useEffect(() => {
    const myStudents = getMyStudents()
    setStudents(myStudents)
    setIsLoading(false)

    const unsubscribe = onDataUpdate((event) => {
      if (event.type.includes("STUDENT")) {
        console.log("[v0] Student data updated, refreshing my students")
        const updatedStudents = getMyStudents()
        setStudents(updatedStudents)
      }
    })

    return unsubscribe
  }, [onDataUpdate])

  return { students, isLoading }
}

// Hook for user's reports with real-time updates
export function useMyReports() {
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { onDataUpdate } = useRealtime()

  useEffect(() => {
    const myReports = getMyReports()
    setReports(myReports)
    setIsLoading(false)

    const unsubscribe = onDataUpdate((event) => {
      if (event.type.includes("REPORT")) {
        console.log("[v0] Report data updated, refreshing my reports")
        const updatedReports = getMyReports()
        setReports(updatedReports)
      }
    })

    return unsubscribe
  }, [onDataUpdate])

  return { reports, isLoading }
}

// Hook for user's certificates with real-time updates
export function useMyCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { onDataUpdate } = useRealtime()

  useEffect(() => {
    const myCertificates = getMyCertificates()
    setCertificates(myCertificates)
    setIsLoading(false)

    const unsubscribe = onDataUpdate((event) => {
      if (event.type.includes("CERTIFICATE")) {
        console.log("[v0] Certificate data updated, refreshing my certificates")
        const updatedCertificates = getMyCertificates()
        setCertificates(updatedCertificates)
      }
    })

    return unsubscribe
  }, [onDataUpdate])

  return { certificates, isLoading }
}

// Hook for student's NOC requests with real-time updates
export function useMyNOCRequests() {
  const [nocRequests, setNocRequests] = useState<NOCRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { onDataUpdate } = useRealtime()

  useEffect(() => {
    const myNOCRequests = getMyNOCRequests()
    setNocRequests(myNOCRequests)
    setIsLoading(false)

    const unsubscribe = onDataUpdate((event) => {
      if (event.type.includes("NOC")) {
        console.log("[v0] NOC data updated, refreshing my NOC requests")
        const updatedNOCRequests = getMyNOCRequests()
        setNocRequests(updatedNOCRequests)
      }
    })

    return unsubscribe
  }, [onDataUpdate])

  return { nocRequests, isLoading }
}

// Hook for student's applications with real-time updates
export function useMyApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { onDataUpdate } = useRealtime()

  useEffect(() => {
    const myApplications = getMyApplications()
    setApplications(myApplications)
    setIsLoading(false)

    const unsubscribe = onDataUpdate((event) => {
      if (event.type.includes("APPLICATION")) {
        console.log("[v0] Application data updated, refreshing my applications")
        const updatedApplications = getMyApplications()
        setApplications(updatedApplications)
      }
    })

    return unsubscribe
  }, [onDataUpdate])

  return { applications, isLoading }
}

// Hook for teacher's tasks with real-time updates
export function useMyTasks() {
  const [tasks, setTasks] = useState<AssignedTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { onDataUpdate } = useRealtime()

  useEffect(() => {
    const myTasks = getMyTasks()
    setTasks(myTasks)
    setIsLoading(false)

    const unsubscribe = onDataUpdate((event) => {
      if (event.type.includes("TASK")) {
        console.log("[v0] Task data updated, refreshing my tasks")
        const updatedTasks = getMyTasks()
        setTasks(updatedTasks)
      }
    })

    return unsubscribe
  }, [onDataUpdate])

  return { tasks, isLoading }
}
