"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Users, Edit, Trash2, Mail, Phone, Calendar, AlertCircle, Eye, Loader2, ChevronRight, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { getAllUsers, updateUser, deleteUser, getUserById } from "@/lib/data"
import { AuthGuard } from "@/components/auth-guard"

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state with special roles support
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "student",
    department: "",
    roll_number: "",
    employee_id: "",
    designation: "",
    special_roles: [],
  })

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    students: 0,
    teachers: 0,
    activeToday: 0,
  })

  // Load users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await getAllUsers()
      setUsers(data)
      
      const studentsCount = data.filter(u => u.role === "student").length
      const teachersCount = data.filter(u => u.role === "teacher").length
      const activeCount = data.filter(u => u.is_active).length
      
      setStats({
        total: data.length,
        students: studentsCount,
        teachers: teachersCount,
        activeToday: activeCount,
      })
    } catch (err) {
      console.error("Error loading users:", err)
      setError("Failed to load users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    if (!selectedUser) return

    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      console.log("🔄 Submitting form data:", formData)
      console.log("📋 Special roles to update:", formData.special_roles)
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        roll_number: formData.roll_number,
        employee_id: formData.employee_id,
        designation: formData.designation,
        // Always send special_roles, even if empty array
        special_roles: formData.special_roles
      }
      
      console.log("📤 Sending update data:", updateData)
      
      const result = await updateUser(selectedUser.id, updateData)
      
      console.log("📥 Update result:", result)
      
      if (result.success) {
        setSuccess("User updated successfully!")
        setIsEditDialogOpen(false)
        resetForm()
        setSelectedUser(null)
        await loadUsers() // Wait for users to reload
        
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(result.error || "Failed to update user")
      }
    } catch (err) {
      console.error("❌ Error updating user:", err)
      setError("Failed to update user. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const result = await deleteUser(selectedUser.id)
      
      if (result.success) {
        setSuccess("User deleted successfully!")
        setIsDeleteDialogOpen(false)
        setSelectedUser(null)
        loadUsers()
        
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(result.error || "Failed to delete user")
      }
    } catch (err) {
      console.error("Error deleting user:", err)
      setError("Failed to delete user. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewUser = async (user) => {
    try {
      const fullUser = await getUserById(user.id)
      setSelectedUser(fullUser || user)
      setIsViewDialogOpen(true)
    } catch (err) {
      console.error("Error loading user details:", err)
      setSelectedUser(user)
      setIsViewDialogOpen(true)
    }
  }

  const openEditDialog = (user) => {
    console.log("🔍 Opening edit dialog for user:", user)
    setSelectedUser(user)
    
    // Parse special roles from user data
    let specialRoles = []
    if (user.special_roles) {
      try {
        if (typeof user.special_roles === 'string') {
          specialRoles = JSON.parse(user.special_roles)
          console.log("📋 Parsed special roles from string:", specialRoles)
        } else if (Array.isArray(user.special_roles)) {
          specialRoles = user.special_roles
          console.log("📋 Using special roles array:", specialRoles)
        }
      } catch (e) {
        console.error("❌ Error parsing special roles:", e)
        specialRoles = []
      }
    }
    
    console.log("✅ Final special roles:", specialRoles)
    
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "student",
      department: user.department || "",
      roll_number: user.roll_number || "",
      employee_id: user.employee_id || "",
      designation: user.designation || "",
      special_roles: Array.isArray(specialRoles) ? specialRoles : [],
    })
    
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (user) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "student",
      department: "",
      roll_number: "",
      employee_id: "",
      designation: "",
      special_roles: [],
    })
    setError("")
  }

  const toggleSpecialRole = (role) => {
    setFormData(prev => {
      const currentRoles = [...prev.special_roles]
      const roleIndex = currentRoles.indexOf(role)
      
      if (roleIndex > -1) {
        // Remove role
        currentRoles.splice(roleIndex, 1)
        console.log("➖ Removed special role:", role, "Remaining:", currentRoles)
      } else {
        // Add role
        currentRoles.push(role)
        console.log("➕ Added special role:", role, "Total:", currentRoles)
      }
      
      return {
        ...prev,
        special_roles: currentRoles
      }
    })
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "student": return "bg-blue-600"
      case "teacher": return "bg-green-600"
      case "tp_officer":
      case "tp-officer": return "bg-purple-600"
      case "admin": return "bg-red-600"
      default: return "bg-gray-600"
    }
  }

  const hasSpecialRoles = (user) => {
    if (!user.special_roles) return false
    try {
      const roles = typeof user.special_roles === 'string' 
        ? JSON.parse(user.special_roles) 
        : user.special_roles
      return Array.isArray(roles) && roles.length > 0
    } catch {
      return false
    }
  }

  const getSpecialRoles = (user) => {
    try {
      const roles = typeof user.special_roles === 'string' 
        ? JSON.parse(user.special_roles) 
        : user.special_roles
      return Array.isArray(roles) ? roles : []
    } catch {
      return []
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" ? true : user.role === filterRole
    const matchesStatus = filterStatus === "all" ? true : 
      (filterStatus === "active" ? user.is_active : !user.is_active)
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Manage all system users and their permissions</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Search and Filters */}
          <Card className="mb-4 md:mb-6">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-full min-w-[140px] md:w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="teacher">Teachers</SelectItem>
                      <SelectItem value="tp_officer">T&P Officers</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full min-w-[140px] md:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats - Horizontal scroll on mobile */}
          <div className="flex gap-3 mb-4 md:mb-6 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-x-visible">
            <Card className="min-w-[140px] md:min-w-0 flex-shrink-0">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-xl md:text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="min-w-[140px] md:min-w-0 flex-shrink-0">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">Students</p>
                    <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.students}</p>
                  </div>
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="min-w-[140px] md:min-w-0 flex-shrink-0">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">Faculty</p>
                    <p className="text-xl md:text-2xl font-bold text-green-600">{stats.teachers}</p>
                  </div>
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="min-w-[140px] md:min-w-0 flex-shrink-0">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">Active</p>
                    <p className="text-xl md:text-2xl font-bold text-purple-600">{stats.activeToday}</p>
                  </div>
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users List - Minimal cards */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 md:p-12 text-center">
                <Users className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center justify-between gap-3">
                      {/* User Info - Minimal */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm md:text-lg flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm md:text-base font-semibold truncate">{user.name || "Unnamed User"}</h3>
                            {hasSpecialRoles(user) && (
                              <Shield className="h-4 w-4 text-orange-500 flex-shrink-0" title="Special Permissions" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`${getRoleBadgeColor(user.role)} text-white text-xs`}>
                              {user.role?.replace("_", " ").toUpperCase()}
                            </Badge>
                            {hasSpecialRoles(user) && (
                              <div className="flex gap-1 flex-wrap">
                                {getSpecialRoles(user).map(role => (
                                  <Badge key={role} variant="outline" className="text-xs border-orange-500 text-orange-600">
                                    +{role.replace("_", " ").toUpperCase()}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <Badge variant={user.is_active ? "default" : "secondary"} className="text-xs">
                              {user.is_active ? "ACTIVE" : "INACTIVE"}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate hidden md:block">{user.email}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 md:gap-2 flex-shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewUser(user)}
                          className="h-8 px-2 md:px-3"
                        >
                          <Eye className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                          <span className="hidden md:inline">View</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditDialog(user)}
                          className="h-8 px-2 md:px-3"
                        >
                          <Edit className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                          <span className="hidden md:inline">Edit</span>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => openDeleteDialog(user)}
                          className="h-8 px-2 md:px-3"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>Update user information and permissions</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditUser}>
                <div className="grid gap-4 py-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input
                        id="edit-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Phone & Primary Role */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone</Label>
                      <Input
                        id="edit-phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-role">Primary Role</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="tp_officer">T&P Officer</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Special Roles Section */}
                  <div className="space-y-3 border rounded-lg p-4 bg-orange-50">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-orange-600" />
                      <Label className="text-base font-semibold">Special Role Permissions</Label>
                    </div>
                    <p className="text-sm text-gray-600">Grant this user access to multiple role interfaces. Primary role: <strong>{formData.role.replace("_", " ").toUpperCase()}</strong></p>
                    <div className="space-y-2">
                      {["student", "teacher", "tp_officer", "admin"].map((role) => {
                        const isPrimaryRole = formData.role === role
                        const isChecked = formData.special_roles.includes(role)
                        
                        return (
                          <div key={role} className="flex items-center space-x-2">
                            <Checkbox
                              id={`special-${role}`}
                              checked={isChecked}
                              onCheckedChange={() => toggleSpecialRole(role)}
                              disabled={isPrimaryRole}
                            />
                            <label
                              htmlFor={`special-${role}`}
                              className={`text-sm font-medium leading-none ${isPrimaryRole ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            >
                              {role.replace("_", " ").toUpperCase()}
                              {isPrimaryRole && <span className="text-gray-500 ml-2">(Primary Role - Cannot be deselected)</span>}
                              {isChecked && !isPrimaryRole && <span className="text-green-600 ml-2">✓ Granted</span>}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                    {formData.special_roles.length > 0 && (
                      <div className="mt-3 p-3 bg-white rounded border border-orange-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Currently selected special roles:</p>
                        <div className="flex gap-2 flex-wrap">
                          {formData.special_roles.map(role => (
                            <Badge key={role} className="bg-orange-600 text-white">
                              {role.replace("_", " ").toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-department">Department</Label>
                    <Input
                      id="edit-department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>

                  {/* Role-specific fields */}
                  {formData.role === "student" && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-roll">Roll Number</Label>
                      <Input
                        id="edit-roll"
                        value={formData.roll_number}
                        onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                      />
                    </div>
                  )}

                  {(formData.role === "teacher" || formData.role === "tp_officer") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-empid">Employee ID</Label>
                        <Input
                          id="edit-empid"
                          value={formData.employee_id}
                          onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-designation">Designation</Label>
                        <Input
                          id="edit-designation"
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Debug Info - Remove in production */}
                  <details className="text-xs bg-gray-50 p-3 rounded">
                    <summary className="cursor-pointer font-medium text-gray-700">🔍 Debug Info (for development)</summary>
                    <div className="mt-2 space-y-1 text-gray-600">
                      <p><strong>Primary Role:</strong> {formData.role}</p>
                      <p><strong>Special Roles Array:</strong> {JSON.stringify(formData.special_roles)}</p>
                      <p><strong>Special Roles Count:</strong> {formData.special_roles.length}</p>
                      <p><strong>Will be saved as:</strong> {formData.special_roles.length > 0 ? JSON.stringify(formData.special_roles) : 'null'}</p>
                    </div>
                  </details>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsEditDialogOpen(false)
                    resetForm()
                    setSelectedUser(null)
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Update User
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* View User Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>Complete user information</DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                      {selectedUser.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${getRoleBadgeColor(selectedUser.role)} text-white`}>
                          {selectedUser.role?.replace("_", " ").toUpperCase()}
                        </Badge>
                        {hasSpecialRoles(selectedUser) && (
                          <Badge variant="outline" className="border-orange-500 text-orange-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Special Permissions
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {hasSpecialRoles(selectedUser) && (
                    <Alert className="bg-orange-50 border-orange-200">
                      <Shield className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        <strong>Additional Role Access:</strong>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {getSpecialRoles(selectedUser).map(role => (
                            <Badge key={role} className="bg-orange-600 text-white">
                              {role.replace("_", " ").toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p className="font-medium">{selectedUser.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Department</Label>
                      <p className="font-medium">{selectedUser.department || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Status</Label>
                      <Badge variant={selectedUser.is_active ? "default" : "secondary"}>
                        {selectedUser.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {selectedUser.roll_number && (
                      <div>
                        <Label className="text-gray-600">Roll Number</Label>
                        <p className="font-medium">{selectedUser.roll_number}</p>
                      </div>
                    )}
                    {selectedUser.employee_id && (
                      <div>
                        <Label className="text-gray-600">Employee ID</Label>
                        <p className="font-medium">{selectedUser.employee_id}</p>
                      </div>
                    )}
                    {selectedUser.designation && (
                      <div>
                        <Label className="text-gray-600">Designation</Label>
                        <p className="font-medium">{selectedUser.designation}</p>
                      </div>
                    )}
                    {selectedUser.created_at && (
                      <div>
                        <Label className="text-gray-600">Joined Date</Label>
                        <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false)
                  openEditDialog(selectedUser)
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this user? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="py-4">
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      You are about to delete <strong>{selectedUser.name}</strong> ({selectedUser.email})
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setSelectedUser(null)
                }}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteUser} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}