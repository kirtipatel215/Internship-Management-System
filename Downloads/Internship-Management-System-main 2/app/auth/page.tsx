"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Chrome, ArrowLeft, Loader2, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { loginUser, getUserRoleFromEmail } from "@/lib/auth-dynamic"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleGoogleLogin = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      })
      return
    }

    const role = getUserRoleFromEmail(email)
    if (!role) {
      toast({
        title: "Invalid Email Domain",
        description: "Please use your institutional email address (@charusat.edu.in or @charusat.ac.in).",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const user = await loginUser(email)

      if (user) {
        toast({
          title: "Login Successful",
          description: `Welcome ${user.name}! Redirecting to ${role.replace("-", " ")} dashboard...`,
        })

        // Small delay for better UX
        setTimeout(() => {
          router.push(`/dashboard/${role}`)
        }, 1000)
      } else {
        throw new Error("Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: "Unable to sign in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getNameFromEmail = (email: string): string => {
    const name = email.split("@")[0]
    return name
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  }

  const getRoleDescription = (email: string): string => {
    const role = getUserRoleFromEmail(email)
    switch (role) {
      case "student":
        return "Student Portal - Apply for NOC, submit reports, track progress"
      case "teacher":
        return "Faculty Portal - Review reports, approve certificates, mentor students"
      case "tp-officer":
        return "T&P Portal - Manage NOC requests, verify companies, post opportunities"
      case "admin":
        return "Admin Portal - System oversight, analytics, user management"
      default:
        return "Please enter a valid institutional email address"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription className="text-gray-600">
              Enter your institutional email to access the appropriate portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.name@charusat.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleGoogleLogin()
                  }
                }}
              />
            </div>

            {email && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-700">{getRoleDescription(email)}</p>
              </div>
            )}

            <Button className="w-full h-11" size="lg" onClick={handleGoogleLogin} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Chrome className="h-5 w-5 mr-2" />
                  Continue with Google
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">Supported email domains:</p>
              <div className="flex flex-col space-y-1">
                <p className="text-xs text-gray-500">@charusat.edu.in (Students)</p>
                <p className="text-xs text-gray-500">@charusat.ac.in (Faculty/Staff)</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-2 text-center">Demo Credentials (Click to auto-fill):</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setEmail("john.doe@charusat.edu.in")}
                  className="p-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors text-left"
                  disabled={isLoading}
                >
                  <p className="font-medium">Student:</p>
                  <p className="text-gray-600">john.doe@charusat.edu.in</p>
                </button>
                <button
                  onClick={() => setEmail("sarah.wilson@charusat.ac.in")}
                  className="p-2 bg-green-50 rounded hover:bg-green-100 transition-colors text-left"
                  disabled={isLoading}
                >
                  <p className="font-medium">Teacher:</p>
                  <p className="text-gray-600">sarah.wilson@charusat.ac.in</p>
                </button>
                <button
                  onClick={() => setEmail("tp@charusat.ac.in")}
                  className="p-2 bg-purple-50 rounded hover:bg-purple-100 transition-colors text-left"
                  disabled={isLoading}
                >
                  <p className="font-medium">T&P Officer:</p>
                  <p className="text-gray-600">tp@charusat.ac.in</p>
                </button>
                <button
                  onClick={() => setEmail("admin@charusat.ac.in")}
                  className="p-2 bg-orange-50 rounded hover:bg-orange-100 transition-colors text-left"
                  disabled={isLoading}
                >
                  <p className="font-medium">Admin:</p>
                  <p className="text-gray-600">admin@charusat.ac.in</p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
