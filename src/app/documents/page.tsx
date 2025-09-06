'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
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
  FileText,
  Upload,
  Download,
  Search,
  Home,
  Bell,
  Settings,
  Calendar,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Tag,
  Folder,
  Star,
  AlertTriangle
} from "lucide-react"

interface Property {
  id: string;
  address: string;
}

interface Document {
  id: string;
  originalName: string;
  documentType: string;
  propertyId: string;
  createdAt: string;
  expiresAt: string | null;
  fileSize: number;
  mimeType: string;
  filePath: string;
  starred: boolean;
}

export default function Documents() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProperty, setSelectedProperty] = useState("all")
  const [isUploading, setIsUploading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadForm, setUploadForm] = useState({
    propertyId: '',
    documentType: 'OTHER',
    description: '',
    expiresAt: '',
    tenancyId: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const documentsResponse = await fetch('/api/documents', {
        headers: {
          'x-user-id': 'user_2j9x5x4f3z1y2w3v1u0t9s8r7q6p5o4n'
        }
      })
      const documentsData = await documentsResponse.json()
      setDocuments(documentsData.documents)

      const propertiesResponse = await fetch('/api/properties', {
        headers: {
          'x-user-id': 'user_2j9x5x4f3z1y2w3v1u0t9s8r7q6p5o4n'
        }
      })
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('propertyId', uploadForm.propertyId)
    formData.append('documentType', uploadForm.documentType)
    formData.append('description', uploadForm.description)
    formData.append('expiresAt', uploadForm.expiresAt)

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
        headers: {
          'x-user-id': 'user_2j9x5x4f3z1y2w3v1u0t9s8r7q6p5o4n'
        }
      })

      if (response.ok) {
        setShowUploadDialog(false)
        setSelectedFile(null)
        setUploadForm({
          propertyId: '',
          documentType: 'OTHER',
          description: '',
          expiresAt: '',
          tenancyId: ''
        })
        fetchData() // Refresh documents
      } else {
        console.error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "LEASE_AGREEMENT", label: "Lease Agreement" },
    { value: "GAS_SAFETY_CERTIFICATE", label: "Gas Safety Certificate" },
    { value: "EPC_CERTIFICATE", label: "EPC Certificate" },
    { value: "ELECTRICAL_SAFETY_CERTIFICATE", label: "Electrical Safety Certificate" },
    { value: "INVENTORY_REPORT", label: "Inventory Report" },
    { value: "DEPOSIT_PROTECTION_CERTIFICATE", label: "Deposit Protection Certificate" },
    { value: "INSURANCE_DOCUMENT", label: "Insurance Document" },
    { value: "OTHER", label: "Other" }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid": return "default"
      case "active": return "default"
      case "current": return "default"
      case "expired": return "destructive"
      default: return "secondary"
    }
  }

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null

    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { status: "expired", days: Math.abs(diffDays) }
    if (diffDays <= 30) return { status: "expiring-soon", days: diffDays }
    if (diffDays <= 90) return { status: "expiring", days: diffDays }
    return { status: "valid", days: diffDays }
  }

  const documentStats = {
    total: documents.length,
    starred: documents.filter(d => d.starred).length,
    expiringSoon: documents.filter(d => {
      if (!d.expiresAt) return false
      const expiry = new Date(d.expiresAt)
      const now = new Date()
      const diffTime = expiry.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 30 && diffDays > 0
    }).length,
    expired: documents.filter(d => {
      if (!d.expiresAt) return false
      return new Date(d.expiresAt) < new Date()
    }).length
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || doc.documentType === selectedCategory
    const matchesProperty = selectedProperty === "all" || doc.propertyId === selectedProperty
    
    const matchesTab = () => {
        switch (activeTab) {
            case 'all':
                return true
            case 'certificates':
                return doc.documentType.includes('CERTIFICATE')
            case 'agreements':
                return doc.documentType === 'LEASE_AGREEMENT'
            case 'reports':
                return doc.documentType === 'INVENTORY_REPORT'
            case 'starred':
                return doc.starred
            default:
                return true
        }
    }

    return matchesSearch && matchesCategory && matchesProperty && matchesTab()
  })

  if (loading) {
    return <div>Loading...</div>
  }

  if (!documents) {
    return <div>Error loading documents.</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title="Property Manager Pro"
        description="Document Storage"
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Document Storage</h2>
            <p className="text-muted-foreground">Secure storage for all your property documents</p>
          </div>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload a new document to your property portfolio
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="mt-1"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="propertyId">Property</Label>
                  <Select
                    value={uploadForm.propertyId}
                    onValueChange={(value) => setUploadForm({...uploadForm, propertyId: value})}
                  >
                    <SelectTrigger className="mt-1">
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

                <div>
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select
                    value={uploadForm.documentType}
                    onValueChange={(value) => setUploadForm({...uploadForm, documentType: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEASE_AGREEMENT">Lease Agreement</SelectItem>
                      <SelectItem value="GAS_SAFETY_CERTIFICATE">Gas Safety Certificate</SelectItem>
                      <SelectItem value="EPC_CERTIFICATE">EPC Certificate</SelectItem>
                      <SelectItem value="ELECTRICAL_SAFETY_CERTIFICATE">Electrical Safety Certificate</SelectItem>
                      <SelectItem value="INVENTORY_REPORT">Inventory Report</SelectItem>
                      <SelectItem value="DEPOSIT_PROTECTION_CERTIFICATE">Deposit Protection Certificate</SelectItem>
                      <SelectItem value="INSURANCE_DOCUMENT">Insurance Document</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    placeholder="Document description..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="expiresAt">Expiry Date (optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={uploadForm.expiresAt}
                    onChange={(e) => setUploadForm({...uploadForm, expiresAt: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold">{documentStats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Starred</p>
                  <p className="text-2xl font-bold">{documentStats.starred}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold text-orange-600">{documentStats.expiringSoon}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{documentStats.expired}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
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
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">All Documents</TabsTrigger>
            <TabsTrigger value="certificates" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Certificates</TabsTrigger>
            <TabsTrigger value="agreements" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Agreements</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Reports</TabsTrigger>
            <TabsTrigger value="starred" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Starred</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid gap-4">
              {filteredDocuments.map((doc) => {
                const expiryStatus = getExpiryStatus(doc.expiresAt)
                const property = properties.find(p => p.id === doc.propertyId)
                return (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{doc.originalName}</h3>
                              {doc.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {property ? property.address : 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                              </span>
                              <span>{(doc.fileSize / 1024).toFixed(2)} KB</span>
                              <span>{doc.mimeType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {doc.documentType}
                              </Badge>
                              {expiryStatus && (
                                <Badge variant={
                                  expiryStatus.status === "expired" ? "destructive" :
                                  expiryStatus.status === "expiring-soon" ? "default" :
                                  expiryStatus.status === "expiring" ? "default" : "secondary"
                                }>
                                  {expiryStatus.status === "expired" ? `Expired ${expiryStatus.days} days ago` :
                                   expiryStatus.status === "expiring-soon" ? `Expires in ${expiryStatus.days} days` :
                                   expiryStatus.status === "expiring" ? `Expires in ${expiryStatus.days} days` :
                                   "Valid"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={doc.filePath} target="_blank">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={doc.filePath} download>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}