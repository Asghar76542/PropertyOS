'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Home, Users, Settings, BarChart3, FileText, Wrench, CreditCard } from "lucide-react"
import { AppHeader } from '@/components/layout/app-header'

export default function RoleSelectionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If not logged in, redirect to login
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <AppHeader
        title="PropertyOS Dashboard"
        description={`Welcome, ${session.user?.name || session.user?.email}`}
        hideNav={true}
      />

      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Dashboard</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the dashboard that matches your role to access the tools and features you need.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Test Dashboard */}
          <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <Card className="relative bg-white rounded-2xl shadow-lg border-0 h-full">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-purple-700">Test Dashboard</CardTitle>
                <CardDescription className="text-gray-600">
                  Explore all features and test the system capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <BarChart3 className="w-4 h-4 mr-2 text-purple-500" />
                    Analytics & Reporting
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2 text-purple-500" />
                    Document Management
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-purple-500" />
                    User Management
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Settings className="w-4 h-4 mr-2 text-purple-500" />
                    System Configuration
                  </div>
                </div>
                <Link href="/dashboard" className="block">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    Open Test Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Card>

          {/* Landlord Dashboard */}
          <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <Card className="relative bg-white rounded-2xl shadow-lg border-0 h-full">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-blue-700">Landlord Dashboard</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your properties, tenants, and rental business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                    Property Management
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    Tenant Management
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                    Rent Collection
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Wrench className="w-4 h-4 mr-2 text-blue-500" />
                    Maintenance Requests
                  </div>
                </div>
                <Link href="/dashboard" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    Open Landlord Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Card>

          {/* Tenant Portal */}
          <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <Card className="relative bg-white rounded-2xl shadow-lg border-0 h-full">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-green-700">Tenant Portal</CardTitle>
                <CardDescription className="text-gray-600">
                  Access your rental information and communicate with landlord
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <CreditCard className="w-4 h-4 mr-2 text-green-500" />
                    Rent Payments
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Wrench className="w-4 h-4 mr-2 text-green-500" />
                    Maintenance Requests
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2 text-green-500" />
                    Documents & Lease
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-green-500" />
                    Communication
                  </div>
                </div>
                <Link href="/tenant-dashboard" className="block">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                    Open Tenant Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-gray-50 to-blue-50 border-0">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Need Help Getting Started?</h3>
              <p className="text-gray-600 mb-4">
                Each dashboard is tailored to your specific needs. You can switch between dashboards anytime from the navigation menu.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/help">
                  <Button variant="outline" size="sm">
                    Help & Support
                  </Button>
                </Link>
                <Link href="/features">
                  <Button variant="outline" size="sm">
                    Feature Guide
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
