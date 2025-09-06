'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Shield, CheckCircle, AlertTriangle, Calendar, Bot, Search, Home, Bell, Settings, Plus } from "lucide-react"
import { Progress } from '@/components/ui/progress'
import { ComplianceRecord, ComplianceStatus } from '@/types/compliance'

interface Property {
  id: string;
  address: string;
}

export default function Compliance() {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null)
  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirement: '',
    dueDate: '',
    propertyId: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const complianceResponse = await fetch('/api/compliance')
      const complianceData = await complianceResponse.json()
      setComplianceStatus(complianceData.complianceStatus)
      setComplianceRecords(complianceData.complianceRecords)

      const propertiesResponse = await fetch('/api/properties')
      const propertiesData = await propertiesResponse.json()
      setProperties(propertiesData.properties)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setFormData({
          title: '',
          description: '',
          requirement: '',
          dueDate: '',
          propertyId: ''
        })
        fetchData() // Refresh the data
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!complianceStatus) {
    return <div>Error loading compliance data.</div>
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Property Manager Pro"
        description="Compliance Dashboard"
      />

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Overview</TabsTrigger>
            <TabsTrigger value="records" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Compliance Records</TabsTrigger>
            <TabsTrigger value="ai-advisor" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">AI Advisor</TabsTrigger>
            <TabsTrigger value="deadlines" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Deadlines</TabsTrigger>
            <TabsTrigger value="regulations" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Regulations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    Overall Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2 text-green-600">{complianceStatus.overall}%</div>
                  <Progress value={complianceStatus.overall} className="mb-2" />
                  <p className="text-sm text-green-600">Good standing</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                    Urgent Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2 text-yellow-600">2</div>
                  <p className="text-sm text-yellow-600">Require immediate attention</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2 text-blue-600">3</div>
                  <p className="text-sm text-blue-600">Next 30 days</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Records</CardTitle>
                <CardDescription>Manage all your compliance records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {complianceRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{record.requirement}</p>
                        <p className="text-sm text-muted-foreground">{record.property?.address || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={record.status === 'COMPLIANT' ? 'default' : 'destructive'}>
                          {record.status}
                        </Badge>
                        <p className="text-sm">{new Date(record.dueDate).toLocaleDateString()}</p>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-advisor" className="space-y-6">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  AI Regulations Advisor
                </CardTitle>
                <CardDescription className="text-indigo-600">
                  Ask questions about property regulations and get AI-powered guidance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">AI-powered compliance advice is available here. Ask about gas safety certificates, EPC requirements, electrical safety, fire regulations, and more.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deadlines" className="space-y-6">
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-700">Compliance Deadlines</CardTitle>
                <CardDescription className="text-orange-600">Track important compliance dates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">Manage and track all your compliance deadlines in one place.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regulations" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-700">Regulation Updates</CardTitle>
                <CardDescription className="text-purple-600">Stay informed about regulatory changes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">Get the latest updates on property regulations and compliance requirements.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}