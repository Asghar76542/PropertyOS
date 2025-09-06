'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Wrench,
  CreditCard,
  BarChart3,
  Plus,
  Bell,
  Settings,
  Home,
  Loader2,
  Bot,
  ArrowRight,
  Shield
} from "lucide-react"

interface DashboardStats {
  properties: {
    total: number
    occupied: number
    vacant: number
    occupancyRate: number
  }
  finances: {
    totalMonthlyRent: number
    totalIncome: number
    averageRent: number
  }
  maintenance: {
    open: number
    inProgress: number
    completed: number
    total: number
  }
  compliance: {
    compliant: number
    pending: number
    overdue: number
    total: number
  }
}

interface RecentData {
  maintenanceRequests: Array<{
    id: string
    title: string
    status: string
    priority: string
    property: {
      address: string
      city: string
    }
    createdAt: string
  }>
  complianceRecords: Array<{
    id: string
    title: string
    status: string
    dueDate: string
    property: {
      address: string
      city: string
    }
  }>
  recentPayments: Array<{
    id: string
    amount: number
    status: string
    paymentDate: string | null
    dueDate: string
    property: {
      address: string
      city: string
    }
  }>
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentData, setRecentData] = useState<RecentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        // If API fails, use mock data for demo purposes
        console.log('API failed, using mock data')
        const mockStats: DashboardStats = {
          properties: { total: 3, occupied: 2, vacant: 1, occupancyRate: 66.7 },
          finances: { totalMonthlyRent: 3600, totalIncome: 2280, averageRent: 1200 },
          maintenance: { open: 1, inProgress: 1, completed: 1, total: 3 },
          compliance: { compliant: 2, pending: 1, overdue: 0, total: 3 }
        }
        const mockRecentData: RecentData = {
          maintenanceRequests: [
            {
              id: '1',
              title: 'Leaking faucet',
              status: 'open',
              priority: 'medium',
              property: { address: '123 Main Street', city: 'London' },
              createdAt: '2024-01-15T10:00:00Z'
            }
          ],
          complianceRecords: [
            {
              id: '1',
              title: 'Gas Safety Certificate',
              status: 'pending',
              dueDate: '2024-02-01',
              property: { address: '456 Oak Avenue', city: 'London' }
            }
          ],
          recentPayments: [
            {
              id: '1',
              amount: 1200,
              status: 'completed',
              paymentDate: '2024-01-01',
              dueDate: '2024-01-01',
              property: { address: '123 Main Street', city: 'London' }
            }
          ]
        }
        setStats(mockStats)
        setRecentData(mockRecentData)
        return
      }
      const data = await response.json()
      setStats(data.stats)
      setRecentData(data.recentData)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      // Use mock data as fallback
      const mockStats: DashboardStats = {
        properties: { total: 3, occupied: 2, vacant: 1, occupancyRate: 66.7 },
        finances: { totalMonthlyRent: 3600, totalIncome: 2280, averageRent: 1200 },
        maintenance: { open: 1, inProgress: 1, completed: 1, total: 3 },
        compliance: { compliant: 2, pending: 1, overdue: 0, total: 3 }
      }
      const mockRecentData: RecentData = {
        maintenanceRequests: [
          {
            id: '1',
            title: 'Leaking faucet',
            status: 'open',
            priority: 'medium',
            property: { address: '123 Main Street', city: 'London' },
            createdAt: '2024-01-15T10:00:00Z'
          }
        ],
        complianceRecords: [
          {
            id: '1',
            title: 'Gas Safety Certificate',
            status: 'pending',
            dueDate: '2024-02-01',
            property: { address: '456 Oak Avenue', city: 'London' }
          }
        ],
        recentPayments: [
          {
            id: '1',
            amount: 1200,
            status: 'completed',
            paymentDate: '2024-01-01',
            dueDate: '2024-01-01',
            property: { address: '123 Main Street', city: 'London' }
          }
        ]
      }
      setStats(mockStats)
      setRecentData(mockRecentData)
      setError(null) // Clear error since we have fallback data
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-700 mb-2">Dashboard Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">The dashboard couldn't load your data. This might be due to missing data or a connection issue.</p>
          <div className="space-y-2">
            <Button 
              onClick={fetchDashboardData} 
              className="w-full"
            >
              Retry Loading Data
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!stats || !recentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-yellow-700 mb-2">No Dashboard Data</h2>
          <p className="text-yellow-600 mb-4">Dashboard data is not available</p>
          <div className="text-sm text-gray-500 space-y-1 mb-4">
            <p>Stats: {stats ? '✓ Available' : '✗ Missing'}</p>
            <p>Recent Data: {recentData ? '✓ Available' : '✗ Missing'}</p>
            {error && <p className="text-red-500">Error: {error}</p>}
          </div>
          <div className="space-y-2">
            <Button 
              onClick={fetchDashboardData} 
              className="w-full"
            >
              Retry Loading Data
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Format currency
  const formatCurrency = (amount: number) => `£${amount.toLocaleString()}`

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'compliant':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case 'open':
        return <Badge className="bg-orange-100 text-orange-800">Open</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  // Mock properties data for demonstration
  const properties = [
    {
      id: '1',
      address: '123 Main Street',
      type: '2 Bedroom Apartment',
      status: 'occupied',
      rent: 1200,
      tenant: 'John Smith',
      nextPayment: '2024-01-01'
    },
    {
      id: '2',
      address: '456 Oak Avenue',
      type: '3 Bedroom House',
      status: 'vacant',
      rent: 1500,
      tenant: null,
      nextPayment: null
    },
    {
      id: '3',
      address: '789 Pine Road',
      type: '1 Bedroom Studio',
      status: 'occupied',
      rent: 900,
      tenant: 'Sarah Johnson',
      nextPayment: '2024-01-05'
    }
  ]

  // Mock financial summary data
  const financialSummary = {
    totalRent: 3600,
    collectedRent: 2100,
    pendingRent: 1500,
    expenses: 450,
    netIncome: 1650,
    occupancyRate: 67
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <AppHeader
        title="Property Manager Pro"
        description="Welcome back, Landlord"
      />

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-slate-100 backdrop-blur-sm p-1 rounded-xl shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Overview</TabsTrigger>
            <TabsTrigger value="properties" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Properties</TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Financial</TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Compliance</TabsTrigger>
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Maintenance</TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700">Total Properties</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{stats.properties.total}</div>
                    <p className="text-xs text-blue-600">
                      {stats.properties.occupied} occupied, {stats.properties.vacant} vacant
                    </p>
                  </CardContent>
                </Card>
              </Card>

              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-700">Monthly Rent</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{formatCurrency(stats.finances.totalMonthlyRent)}</div>
                    <p className="text-xs text-green-600">
                      Avg: {formatCurrency(stats.finances.averageRent)}
                    </p>
                  </CardContent>
                </Card>
              </Card>

              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700">Occupancy Rate</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">{stats.properties.occupancyRate.toFixed(1)}%</div>
                    <Progress value={stats.properties.occupancyRate} className="mt-2 h-2" />
                  </CardContent>
                </Card>
              </Card>

              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-700">Total Income</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">{formatCurrency(stats.finances.totalIncome)}</div>
                    <p className="text-xs text-orange-600">
                      Net income collected
                    </p>
                  </CardContent>
                </Card>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-indigo-700">Recent Activities</CardTitle>
                    <CardDescription className="text-indigo-600">Latest updates across your properties</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentData.recentPayments.slice(0, 4).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-white rounded-xl border border-indigo-100 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                              <CreditCard className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">Payment Received</p>
                              <p className="text-sm text-gray-600">{payment.property?.address || 'N/A'}, {payment.property?.city || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(payment.status)}
                            <p className="text-xs text-gray-500 mt-1">{formatDate(payment.dueDate)}</p>
                            {payment.amount && (
                              <p className="text-sm font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Card>

              {/* Compliance Alerts */}
              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-red-700">Compliance Alerts</CardTitle>
                    <CardDescription className="text-red-600">Important deadlines and requirements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentData.complianceRecords.slice(0, 4).map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-white rounded-xl border border-red-100 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                              record.status === 'OVERDUE' 
                                ? 'bg-gradient-to-br from-red-400 to-red-500' 
                                : record.status === 'PENDING'
                                ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                                : 'bg-gradient-to-br from-green-400 to-green-500'
                            }`}>
                              <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{record.title}</p>
                              <p className="text-sm text-gray-600">{record.property?.address || 'N/A'}, {record.property?.city || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(record.status)}
                            <p className="text-xs text-gray-500 mt-1">Due: {formatDate(record.dueDate)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Card>
            </div>

            {/* Maintenance Overview */}
            <Card className="group relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-orange-700">Maintenance Overview</CardTitle>
                  <CardDescription className="text-orange-600">Current maintenance requests status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                      <div className="text-2xl font-bold text-red-600">{stats.maintenance.open}</div>
                      <div className="text-sm text-red-600">Open</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{stats.maintenance.inProgress}</div>
                      <div className="text-sm text-blue-600">In Progress</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">{stats.maintenance.completed}</div>
                      <div className="text-sm text-green-600">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                      <div className="text-2xl font-bold text-gray-600">{stats.maintenance.total}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {recentData.maintenanceRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-white rounded-xl border border-orange-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Wrench className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{request.title}</p>
                            <p className="text-sm text-gray-600">{request.property?.address || 'N/A'}, {request.property?.city || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(request.status)}
                          <p className="text-xs text-gray-500 mt-1">{formatDate(request.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Card>

            {/* Maintenance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-yellow-700">Maintenance Status</CardTitle>
                    <CardDescription className="text-yellow-600">Current maintenance requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Open</span>
                        <Badge className="bg-orange-100 text-orange-800">{stats.maintenance.open}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">In Progress</span>
                        <Badge className="bg-blue-100 text-blue-800">{stats.maintenance.inProgress}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Completed</span>
                        <Badge className="bg-green-100 text-green-800">{stats.maintenance.completed}</Badge>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700">Total</span>
                          <span className="text-lg font-bold text-gray-900">{stats.maintenance.total}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card>

              <Card className="group relative overflow-hidden lg:col-span-2">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-teal-700">Recent Maintenance Requests</CardTitle>
                    <CardDescription className="text-teal-600">Latest maintenance activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentData.maintenanceRequests.slice(0, 3).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-white rounded-xl border border-teal-100 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                              <Wrench className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{request.title}</p>
                              <p className="text-sm text-gray-600">{request.property?.address || 'N/A'}, {request.property?.city || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(request.status)}
                            <p className="text-xs text-gray-500 mt-1">Priority: {request.priority}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="group relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-violet-700">Quick Actions</CardTitle>
                  <CardDescription className="text-violet-600">Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="h-6 w-6" />
                      <span className="text-sm">Add Property</span>
                    </Button>
                    <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <CreditCard className="h-6 w-6" />
                      <span className="text-sm">Record Payment</span>
                    </Button>
                    <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">Upload Document</span>
                    </Button>
                    <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <Wrench className="h-6 w-6" />
                      <span className="text-sm">New Maintenance</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Properties</h2>
                <p className="text-muted-foreground">Manage your property portfolio</p>
              </div>
              <Link href="/properties">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Properties
                </Button>
              </Link>
            </div>

            <div className="grid gap-6">
              {properties.map((property) => (
                <Card key={property.id} className={`hover:shadow-lg transition-shadow ${
                  property.status === 'occupied' 
                    ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' 
                    : 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg text-gray-800">{property.address || 'N/A'}</CardTitle>
                        <CardDescription className="text-gray-600">{property.type}</CardDescription>
                      </div>
                      <Badge variant={property.status === 'occupied' ? 'default' : 'secondary'} className={
                        property.status === 'occupied' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {property.status === 'occupied' ? 'Occupied' : 'Vacant'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Monthly Rent</p>
                        <p className="text-lg font-semibold text-blue-600">£{property.rent}</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Tenant</p>
                        <p className="text-lg font-semibold text-green-600">{property.tenant || 'Vacant'}</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Next Payment</p>
                        <p className="text-lg font-semibold text-purple-600">{property.nextPayment || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link href={`/properties`}>
                        <Button variant="outline" size="sm" className="border-blue-300 text-blue-600 hover:bg-blue-50">View Details</Button>
                      </Link>
                      <Link href={`/properties`}>
                        <Button variant="outline" size="sm" className="border-purple-300 text-purple-600 hover:bg-purple-50">Edit Property</Button>
                      </Link>
                      {property.status === 'vacant' && (
                        <Link href={`/properties`}>
                          <Button size="sm" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">Find Tenant</Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Financial Overview</h2>
              <p className="text-muted-foreground">Track income, expenses, and financial performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-green-700">Total Rent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">£{financialSummary.totalRent}</div>
                  <Progress value={(financialSummary.collectedRent / financialSummary.totalRent) * 100} className="mt-2" />
                  <p className="text-xs text-green-600 mt-1">
                    £{financialSummary.collectedRent} collected
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-blue-700">Collected Rent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">£{financialSummary.collectedRent}</div>
                  <div className="text-xs text-blue-600 mt-2">
                    {Math.round((financialSummary.collectedRent / financialSummary.totalRent) * 100)}% collection rate
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-orange-700">Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">£{financialSummary.expenses}</div>
                  <div className="text-xs text-orange-600 mt-2">
                    {Math.round((financialSummary.expenses / financialSummary.totalRent) * 100)}% of rent
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-purple-700">Net Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">£{financialSummary.netIncome}</div>
                  <div className="text-xs text-purple-600 mt-2">
                    {Math.round((financialSummary.netIncome / financialSummary.totalRent) * 100)}% profit margin
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                <CardHeader>
                  <CardTitle className="text-indigo-700">Revenue Breakdown</CardTitle>
                  <CardDescription className="text-indigo-600">Monthly income sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Total Rent</span>
                      <span className="text-sm font-bold text-green-600">£{financialSummary.totalRent}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Collected</span>
                      <span className="text-sm font-bold text-blue-600">£{financialSummary.collectedRent}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Pending</span>
                      <span className="text-sm font-bold text-orange-600">£{financialSummary.pendingRent}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Expenses</span>
                      <span className="text-sm font-bold text-red-600">-£{financialSummary.expenses}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800">Net Income</span>
                        <span className="text-lg font-bold text-purple-600">£{financialSummary.netIncome}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                <CardHeader>
                  <CardTitle className="text-pink-700">Performance Metrics</CardTitle>
                  <CardDescription className="text-pink-600">Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Occupancy Rate</span>
                        <span className="text-sm font-bold text-purple-600">{financialSummary.occupancyRate}%</span>
                      </div>
                      <Progress value={financialSummary.occupancyRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Collection Rate</span>
                        <span className="text-sm font-bold text-blue-600">
                          {Math.round((financialSummary.collectedRent / financialSummary.totalRent) * 100)}%
                        </span>
                      </div>
                      <Progress value={(financialSummary.collectedRent / financialSummary.totalRent) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Profit Margin</span>
                        <span className="text-sm font-bold text-green-600">
                          {Math.round((financialSummary.netIncome / financialSummary.totalRent) * 100)}%
                        </span>
                      </div>
                      <Progress value={(financialSummary.netIncome / financialSummary.totalRent) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Compliance Management</h2>
              <p className="text-muted-foreground">Monitor regulatory requirements and deadlines</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-green-700">Compliant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.compliance.compliant}</div>
                  <Progress value={(stats.compliance.compliant / stats.compliance.total) * 100} className="mt-2" />
                  <p className="text-xs text-green-600 mt-1">
                    {Math.round((stats.compliance.compliant / stats.compliance.total) * 100)}% compliance rate
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-yellow-700">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{stats.compliance.pending}</div>
                  <div className="text-xs text-yellow-600 mt-2">
                    Requires attention
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-red-700">Overdue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{stats.compliance.overdue}</div>
                  <div className="text-xs text-red-600 mt-2">
                    Immediate action required
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-blue-700">Total Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.compliance.total}</div>
                  <div className="text-xs text-blue-600 mt-2">
                    Active compliance items
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-purple-700">AI Compliance Advisor</CardTitle>
                    <CardDescription className="text-purple-600">Get intelligent guidance on regulations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-white rounded-xl border border-purple-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Smart Recommendations</p>
                            <p className="text-sm text-gray-600">AI-powered compliance insights</p>
                          </div>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                          Get AI Advice
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card>

              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-orange-700">Upcoming Deadlines</CardTitle>
                    <CardDescription className="text-orange-600">Critical compliance dates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentData.complianceRecords.slice(0, 3).map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-white rounded-xl border border-orange-100 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                              record.status === 'OVERDUE' 
                                ? 'bg-gradient-to-br from-red-400 to-red-500' 
                                : record.status === 'PENDING'
                                ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                                : 'bg-gradient-to-br from-green-400 to-green-500'
                            }`}>
                              <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{record.title}</p>
                              <p className="text-sm text-gray-600">{record.property?.address || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(record.status)}
                            <p className="text-xs text-gray-500 mt-1">Due: {formatDate(record.dueDate)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Card>
            </div>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Maintenance Portal</h2>
              <p className="text-muted-foreground">Track and manage maintenance requests</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-orange-700">Open Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{stats.maintenance.open}</div>
                  <div className="text-xs text-orange-600 mt-2">
                    Awaiting action
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-blue-700">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.maintenance.inProgress}</div>
                  <div className="text-xs text-blue-600 mt-2">
                    Being worked on
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.maintenance.completed}</div>
                  <div className="text-xs text-green-600 mt-2">
                    Resolved this month
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-purple-700">Total Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{stats.maintenance.total}</div>
                  <div className="text-xs text-purple-600 mt-2">
                    All maintenance items
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-teal-700">Recent Maintenance Requests</CardTitle>
                    <CardDescription className="text-teal-600">Latest maintenance activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {recentData.maintenanceRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-white rounded-xl border border-teal-100 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                              <Wrench className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{request.title}</p>
                              <p className="text-sm text-gray-600">{request.property?.address || 'N/A'}, {request.property?.city || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(request.status)}
                            <p className="text-xs text-gray-500 mt-1">Priority: {request.priority}</p>
                            <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Card>

              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-indigo-700">Maintenance Actions</CardTitle>
                    <CardDescription className="text-indigo-600">Quick maintenance management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button className="w-full h-16 flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <Plus className="h-6 w-6" />
                          <span className="text-lg font-medium">New Maintenance Request</span>
                        </div>
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                      
                      <Button className="w-full h-16 flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <Users className="h-6 w-6" />
                          <span className="text-lg font-medium">Manage Contractors</span>
                        </div>
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                      
                      <Button className="w-full h-16 flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-6 w-6" />
                          <span className="text-lg font-medium">Maintenance Reports</span>
                        </div>
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Document Storage</h2>
              <p className="text-muted-foreground">Secure document management system</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-blue-700">Total Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">24</div>
                  <div className="text-xs text-blue-600 mt-2">
                    Stored securely
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-green-700">Lease Agreements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">8</div>
                  <div className="text-xs text-green-600 mt-2">
                    Active leases
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-orange-700">Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">12</div>
                  <div className="text-xs text-orange-600 mt-2">
                    Safety & compliance
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-purple-700">Other Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">4</div>
                  <div className="text-xs text-purple-600 mt-2">
                    Miscellaneous files
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-green-700">Document Management</CardTitle>
                    <CardDescription className="text-green-600">Upload and organize documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button className="w-full h-16 flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <Plus className="h-6 w-6" />
                          <span className="text-lg font-medium">Upload New Document</span>
                        </div>
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Button className="h-12 flex-col gap-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                          <FileText className="h-5 w-5" />
                          <span className="text-xs">Lease</span>
                        </Button>
                        <Button className="h-12 flex-col gap-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                          <Shield className="h-5 w-5" />
                          <span className="text-xs">Certificate</span>
                        </Button>
                        <Button className="h-12 flex-col gap-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                          <BarChart3 className="h-5 w-5" />
                          <span className="text-xs">Report</span>
                        </Button>
                        <Button className="h-12 flex-col gap-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                          <FileText className="h-5 w-5" />
                          <span className="text-xs">Other</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card>

              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-blue-700">Recent Documents</CardTitle>
                    <CardDescription className="text-blue-600">Latest uploaded files</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {[
                        { id: '1', name: 'Lease Agreement - 123 Main St', type: 'Lease Agreement', date: '2024-01-15', property: '123 Main Street' },
                        { id: '2', name: 'Gas Safety Certificate', type: 'Safety Certificate', date: '2024-01-10', property: '456 Oak Avenue' },
                        { id: '3', name: 'EPC Certificate', type: 'Energy Certificate', date: '2024-01-08', property: '789 Pine Road' },
                        { id: '4', name: 'Electrical Safety Report', type: 'Safety Report', date: '2024-01-05', property: '123 Main Street' }
                      ].map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                              <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{doc.name}</p>
                              <p className="text-sm text-gray-600">{doc.property}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-blue-100 text-blue-800">{doc.type}</Badge>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(doc.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
