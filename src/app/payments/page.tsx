'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  Plus, 
  Search,
  Home,
  Bell,
  Settings,
  Calendar,
  Clock,
  AlertTriangle,
  Filter,
  MoreHorizontal,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  RefreshCw,
  Shield,
  Users,
  BarChart3,
  Target,
  Zap,
  Landmark,
  Smartphone,
  Edit
} from "lucide-react"

export default function Payments() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedProperty, setSelectedProperty] = useState("all")
  const [selectedMethod, setSelectedMethod] = useState("all")

  // Mock payment processing data
  const paymentStats = {
    totalProcessed: 45670,
    thisMonth: 3650,
    successRate: 98.5,
    processingFees: 2283.50,
    failedPayments: 3,
    pendingPayments: 2,
    activeMethods: 4,
    averageProcessingTime: "2.3 seconds"
  }

  const transactions = [
    {
      id: 1,
      property: "123 Main Street, London",
      tenant: "John Smith",
      amount: 1200,
      fee: 60,
      status: "completed",
      method: "bank_transfer",
      date: "2024-01-15",
      processingTime: "1.8s",
      reference: "TXN-2024-001234",
      description: "Monthly rent payment"
    },
    {
      id: 2,
      property: "456 Park Avenue, Manchester",
      tenant: "Mike Wilson",
      amount: 1500,
      fee: 75,
      status: "completed",
      method: "direct_debit",
      date: "2024-01-10",
      processingTime: "2.1s",
      reference: "TXN-2024-001235",
      description: "Monthly rent payment"
    },
    {
      id: 3,
      property: "789 High Street, Birmingham",
      tenant: "Sarah Johnson",
      amount: 950,
      fee: 47.50,
      status: "failed",
      method: "direct_debit",
      date: "2024-01-08",
      processingTime: "3.2s",
      reference: "TXN-2024-001236",
      description: "Monthly rent payment - Insufficient funds"
    },
    {
      id: 4,
      property: "123 Main Street, London",
      tenant: "John Smith",
      amount: 1200,
      fee: 60,
      status: "pending",
      method: "bank_transfer",
      date: "2024-01-16",
      processingTime: "Processing...",
      reference: "TXN-2024-001237",
      description: "Monthly rent payment"
    },
    {
      id: 5,
      property: "456 Park Avenue, Manchester",
      tenant: "Mike Wilson",
      amount: 1500,
      fee: 75,
      status: "completed",
      method: "card_payment",
      date: "2024-01-12",
      processingTime: "1.5s",
      reference: "TXN-2024-001238",
      description: "Monthly rent payment"
    }
  ]

  const paymentMethods = [
    {
      id: 1,
      type: "bank_transfer",
      name: "Bank Transfer",
      description: "Direct bank transfer via Faster Payments",
      fee: 5,
      processingTime: "1-2 hours",
      status: "active",
      usage: 45,
      icon: <Landmark className="h-6 w-6" />
    },
    {
      id: 2,
      type: "direct_debit",
      name: "Direct Debit",
      description: "Automated recurring payments",
      fee: 5,
      processingTime: "3-5 days",
      status: "active",
      usage: 30,
      icon: <RefreshCw className="h-6 w-6" />
    },
    {
      id: 3,
      type: "card_payment",
      name: "Card Payment",
      description: "Credit/Debit card payments",
      fee: 5,
      processingTime: "Instant",
      status: "active",
      usage: 20,
      icon: <CreditCard className="h-6 w-6" />
    },
    {
      id: 4,
      type: "mobile_payment",
      name: "Mobile Payment",
      description: "Apple Pay, Google Pay, etc.",
      fee: 5,
      processingTime: "Instant",
      status: "active",
      usage: 5,
      icon: <Smartphone className="h-6 w-6" />
    }
  ]

  const scheduledPayments = [
    {
      id: 1,
      property: "123 Main Street, London",
      tenant: "John Smith",
      amount: 1200,
      fee: 60,
      nextDate: "2024-02-15",
      frequency: "monthly",
      method: "direct_debit",
      status: "active",
      startDate: "2024-01-15",
      endDate: "2024-12-15"
    },
    {
      id: 2,
      property: "456 Park Avenue, Manchester",
      tenant: "Mike Wilson",
      amount: 1500,
      fee: 75,
      nextDate: "2024-02-10",
      frequency: "monthly",
      method: "direct_debit",
      status: "active",
      startDate: "2024-01-10",
      endDate: "2024-12-10"
    },
    {
      id: 3,
      property: "789 High Street, Birmingham",
      tenant: "Sarah Johnson",
      amount: 950,
      fee: 47.50,
      nextDate: "2024-02-01",
      frequency: "monthly",
      method: "bank_transfer",
      status: "paused",
      startDate: "2024-01-01",
      endDate: "2024-12-01"
    }
  ]

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || transaction.status === selectedStatus
    const matchesProperty = selectedProperty === "all" || transaction.property === selectedProperty
    const matchesMethod = selectedMethod === "all" || transaction.method === selectedMethod
    
    return matchesSearch && matchesStatus && matchesProperty && matchesMethod
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default"
      case "active": return "default"
      case "pending": return "secondary"
      case "failed": return "destructive"
      case "paused": return "secondary"
      default: return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />
      case "active": return <CheckCircle className="h-4 w-4" />
      case "pending": return <Clock className="h-4 w-4" />
      case "failed": return <XCircle className="h-4 w-4" />
      case "paused": return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "bank_transfer": return <Landmark className="h-4 w-4" />
      case "direct_debit": return <RefreshCw className="h-4 w-4" />
      case "card_payment": return <CreditCard className="h-4 w-4" />
      case "mobile_payment": return <Smartphone className="h-4 w-4" />
      default: return <CreditCard className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title="Property Manager Pro"
        description="Payment Processing"
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Payment Processing</h2>
            <p className="text-muted-foreground">Secure rent collection and payment management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Statement
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Processed</p>
                  <p className="text-2xl font-bold">£{paymentStats.totalProcessed.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    This month: £{paymentStats.thisMonth}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">{paymentStats.successRate}%</p>
                  <p className="text-xs text-muted-foreground">
                    {paymentStats.failedPayments} failed
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Processing Fees</p>
                  <p className="text-2xl font-bold">£{paymentStats.processingFees}</p>
                  <p className="text-xs text-muted-foreground">
                    5% of transactions
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Processing</p>
                  <p className="text-2xl font-bold">{paymentStats.averageProcessingTime}</p>
                  <p className="text-xs text-muted-foreground">
                    Lightning fast
                  </p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Transactions</TabsTrigger>
            <TabsTrigger value="methods" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Payment Methods</TabsTrigger>
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Scheduled</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest payment activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getMethodIcon(transaction.method)}
                          <div>
                            <p className="font-medium">{transaction.tenant}</p>
                            <p className="text-sm text-muted-foreground">{transaction.property}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">£{transaction.amount}</p>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(transaction.status)}
                            <Badge variant={getStatusColor(transaction.status)} className="text-xs">
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Available payment options</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {method.icon}
                          </div>
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{method.fee}% fee</p>
                          <Badge variant={getStatusColor(method.status)} className="text-xs">
                            {method.usage}% usage
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  <SelectItem value="123 Main Street, London">123 Main Street, London</SelectItem>
                  <SelectItem value="456 Park Avenue, Manchester">456 Park Avenue, Manchester</SelectItem>
                  <SelectItem value="789 High Street, Birmingham">789 High Street, Birmingham</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="direct_debit">Direct Debit</SelectItem>
                  <SelectItem value="card_payment">Card Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${
                          transaction.status === 'completed' ? 'bg-green-100' :
                          transaction.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          {getMethodIcon(transaction.method)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{transaction.tenant}</h3>
                            <Badge variant={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">{transaction.property}</p>
                          <p className="text-sm text-muted-foreground mb-2">{transaction.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Amount:</span>
                              <p className="font-medium">£{transaction.amount}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Fee:</span>
                              <p className="font-medium">£{transaction.fee}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Date:</span>
                              <p className="font-medium">{transaction.date}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Processing:</span>
                              <p className="font-medium">{transaction.processingTime}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Receipt
                        </Button>
                        {transaction.status === 'failed' && (
                          <Button size="sm">Retry</Button>
                        )}
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="methods" className="space-y-6">
            <div className="grid gap-6">
              {paymentMethods.map((method) => (
                <Card key={method.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{method.name}</h3>
                            <Badge variant={getStatusColor(method.status)}>
                              {method.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{method.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Processing Fee:</span>
                              <p className="font-medium">{method.fee}%</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Processing Time:</span>
                              <p className="font-medium">{method.processingTime}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Usage:</span>
                              <p className="font-medium">{method.usage}% of payments</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Scheduled Payments</h3>
                <p className="text-muted-foreground">Automated recurring payment setups</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Payment
              </Button>
            </div>

            <div className="grid gap-4">
              {scheduledPayments.map((payment) => (
                <Card key={payment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${
                          payment.status === 'active' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          <RefreshCw className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{payment.tenant}</h3>
                            <Badge variant={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">{payment.property}</p>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Amount:</span>
                              <p className="font-medium">£{payment.amount}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Next Date:</span>
                              <p className="font-medium">{payment.nextDate}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Frequency:</span>
                              <p className="font-medium">{payment.frequency}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Method:</span>
                              <p className="font-medium">{payment.method.replace('_', ' ')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {payment.status === 'active' && (
                          <Button variant="outline" size="sm">
                            <Clock className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        )}
                        {payment.status === 'paused' && (
                          <Button size="sm">Resume</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method Usage</CardTitle>
                  <CardDescription>Distribution of payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {method.icon}
                          <span className="font-medium">{method.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={method.usage} className="w-20" />
                          <span className="text-sm">{method.usage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Processing Performance</CardTitle>
                  <CardDescription>Transaction success rates and metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Success Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={paymentStats.successRate} className="w-20" />
                        <span className="text-sm">{paymentStats.successRate}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Failed Transactions</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(paymentStats.failedPayments / transactions.length) * 100} className="w-20" />
                        <span className="text-sm">{paymentStats.failedPayments}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pending Transactions</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(paymentStats.pendingPayments / transactions.length) * 100} className="w-20" />
                        <span className="text-sm">{paymentStats.pendingPayments}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Security Features</CardTitle>
                <CardDescription>Enterprise-grade payment security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium">PCI DSS Compliant</h4>
                    <p className="text-sm text-muted-foreground">Bank-level security</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium">SSL Encrypted</h4>
                    <p className="text-sm text-muted-foreground">End-to-end encryption</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium">Fraud Detection</h4>
                    <p className="text-sm text-muted-foreground">Real-time monitoring</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <h4 className="font-medium">3D Secure</h4>
                    <p className="text-sm text-muted-foreground">Extra verification</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}