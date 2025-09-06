'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentModal } from '@/components/modals/payment-modal'
import { MaintenanceRequestModal } from '@/components/modals/maintenance-request-modal'
import { MessageComposeModal } from '@/components/modals/message-compose-modal'
import { useDocumentHandler } from '@/hooks/use-document-handler'
import { 
  Home, 
  DollarSign, 
  Wrench, 
  FileText, 
  MessageSquare, 
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  CreditCard,
  Loader2,
  Building2,
  Settings,
  Download,
  Eye,
  Send
} from "lucide-react"

interface TenantData {
  personalInfo: {
    name: string
    email: string
    phone: string
    moveInDate: string
    leaseEnd: string
    propertyAddress: string
    propertyCity: string
    landlordName: string
    landlordEmail: string
    landlordPhone: string
  }
  financials: {
    monthlyRent: number
    securityDeposit: number
    balanceDue: number
    lastPaymentDate: string
    nextPaymentDue: string
    paymentHistory: Array<{
      id: string
      amount: number
      date: string
      status: string
      method: string
    }>
  }
  maintenance: {
    openRequests: number
    inProgress: number
    completed: number
    recentRequests: Array<{
      id: string
      title: string
      status: string
      priority: string
      submittedDate: string
      estimatedCompletion: string
    }>
  }
  documents: {
    leaseAgreement: {
      available: boolean
      lastUpdated: string
    }
    importantDocuments: Array<{
      id: string
      name: string
      type: string
      uploadDate: string
      size: string
    }>
  }
  communications: {
    unreadMessages: number
    recentMessages: Array<{
      id: string
      from: string
      subject: string
      message: string
      date: string
      unread: boolean
    }>
  }
}

export default function TenantDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [tenantData, setTenantData] = useState<TenantData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTenantId, setSelectedTenantId] = useState<string>("")
  const [availableTenants, setAvailableTenants] = useState<Array<{id: string, name: string, email: string}>>([])
  
  // Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  
  // Document handler
  const { downloadDocument, previewDocument, downloading } = useDocumentHandler()

  const fetchAvailableTenants = async () => {
    try {
      // We'll create a simple API to get all tenants
      const response = await fetch('/api/tenants')
      if (response.ok) {
        const tenants = await response.json()
        setAvailableTenants(tenants)
        if (tenants.length > 0 && !selectedTenantId) {
          setSelectedTenantId(tenants[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching tenants:', err)
    }
  }

  const fetchTenantData = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = selectedTenantId 
        ? `/api/tenant/${selectedTenantId}`
        : '/api/tenant/dashboard'
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch tenant data')
      }
      const data = await response.json()
      setTenantData(data)
    } catch (err) {
      console.error('Error fetching tenant data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tenant data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailableTenants()
  }, [])

  useEffect(() => {
    if (selectedTenantId) {
      fetchTenantData()
    }
  }, [selectedTenantId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tenant dashboard...</p>
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
          <Button onClick={fetchTenantData} className="w-full">
            Retry Loading Data
          </Button>
        </div>
      </div>
    )
  }

  if (!tenantData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-yellow-700 mb-2">No Data Available</h2>
          <p className="text-yellow-600 mb-4">Tenant data could not be loaded</p>
          <Button onClick={fetchTenantData} className="w-full">
            Retry Loading Data
          </Button>
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
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case 'open':
        return <Badge className="bg-orange-100 text-orange-800">Open</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  // Get priority badge variant
  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <AppHeader
        title="Tenant Portal"
        description={`Welcome back, ${tenantData.personalInfo.name}`}
        hideNav={true}
      />

      <div className="container mx-auto px-6 py-8">
        {/* Tenant Selector */}
        {availableTenants.length > 1 && (
          <div className="mb-6 flex justify-end">
            <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-2 shadow-sm border">
              <label htmlFor="tenant-select" className="text-sm font-medium text-gray-700">
                Switch Tenant:
              </label>
              <select
                id="tenant-select"
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {availableTenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} ({tenant.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-slate-100 backdrop-blur-sm p-1 rounded-xl shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Overview</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Payments</TabsTrigger>
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Maintenance</TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Documents</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Messages</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div className="text-3xl font-bold text-green-600">{formatCurrency(tenantData.financials.monthlyRent)}</div>
                    <p className="text-xs text-green-600">
                      Next due: {formatDate(tenantData.financials.nextPaymentDue)}
                    </p>
                  </CardContent>
                </Card>
              </Card>

              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700">Security Deposit</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{formatCurrency(tenantData.financials.securityDeposit)}</div>
                    <p className="text-xs text-blue-600">Held securely</p>
                  </CardContent>
                </Card>
              </Card>

              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-700">Open Requests</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Wrench className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">{tenantData.maintenance.openRequests}</div>
                    <p className="text-xs text-orange-600">
                      {tenantData.maintenance.inProgress} in progress
                    </p>
                  </CardContent>
                </Card>
              </Card>

              <Card className="group relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700">Unread Messages</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">{tenantData.communications.unreadMessages}</div>
                    <p className="text-xs text-purple-600">New messages</p>
                  </CardContent>
                </Card>
              </Card>
            </div>

            {/* Property Info Card */}
            <Card className="group relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <Card className="relative bg-white rounded-2xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Home className="h-5 w-5" />
                    Property Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium text-gray-800 mb-2">Address</p>
                        <p className="text-sm text-gray-600">{tenantData.personalInfo.propertyAddress}</p>
                        <p className="text-sm text-gray-600">{tenantData.personalInfo.propertyCity}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 mb-2">Lease Period</p>
                        <p className="text-sm text-gray-600">{formatDate(tenantData.personalInfo.moveInDate)} - {formatDate(tenantData.personalInfo.leaseEnd)}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium text-gray-800 mb-2">Landlord</p>
                        <p className="text-sm text-gray-600">{tenantData.personalInfo.landlordName}</p>
                        <p className="text-sm text-gray-600">{tenantData.personalInfo.landlordEmail}</p>
                        <p className="text-sm text-gray-600">{tenantData.personalInfo.landlordPhone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Payment History</CardTitle>
                  <Button onClick={() => setIsPaymentModalOpen(true)}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Make a Payment
                  </Button>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead className="text-left text-sm text-gray-500">
                      <tr>
                        <th className="pb-2 font-normal">Date</th>
                        <th className="pb-2 font-normal">Amount</th>
                        <th className="pb-2 font-normal">Method</th>
                        <th className="pb-2 font-normal">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantData.financials.paymentHistory.map((payment) => (
                        <tr key={payment.id} className="border-t">
                          <td className="py-3">{formatDate(payment.date)}</td>
                          <td className="py-3">{formatCurrency(payment.amount)}</td>
                          <td className="py-3 capitalize">{payment.method.replace('_', ' ')}</td>
                          <td className="py-3">{getStatusBadge(payment.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Balance Due</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(tenantData.financials.balanceDue)}</p>
                    <p className="text-xs text-gray-500">Last payment on {formatDate(tenantData.financials.lastPaymentDate)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Next Payment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{formatCurrency(tenantData.financials.monthlyRent)}</p>
                    <p className="text-xs text-gray-500">Due on {formatDate(tenantData.financials.nextPaymentDue)}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Maintenance Requests</CardTitle>
                <Button onClick={() => setIsMaintenanceModalOpen(true)}>
                  <Wrench className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead className="text-left text-sm text-gray-500">
                    <tr>
                      <th className="pb-2 font-normal">Date Submitted</th>
                      <th className="pb-2 font-normal">Request</th>
                      <th className="pb-2 font-normal">Priority</th>
                      <th className="pb-2 font-normal">Status</th>
                      <th className="pb-2 font-normal">Est. Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantData.maintenance.recentRequests.map((request) => (
                      <tr key={request.id} className="border-t">
                        <td className="py-3">{formatDate(request.submittedDate)}</td>
                        <td className="py-3 font-medium">{request.title}</td>
                        <td className="py-3">{getPriorityBadge(request.priority)}</td>
                        <td className="py-3">{getStatusBadge(request.status)}</td>
                        <td className="py-3">{formatDate(request.estimatedCompletion)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>
                  Lease agreement last updated on {formatDate(tenantData.documents.leaseAgreement.lastUpdated)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenantData.documents.importantDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.type} - {doc.size}</p>
                          <p className="text-xs text-gray-400">Uploaded {formatDate(doc.uploadDate)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => previewDocument(doc.id, doc.name)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadDocument(doc.id, doc.name, doc.type as any)}
                          disabled={downloading === doc.id}
                        >
                          {downloading === doc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <Download className="w-4 h-4 mr-1" />
                          )}
                          {downloading === doc.id ? 'Downloading...' : 'Download'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Inbox</CardTitle>
                <Button onClick={() => setIsMessageModalOpen(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  New Message
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tenantData.communications.recentMessages.map((msg) => (
                    <div key={msg.id} className={`p-4 rounded-lg border ${msg.unread ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`font-semibold ${msg.unread ? 'text-blue-800' : ''}`}>{msg.subject}</p>
                          <p className="text-sm text-gray-600">From: {msg.from}</p>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(msg.date)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Components */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        tenantData={tenantData}
      />

      <MaintenanceRequestModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        tenantId={selectedTenantId}
        onRequestSubmitted={() => {
          // Refresh tenant data to show new request
          fetchTenantData()
        }}
      />

      <MessageComposeModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        tenantId={selectedTenantId}
        landlordName={tenantData?.personalInfo.landlordName}
        onMessageSent={() => {
          // Refresh tenant data to show new message
          fetchTenantData()
        }}
      />
    </div>
  )
}