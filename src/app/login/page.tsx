'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Loader2, Building, Mail, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password: 'demo', // For demo purposes
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        // Redirect to dashboard selection page
        router.push('/select-dashboard')
      }
    } catch (error) {
      setError('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    await signIn('google', { callbackUrl: '/select-dashboard' })
    setIsLoading(false)
  }

  const handleDemoLogin = async (userType: 'landlord' | 'tenant') => {
    setIsLoading(true)
    setError('')

    const demoEmails = {
      landlord: 'landlord@example.com',
      tenant: 'sarah.johnson@example.com'
    }

    try {
      const result = await signIn('credentials', {
        email: demoEmails[userType],
        password: 'demo',
        redirect: false,
      })

      if (result?.error) {
        setError('Demo login failed')
      } else {
        // Redirect to dashboard selection page
        router.push('/select-dashboard')
      }
    } catch (error) {
      setError('An error occurred during demo login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      {/* Back to Home Link */}
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
      
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Building className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">PropertyOS</h1>
          <p className="text-gray-600 text-center mt-2">
            Modern Property Management Platform
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your PropertyOS account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  defaultValue="demo"
                  required
                  className="h-11"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Sign In
              </Button>
            </form>

            <div className="relative">
              <Separator className="my-6" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-11"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>

            <Separator className="my-6" />

            <div className="space-y-3">
              <p className="text-sm text-center text-gray-600 font-medium">
                Demo Accounts
              </p>
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => handleDemoLogin('landlord')}
                  disabled={isLoading}
                >
                  <Building className="mr-2 h-4 w-4" />
                  Demo as Landlord
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => handleDemoLogin('tenant')}
                  disabled={isLoading}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Demo as Tenant
                </Button>
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">
                Use demo accounts to explore the platform
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
        
        <p className="text-center text-sm text-gray-600 mt-2">
          Need help? Contact{' '}
          <a href="mailto:support@propertyos.com" className="font-medium text-blue-600 hover:underline">
            support@propertyos.com
          </a>
        </p>
      </div>
    </div>
  )
}
