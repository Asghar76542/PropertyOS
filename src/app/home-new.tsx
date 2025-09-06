'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, TrendingUp, Shield, FileText, Wrench, BarChart3, CreditCard, Bot, CheckCircle, ArrowRight, Star, Sparkles, Home, Settings } from "lucide-react"

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-0.5 rounded-full">
                  <div className="bg-white rounded-full p-2">
                    <Building2 className="h-8 w-8 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text" />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  PropertyOS
                </h1>
                <p className="text-sm text-slate-500 font-medium">Professional Property Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {session ? (
                <Link href="/select-dashboard">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 font-medium">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
            backgroundSize: '200px 200px'
          }}></div>
        </div>
        
        {/* Animated Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <Badge variant="secondary" className="bg-transparent text-white border-transparent text-sm font-medium">
                Next-Generation Property Management
              </Badge>
              <Star className="h-5 w-5 text-yellow-300" />
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight">
              <span className="block text-white mb-4">Transform Your Property</span>
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                Management Experience
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              The complete platform for landlords and tenants. Streamline rent collection, maintenance requests, 
              document management, and communication - all in one place.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              {session ? (
                <Link href="/select-dashboard">
                  <Button size="lg" className="group text-lg px-10 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-slate-900 font-bold shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="group text-lg px-10 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-slate-900 font-bold shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="text-lg px-10 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 font-medium">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Dashboard Options Preview */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Test Dashboard</CardTitle>
                  <CardDescription className="text-white/70">
                    Explore all system features and capabilities
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Landlord Dashboard</CardTitle>
                  <CardDescription className="text-white/70">
                    Manage properties, tenants, and rental income
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Tenant Portal</CardTitle>
                  <CardDescription className="text-white/70">
                    Pay rent, request maintenance, and communicate
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-white via-slate-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
                Platform Features
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Everything You Need in One Platform
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                PropertyOS brings together all the tools landlords and tenants need for seamless property management
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Cards */}
              <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-500"></div>
                <Card className="relative bg-white border-0 h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-slate-900">Automated Rent Collection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">Streamline rent payments with automated collection, late fee management, and detailed financial reporting.</p>
                  </CardContent>
                </Card>
              </Card>

              <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-500"></div>
                <Card className="relative bg-white border-0 h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-slate-900">Maintenance Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">Track maintenance requests, assign contractors, and keep detailed records of all property work.</p>
                  </CardContent>
                </Card>
              </Card>

              <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-500"></div>
                <Card className="relative bg-white border-0 h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-slate-900">Document Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">Store and manage leases, certificates, and important documents with secure cloud storage.</p>
                  </CardContent>
                </Card>
              </Card>

              <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-500"></div>
                <Card className="relative bg-white border-0 h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-slate-900">Tenant Communication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">Built-in messaging system for seamless communication between landlords and tenants.</p>
                  </CardContent>
                </Card>
              </Card>

              <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-500"></div>
                <Card className="relative bg-white border-0 h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-slate-900">Financial Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">Comprehensive reporting and analytics to track income, expenses, and property performance.</p>
                  </CardContent>
                </Card>
              </Card>

              <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-500"></div>
                <Card className="relative bg-white border-0 h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-slate-900">Compliance Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">Stay compliant with automated reminders for certificates, inspections, and legal requirements.</p>
                  </CardContent>
                </Card>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Property Management?
            </h2>
            <p className="text-xl text-white/80 mb-12">
              Join thousands of landlords and tenants who are already using PropertyOS to streamline their rental experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {session ? (
                <Link href="/select-dashboard">
                  <Button size="lg" className="text-lg px-10 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-slate-900 font-bold shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300">
                    Go to Your Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="text-lg px-10 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-slate-900 font-bold shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="text-lg px-10 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 font-medium">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
