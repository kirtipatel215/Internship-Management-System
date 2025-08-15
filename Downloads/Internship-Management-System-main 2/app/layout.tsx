import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { RealtimeProvider } from "@/lib/realtime-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Internship Management System",
  description: "Comprehensive internship workflow management for educational institutions",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RealtimeProvider>{children}</RealtimeProvider>
        <Toaster />
      </body>
    </html>
  )
}
