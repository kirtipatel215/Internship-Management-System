"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"
import { useRealtime } from "@/lib/realtime-context"

export function RealtimeStatus() {
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const { onDataUpdate } = useRealtime()

  useEffect(() => {
    // Subscribe to any database events to show real-time status
    const unsubscribe = onDataUpdate((event) => {
      console.log("[v0] Real-time event received:", event.type)
      setIsConnected(true)
      setLastUpdate(new Date())
    })

    // Simulate connection status (in real app, this would be actual connection monitoring)
    const interval = setInterval(() => {
      setIsConnected(true)
    }, 5000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [onDataUpdate])

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center space-x-1">
        {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        <span className="text-xs">{isConnected ? "Live" : "Offline"}</span>
      </Badge>
      {lastUpdate && <span className="text-xs text-gray-500">Updated {lastUpdate.toLocaleTimeString()}</span>}
    </div>
  )
}
