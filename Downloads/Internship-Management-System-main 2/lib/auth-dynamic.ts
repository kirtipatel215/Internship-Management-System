import { db } from "./database"
import type { User } from "./data"

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  const userData = localStorage.getItem("current_user")
  if (!userData) return null

  try {
    return JSON.parse(userData)
  } catch {
    return null
  }
}

export const setCurrentUser = (user: User | null) => {
  if (typeof window === "undefined") return

  if (user) {
    localStorage.setItem("current_user", JSON.stringify(user))
  } else {
    localStorage.removeItem("current_user")
  }
}

export const loginUser = async (email: string): Promise<User | null> => {
  try {
    // Find user in database
    let user = db.getUserByEmail(email)

    // If user doesn't exist, create them based on email domain
    if (!user) {
      const role = getUserRoleFromEmail(email)
      if (!role) return null

      const name = getNameFromEmail(email)
      const userData = {
        name,
        email,
        role,
        phone: "+91 9876543210",
        status: "active" as const,
        department:
          role === "student"
            ? "Computer Engineering"
            : role === "teacher"
              ? "Computer Engineering"
              : role === "tp-officer"
                ? "T&P Cell"
                : "IT Department",
        ...(role === "student" && { rollNumber: generateRollNumber() }),
        ...(role !== "student" && { employeeId: generateEmployeeId(role) }),
      }

      user = db.createUser(userData)

      // Create student record if user is a student
      if (role === "student" && user) {
        db.createStudent({
          name: user.name,
          email: user.email,
          rollNumber: user.rollNumber || generateRollNumber(),
          department: user.department || "Computer Engineering",
          semester: "6th",
          phone: user.phone,
          teacherId: 2, // Default teacher
          status: "active",
          progress: 0,
          reportsSubmitted: 0,
          totalReports: 12,
          lastActivity: new Date().toISOString().split("T")[0],
          cgpa: 8.0,
        })
      }
    }

    if (user) {
      // Update last login
      const updatedUser = db.updateUser(user.id, {
        lastLogin: new Date().toISOString(),
      })

      if (updatedUser) {
        setCurrentUser(updatedUser)

        // Log the login
        db.createSystemLog({
          userId: updatedUser.id,
          userName: updatedUser.name,
          action: "LOGIN",
          details: `User logged in successfully`,
          ipAddress: "127.0.0.1",
          userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "Unknown",
          status: "success",
        })

        return updatedUser
      }
    }

    return null
  } catch (error) {
    console.error("Login error:", error)
    return null
  }
}

export const logout = () => {
  const user = getCurrentUser()

  if (user) {
    // Log the logout
    db.createSystemLog({
      userId: user.id,
      userName: user.name,
      action: "LOGOUT",
      details: `User logged out`,
      ipAddress: "127.0.0.1",
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "Unknown",
      status: "success",
    })
  }

  setCurrentUser(null)

  if (typeof window !== "undefined") {
    window.location.href = "/auth"
  }
}

export const requireAuth = (allowedRoles?: string[]) => {
  const user = getCurrentUser()

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth"
    }
    return null
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/" + user.role
    }
    return null
  }

  return user
}

export const getUserRoleFromEmail = (email: string): User["role"] | null => {
  if (email.endsWith("@charusat.edu.in")) {
    return "student"
  } else if (email.endsWith("@charusat.ac.in")) {
    if (email.includes("admin") || email === "admin@charusat.ac.in") {
      return "admin"
    } else if (email.includes("tp") || email === "tp@charusat.ac.in") {
      return "tp-officer"
    } else {
      return "teacher"
    }
  }
  return null
}

export const getNameFromEmail = (email: string): string => {
  const name = email.split("@")[0]
  return name
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

const generateRollNumber = (): string => {
  const year = new Date().getFullYear().toString().slice(-2)
  const dept = "CE"
  const num = Math.floor(Math.random() * 999) + 1
  return `${year}${dept}${num.toString().padStart(3, "0")}`
}

const generateEmployeeId = (role: string): string => {
  const prefix = role === "teacher" ? "EMP" : role === "tp-officer" ? "TPO" : "ADM"
  const num = Math.floor(Math.random() * 999) + 1
  return `${prefix}${num.toString().padStart(3, "0")}`
}

// Get current user's student record
export const getCurrentStudent = () => {
  const user = getCurrentUser()
  if (!user || user.role !== "student") return null

  return db.getStudentByUserId(user.id)
}

// Get students for current teacher
export const getMyStudents = () => {
  const user = getCurrentUser()
  if (!user || user.role !== "teacher") return []

  return db.getStudentsByTeacher(user.id)
}

// Get reports for current user (student or teacher)
export const getMyReports = () => {
  const user = getCurrentUser()
  if (!user) return []

  if (user.role === "student") {
    const student = getCurrentStudent()
    return student ? db.getReportsByStudent(student.id) : []
  } else if (user.role === "teacher") {
    return db.getReportsByTeacher(user.id)
  }

  return []
}

// Get certificates for current user (student or teacher)
export const getMyCertificates = () => {
  const user = getCurrentUser()
  if (!user) return []

  if (user.role === "student") {
    const student = getCurrentStudent()
    return student ? db.getCertificatesByStudent(student.id) : []
  } else if (user.role === "teacher") {
    return db.getCertificatesByTeacher(user.id)
  }

  return []
}

// Get NOC requests for current student
export const getMyNOCRequests = () => {
  const user = getCurrentUser()
  if (!user || user.role !== "student") return []

  const student = getCurrentStudent()
  return student ? db.getNOCRequestsByStudent(student.id) : []
}

// Get applications for current student
export const getMyApplications = () => {
  const user = getCurrentUser()
  if (!user || user.role !== "student") return []

  const student = getCurrentStudent()
  return student ? db.getApplicationsByStudent(student.id) : []
}

// Get tasks for current teacher
export const getMyTasks = () => {
  const user = getCurrentUser()
  if (!user || user.role !== "teacher") return []

  return db.getTasksByTeacher(user.id)
}
