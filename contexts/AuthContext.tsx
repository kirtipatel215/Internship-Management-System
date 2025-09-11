"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getCurrentUser, type AppUser } from '@/lib/auth-supabase'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: AppUser | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isInitialized: false,
  error: null,
  refreshUser: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = useCallback(async () => {
    try {
      setError(null)
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (err: any) {
      console.error('Error refreshing user:', err)
      setError(err.message || 'Failed to refresh user')
      setUser(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    let authSubscription: any = null

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing AuthContext...')
        setError(null)

        // Wait for initial session to be ready
        await new Promise(resolve => {
          const checkSession = async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession()
              resolve(session)
            } catch (error) {
              console.warn('Session check failed, continuing...', error)
              resolve(null)
            }
          }
          
          // Give it a moment for the session to be available
          setTimeout(checkSession, 100)
        })

        if (!mounted) return

        // Set up auth state listener using Supabase's direct method
        console.log('🔗 Setting up auth state listener...')
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return

            console.log('👤 Auth event:', event, session?.user?.email || 'no user')

            if (session?.user) {
              try {
                const currentUser = await getCurrentUser()
                if (mounted) {
                  console.log('👤 Auth state changed:', currentUser ? `${currentUser.email} (${currentUser.role})` : 'null')
                  setUser(currentUser)
                  setError(null)
                }
              } catch (err: any) {
                console.error('Error getting user after auth change:', err)
                if (mounted) {
                  setUser(null)
                  setError(err.message || 'Failed to get user data')
                }
              }
            } else {
              if (mounted) {
                console.log('👤 Auth state changed: user signed out')
                setUser(null)
                setError(null)
              }
            }

            // Mark as initialized after first auth state change
            if (mounted && !isInitialized) {
              setIsInitialized(true)
              setIsLoading(false)
            }
          }
        )

        authSubscription = subscription

        // Small delay to ensure listener is set up before getting initial user
        await new Promise(resolve => setTimeout(resolve, 200))

        if (!mounted) return

        // Get initial user state
        console.log('👤 Getting initial user state...')
        try {
          const currentUser = await getCurrentUser()
          
          if (mounted) {
            setUser(currentUser)
            console.log('✅ Initial user loaded:', currentUser ? `${currentUser.email} (${currentUser.role})` : 'null')
          }
        } catch (err: any) {
          console.error('❌ Error getting initial user:', err)
          if (mounted) {
            setError(err.message || 'Failed to initialize authentication')
          }
        }

        // Mark as initialized
        if (mounted) {
          setIsInitialized(true)
          setIsLoading(false)
          console.log('✅ AuthContext initialized successfully')
        }

      } catch (error: any) {
        console.error('❌ Auth initialization error:', error)
        if (mounted) {
          setError(error.message || 'Authentication initialization failed')
          setIsInitialized(true)
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Cleanup function - this fixes your error
    return () => {
      mounted = false
      if (authSubscription) {
        console.log('🔌 Unsubscribing from auth state changes')
        try {
          authSubscription.unsubscribe()
        } catch (error) {
          console.warn('Error during auth cleanup:', error)
        }
      }
    }
  }, []) // Remove isInitialized from deps to avoid infinite loops

  const value: AuthContextType = {
    user,
    isLoading,
    isInitialized,
    error,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
