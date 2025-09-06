'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { Property, Payment, Expense, FinancialSummary, Tenancy } from '@/types/financial'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Home,
  Bell,
  Settings,
  Calendar,
  Clock,
  CreditCard,
  AlertTriangle,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  FileText,
  BarChart3,
  PieChart,
  Target,
  Receipt,
  Users
} from "lucide-react"
import { Progress } from '@/components/ui/progress'

const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case 'Credit Card':
      return <CreditCard className="h-6 w-6 text-blue-600" />
    case 'Bank Transfer':
      return <Home className="h-6 w-6 text-green-600" />
    default:
      return <DollarSign className="h-6 w-6 text-gray-600" />
  }
}

export default function Financial() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProperty, setSelectedProperty] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [tenancies, setTenancies] = useState<Tenancy[]>([])
  const [formData, setFormData] = useState({
    type: 'payment',
    amount: 0,
    status: 'COMPLETED',
    dueDate: new Date().toISOString().split('T')[0],
    propertyId: '',
    tenancyId: '',
    title: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/financial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsDialogOpen(false)
        // Refresh the data
        fetchData()
        setFormData({
          type: 'payment',
          amount: 0,
          status: 'COMPLETED',
          dueDate: new Date().toISOString().split('T')[0],
          propertyId: '',
          tenancyId: '',
          title: '',
          description: ''
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }
  const [rentPayments, setRentPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/financial')
      const data = await response.json()
      setProperties(data.properties)
      setRentPayments(data.rentPayments)
      setExpenses(data.expenses)
      setFinancialSummary(data.financialSummary)
    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (formData.propertyId) {
      const selectedProp = properties.find(p => p.id === formData.propertyId)
      if (selectedProp) {
        setTenancies(selectedProp.tenancies)
      }
    }
  }, [formData.propertyId, properties])

  const monthlyData = [
    { month: "Jan", rent: 3650, expenses: 2200, net: 1450 },
    { month: "Feb", rent: 3650, expenses: 1800, net: 1850 },
    { month: "Mar", rent: 3650, expenses: 2000, net: 1650 },
    { month: "Apr", rent: 3650, expenses: 1900, net: 1750 },
    { month: "May", rent: 3650, expenses: 2100, net: 1550 },
    { month: "Jun", rent: 3650, expenses: 1700, net: 1950 }
  ]

  const filteredPayments = rentPayments.filter(payment => {
    const matchesSearch = payment.property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.tenancy.tenant.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProperty = selectedProperty === "all" || payment.property.address === selectedProperty
    const matchesStatus = selectedStatus === "all" || payment.status.toLowerCase() === selectedStatus.toLowerCase()
    
    return matchesSearch && matchesProperty && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "default"
      case "PAID": return "default"
      case "PENDING": return "secondary"
      case "FAILED": return "destructive"
      case "OVERDUE": return "destructive"
      default: return "secondary"
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!financialSummary) {
    return <div>Error loading financial data.</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title="Property Manager Pro"
        description="Financial Dashboard"
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Financial Overview</h2>
            <p className="text-muted-foreground">Track rent payments, expenses, and financial performance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record a Transaction</DialogTitle>
                  <DialogDescription>
                    Choose whether to record a payment or an expense.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Type
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="payment">Payment</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.type === 'payment' ? (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="propertyId" className="text-right">
                            Property
                          </Label>
                          <Select
                            value={formData.propertyId}
                            onValueChange={(value) => {
                              setFormData({ ...formData, propertyId: value, tenancyId: '' })
                            }}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                            <SelectContent>
                              {properties.map((property) => (
                                <SelectItem key={property.id} value={property.id}>
                                  {property.address}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="tenancyId" className="text-right">
                            Tenancy
                          </Label>
                          <Select
                            value={formData.tenancyId}
                            onValueChange={(value) => setFormData({ ...formData, tenancyId: value })}
                            disabled={!formData.propertyId || tenancies.length === 0}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select tenancy" />
                            </SelectTrigger>
                            <SelectContent>
                              {tenancies.map((tenancy) => (
                                <SelectItem key={tenancy.id} value={tenancy.id}>
                                  {tenancy.tenant.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="amount" className="text-right">
                            Amount
                          </Label>
                          <Input
                            id="amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="dueDate" className="text-right">
                            Due Date
                          </Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="propertyId" className="text-right">
                            Property
                          </Label>
                          <Select
                            value={formData.propertyId}
                            onValueChange={(value) => setFormData({ ...formData, propertyId: value })}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                            <SelectContent>
                              {properties.map((property) => (
                                <SelectItem key={property.id} value={property.id}>
                                  {property.address}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="title" className="text-right">
                            Title
                          </Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="amount" className="text-right">
                            Amount
                          </Label>
                          <Input
                            id="amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            className="col-span-3"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Rent</p>
                  <p className="text-2xl font-bold">£{financialSummary.monthlyRent}</p>
                  <p className="text-xs text-muted-foreground">
                    £{financialSummary.collectedRent} collected
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
              <Progress value={financialSummary.collectionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Income</p>
                  <p className="text-2xl font-bold text-green-600">£{financialSummary.netIncome}</p>
                  <p className="text-xs text-muted-foreground">
                    After £{financialSummary.totalExpenses} expenses
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                  <p className="text-2xl font-bold">{financialSummary.occupancyRate.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">
                    {financialSummary.occupiedProperties}/{financialSummary.totalProperties} occupied
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
              <Progress value={financialSummary.occupancyRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue Rent</p>
                  <p className="text-2xl font-bold text-red-600">£{financialSummary.overdueRent}</p>
                  <p className="text-xs text-muted-foreground">
                    Requires attention
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Overview</TabsTrigger>
            <TabsTrigger value="rent" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Rent Tracking</TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Expenses</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Reports</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Performance</CardTitle>
                  <CardDescription>Monthly rent collection by property</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{property.address}</h4>
                          <p className="text-sm text-muted-foreground">{property.tenancies[0]?.tenant.name || 'No tenant'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">£{property.monthlyRent}</p>
                          <Badge variant={getStatusColor(property.tenancies[0]?.payments[0]?.status || 'PENDING')} className="text-xs">
                            {property.tenancies[0]?.payments[0]?.status || 'PENDING'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest rent payments and expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rentPayments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getPaymentMethodIcon('Credit Card')}
                          <div>
                            <p className="font-medium">{payment.tenancy.tenant.name}</p>
                            <p className="text-sm text-muted-foreground">{payment.property.address}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">£{payment.amount}</p>
                          <p className="text-xs text-muted-foreground">{new Date(payment.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                    {expenses.slice(0, 3).map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                        <div className="flex items-center gap-3">
                          <Receipt className="h-4 w-4 text-red-600" />
                          <div>
                            <p className="font-medium">{expense.title}</p>
                            <p className="text-sm text-muted-foreground">{expense.property.address}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">-£{expense.actualCost}</p>
                          <p className="text-xs text-muted-foreground">{new Date(expense.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rent" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search payments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.address}>
                      {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {filteredPayments.map((payment) => (
                <Card key={payment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${
                          payment.status === 'COMPLETED' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {getPaymentMethodIcon('Credit Card')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{payment.tenancy.tenant.name}</h3>
                            <Badge variant={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">{payment.property.address}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Amount:</span>
                              <p className="font-medium">£{payment.amount}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Date:</span>
                              <p className="font-medium">{new Date(payment.dueDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Reference:</span>
                              <p className="font-medium">{payment.id.slice(0,8)}</p>
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

          <TabsContent value="expenses" className="space-y-6">
            <div className="grid gap-4">
              {expenses.map((expense) => (
                <Card key={expense.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-red-100 rounded-lg">
                          <Receipt className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{expense.title}</h3>
                            <Badge variant={getStatusColor(expense.status)}>
                              {expense.status}
                            </Badge>
                            <Badge variant="outline">{expense.priority}</Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">{expense.property.address}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Amount:</span>
                              <p className="font-medium text-red-600">£{expense.actualCost}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Date:</span>
                              <p className="font-medium">{new Date(expense.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Receipt:</span>
                              <p className="font-medium">{'No receipt'}</p>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <FileText className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle>Income Statement</CardTitle>
                  <CardDescription>Monthly income and expenses report</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive view of rental income and operating expenses
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle>Rent Roll Report</CardTitle>
                  <CardDescription>Detailed rent collection analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Track rent payments, arrears, and collection rates
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <PieChart className="h-8 w-8 text-purple-600 mb-2" />
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>Categorized expense analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    View expenses by category and property
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <Target className="h-8 w-8 text-orange-600 mb-2" />
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Occupancy rates, yield analysis, and ROI metrics
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <Users className="h-8 w-8 text-red-600 mb-2" />
                  <CardTitle>Tenant Ledger</CardTitle>
                  <CardDescription>Individual tenant payment history</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Detailed payment history for each tenant
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <Calendar className="h-8 w-8 text-indigo-600 mb-2" />
                  <CardTitle>Annual Summary</CardTitle>
                  <CardDescription>Year-end financial summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete annual financial overview and tax preparation
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                  <CardDescription>Income vs expenses over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((data, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{data.month}</span>
                          <span>Net: £{data.net}</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-1">Rent: £{data.rent}</div>
                            <Progress value={100} className="h-2" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-1">Expenses: £{data.expenses}</div>
                            <Progress value={(data.expenses / data.rent) * 100} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expense Categories</CardTitle>
                  <CardDescription>Breakdown of expenses by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Maintenance</span>
                      <div className="flex items-center gap-2">
                        <Progress value={35} className="w-20" />
                        <span className="text-sm">35%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Utilities</span>
                      <div className="flex items-center gap-2">
                        <Progress value={25} className="w-20" />
                        <span className="text-sm">25%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Insurance</span>
                      <div className="flex items-center gap-2">
                        <Progress value={20} className="w-20" />
                        <span className="text-sm">20%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Services</span>
                      <div className="flex items-center gap-2">
                        <Progress value={20} className="w-20" />
                        <span className="text-sm">20%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}