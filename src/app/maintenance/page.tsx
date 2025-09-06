'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { ContractorProfileModal } from '@/components/contractor-profile-modal'
import { MaintenanceRequest, Contractor, Property } from '@/types/maintenance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

import {
  Building2,
  Wrench,
  Plus,
  Search,
  Home,
  Bell,
  Settings,
  Calendar,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  AlertTriangle,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Star,
  Camera,
  Paperclip
} from "lucide-react"

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-6 w-6 text-orange-600" />
    case "in-progress":
      return <Wrench className="h-6 w-6 text-blue-600" />
    case "completed":
      return <CheckCircle className="h-6 w-6 text-green-600" />
    default:
      return <AlertTriangle className="h-6 w-6 text-gray-500" />
  }
}

export default function Maintenance() {
  const [activeTab, setActiveTab] = useState("requests")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedProperty, setSelectedProperty] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState("asc")
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'medium',
    propertyId: '',
    assignedTo: ''
  })

  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true);
      const [maintenanceResponse, propertiesResponse] = await Promise.all([
        fetch('/api/maintenance'),
        fetch('/api/properties')
      ]);
      const maintenanceData = await maintenanceResponse.json()
      const propertiesData = await propertiesResponse.json()
      setMaintenanceRequests(maintenanceData.maintenanceRequests)
      setContractors(maintenanceData.contractors)
      setProperties(propertiesData.properties)
    } catch (error) {
      console.error('Error fetching maintenance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsDialogOpen(false)
        fetchData()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const maintenanceStats = {
    total: maintenanceRequests.length,
    pending: maintenanceRequests.filter(r => r.status === "pending").length,
    inProgress: maintenanceRequests.filter(r => r.status === "in-progress").length,
    completed: maintenanceRequests.filter(r => r.status === "completed").length,
    scheduled: maintenanceRequests.filter(r => r.status === "scheduled").length,
    totalCost: maintenanceRequests.filter(r => r.actualCost).reduce((sum, r) => sum + (r.actualCost || 0), 0),
    avgResponseTime: "2.5 days"
  }

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "plumbing", label: "Plumbing" },
    { value: "electrical", label: "Electrical" },
    { value: "heating", label: "Heating" },
    { value: "general", label: "General" },
    { value: "external", label: "External" }
  ]

  const propertyOptions = [
    { value: "all", label: "All Properties" },
    ...properties.map((p: any) => ({ value: p.id, label: p.address }))
  ];

  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "scheduled", label: "Scheduled" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" }
  ]

  const priorities = [
    { value: "all", label: "All Priorities" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
  ]

  const filteredRequests: MaintenanceRequest[] = maintenanceRequests
    .filter(request => {
      const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (request.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = selectedStatus === "all" || request.status === selectedStatus
      const matchesPriority = selectedPriority === "all" || request.priority === selectedPriority
      const matchesProperty = selectedProperty === "all" || request.property.id === selectedProperty
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProperty
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary"
      case "scheduled": return "default"
      case "in-progress": return "default"
      case "completed": return "default"
      default: return "secondary"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive"
      case "medium": return "default"
      case "low": return "secondary"
      default: return "secondary"
    }
  }
 
   const getScheduledRequests = () => {
     const today = new Date()
     const endOfToday = new Date(today)
     endOfToday.setHours(23, 59, 59, 999)
 
     const endOfWeek = new Date(today)
     endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
     endOfWeek.setHours(23, 59, 59, 999)
 
     const next7Days = new Date(today)
     next7Days.setDate(today.getDate() + 7)
     next7Days.setHours(23, 59, 59, 999)
 
     const todayRequests = maintenanceRequests.filter(r => {
       const dueDate = new Date(r.dueDate)
       return dueDate >= today && dueDate <= endOfToday
     })
 
     const thisWeekRequests = maintenanceRequests.filter(r => {
       const dueDate = new Date(r.dueDate)
       return dueDate > endOfToday && dueDate <= endOfWeek
     })
 
     const next7DaysRequests = maintenanceRequests.filter(r => {
       const dueDate = new Date(r.dueDate)
       return dueDate > endOfWeek && dueDate <= next7Days
     })
 
     return { todayRequests, thisWeekRequests, next7DaysRequests }
   }
 
   const { todayRequests, thisWeekRequests, next7DaysRequests } = getScheduledRequests()
 
   const maintenanceByCategory = categories
     .filter(c => c.value !== "all")
     .map(category => {
       const count = maintenanceRequests.filter(r => {
         return (r.tags || []).map(t => t.toLowerCase()).includes(category.label.toLowerCase())
       }).length
       const percentage = maintenanceRequests.length > 0 ? (count / maintenanceRequests.length) * 100 : 0
       return {
         name: category.label,
         count,
         percentage
       }
     })
 
   if (loading) {
     return <div>Loading...</div>
   }

  if (!maintenanceRequests) {
    return <div>Error loading maintenance data.</div>
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <AppHeader
          title="Property Manager Pro"
          description="Maintenance Portal"
        />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Maintenance Portal</h2>
            <p className="text-muted-foreground">Track and manage property maintenance requests</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Maintenance Request</DialogTitle>
                <DialogDescription>
                  Fill out the form to create a new maintenance request.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
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
                        {propertyOptions.map((property: any) => (
                          <SelectItem key={property.value} value={property.value}>
                            {property.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="priority" className="text-right">
                      Priority
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="assignedTo" className="text-right">
                      Assign To
                    </Label>
                    <Select
                      value={formData.assignedTo}
                      onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select contractor" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractors.map((contractor: any) => (
                          <SelectItem key={contractor.id} value={contractor.id}>
                            {contractor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{maintenanceStats.total}</p>
                </div>
                <Wrench className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{maintenanceStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{maintenanceStats.inProgress}</p>
                </div>
                <Wrench className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{maintenanceStats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold">£{maintenanceStats.totalCost}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold">{maintenanceStats.avgResponseTime}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search maintenance requests..."
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
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Property" />
            </SelectTrigger>
            <SelectContent>
              {propertyOptions.map((property: any) => (
                <SelectItem key={property.value} value={property.value}>
                  {property.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Date Ascending</SelectItem>
              <SelectItem value="desc">Date Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="requests" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Maintenance Requests</TabsTrigger>
            <TabsTrigger value="contractors" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Contractors</TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Schedule</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="grid gap-4">
              {filteredRequests.map((request: MaintenanceRequest) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${
                          request.priority === 'high' ? 'bg-red-100' :
                          request.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          {getStatusIcon(request.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{request.title}</h3>
                            <Badge variant={getPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
                            <Badge variant={getStatusColor(request.status)}>
                              {request.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{request.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Property:</span>
                              <p className="font-medium">{request.property.address}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tenant:</span>
                              <p className="font-medium">{request.reporter.name}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Reported:</span>
                              <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Due Date:</span>
                              <p className="font-medium">{request.dueDate}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Assigned To:</span>
                              <p className="font-medium">{request.assignee?.name || 'Unassigned'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cost:</span>
                              <p className="font-medium">
                                £{request.actualCost || request.estimatedCost || 'TBD'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            {(request.tags || []).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {(request.images || []).length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Camera className="h-3 w-3 mr-1" />
                                {request.images.length} images
                              </Badge>
                            )}
                            {(request.documents || []).length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Paperclip className="h-3 w-3 mr-1" />
                                {request.documents.length} documents
                              </Badge>
                            )}
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
                        {request.status === 'pending' && (
                          <Button size="sm">Assign</Button>
                        )}
                        {request.status === 'in-progress' && (
                          <Button size="sm">Complete</Button>
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

          <TabsContent value="contractors" className="space-y-4">
            <div className="grid gap-4">
              {contractors.map((contractor: any) => (
                <Card key={contractor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{contractor.name}</h3>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{contractor.rating}</span>
                            </div>
                            <Badge variant="outline">{contractor.category}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{contractor.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{contractor.email}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Total Jobs:</span>
                              <p className="font-medium">{contractor.totalJobs}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Completed:</span>
                              <p className="font-medium text-green-600">{contractor.completedJobs}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Avg Cost:</span>
                              <p className="font-medium">£{contractor.averageCost}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Response Time:</span>
                              <p className="font-medium">{contractor.responseTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            {(contractor.specialties || []).map((specialty) => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedContractor(contractor)
                            setIsProfileModalOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                        <Button size="sm">Assign Job</Button>
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

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>Calendar view of upcoming and ongoing maintenance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Today</h4>
                      <div className="space-y-2">
                        {todayRequests.length > 0 ? (
                          todayRequests.map(request => (
                            <div key={request.id} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-sm">{request.title} at {request.property.address}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No maintenance scheduled for today.</p>
                        )}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">This Week</h4>
                      <div className="space-y-2">
                        {thisWeekRequests.length > 0 ? (
                          thisWeekRequests.map(request => (
                            <div key={request.id} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className="text-sm">{request.title} at {request.property.address}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No maintenance scheduled for this week.</p>
                        )}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Next 7 Days</h4>
                      <div className="space-y-2">
                        {next7DaysRequests.length > 0 ? (
                          next7DaysRequests.map(request => (
                            <div key={request.id} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">{request.title} at {request.property.address}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No maintenance scheduled for the next 7 days.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance by Category</CardTitle>
                  <CardDescription>Breakdown of maintenance requests by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceByCategory.map(category => (
                      <div key={category.name} className="flex items-center justify-between">
                        <span>{category.name}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={category.percentage} className="w-20" />
                          <span className="text-sm">{category.percentage.toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contractor Performance</CardTitle>
                  <CardDescription>Rating and completion statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contractors.map((contractor: any) => (
                      <div key={contractor.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{contractor.name}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{contractor.rating}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {contractor.completedJobs}/{contractor.totalJobs} jobs
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contractor.responseTime} response
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <ContractorProfileModal
        contractor={selectedContractor}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
    </>
  )
}