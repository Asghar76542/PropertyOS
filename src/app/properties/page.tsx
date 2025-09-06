'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign, 
  Calendar,
  MapPin,
  Home,
  Bed,
  Bath,
  Search,
  Filter
} from "lucide-react"

interface Property {
  id: string
  address: string
  city: string
  postcode: string
  propertyType: string
  bedrooms?: number
  bathrooms?: number
  size?: string
  description?: string
  monthlyRent: number
  deposit: number
  isAvailable: boolean
  createdAt: string
  landlord: {
    id: string
    name: string
    email: string
  }
  tenancies: Array<{
    id: string
    tenant: {
      id: string
      name: string
      email: string
    }
    status: string
  }>
  _count: {
    tenancies: number
    maintenanceRequests: number
    complianceRecords: number
  }
}

interface PropertyFormData {
  address: string
  city: string
  postcode: string
  propertyType: string
  bedrooms?: number
  bathrooms?: number
  size?: string
  description?: string
  monthlyRent: number
  deposit: number
  isAvailable: boolean
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [formData, setFormData] = useState<PropertyFormData>({
    address: '',
    city: '',
    postcode: '',
    propertyType: '',
    bedrooms: undefined,
    bathrooms: undefined,
    size: '',
    description: '',
    monthlyRent: 0,
    deposit: 0,
    isAvailable: true
  })

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties')
      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingProperty ? `/api/properties/${editingProperty.id}` : '/api/properties'
      const method = editingProperty ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          landlordId: 'temp-landlord-id' // This should come from authentication
        }),
      })

      if (response.ok) {
        await fetchProperties()
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving property:', error)
    }
  }

  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setFormData({
      address: property.address,
      city: property.city,
      postcode: property.postcode,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      size: property.size,
      description: property.description,
      monthlyRent: property.monthlyRent,
      deposit: property.deposit,
      isAvailable: property.isAvailable
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (propertyId: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      try {
        const response = await fetch(`/api/properties/${propertyId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await fetchProperties()
        }
      } catch (error) {
        console.error('Error deleting property:', error)
      }
    }
  }

  const resetForm = () => {
    setEditingProperty(null)
    setFormData({
      address: '',
      city: '',
      postcode: '',
      propertyType: '',
      bedrooms: undefined,
      bathrooms: undefined,
      size: '',
      description: '',
      monthlyRent: 0,
      deposit: 0,
      isAvailable: true
    })
  }

  const filteredProperties = properties.filter(property =>
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.postcode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title="Properties"
        description="Manage your property portfolio"
      />

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search properties by address, city, or postcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
            if (!isOpen) {
              resetForm();
            }
            setIsDialogOpen(isOpen);
          }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Property</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>{editingProperty ? 'Edit Property' : 'Add New Property'}</DialogTitle>
                <DialogDescription>
                  {editingProperty ? 'Update the details of your property.' : 'Fill in the details of the new property.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">Address</Label>
                    <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="city" className="text-right">City</Label>
                    <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="postcode" className="text-right">Postcode</Label>
                    <Input id="postcode" value={formData.postcode} onChange={(e) => setFormData({ ...formData, postcode: e.target.value })} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="propertyType" className="text-right">Type</Label>
                    <Select value={formData.propertyType} onValueChange={(value) => setFormData({ ...formData, propertyType: value })}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APARTMENT">Apartment</SelectItem>
                        <SelectItem value="HOUSE">House</SelectItem>
                        <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bedrooms" className="text-right">Bedrooms</Label>
                    <Input id="bedrooms" type="number" value={formData.bedrooms || ''} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value ? Number(e.target.value) : undefined })} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bathrooms" className="text-right">Bathrooms</Label>
                    <Input id="bathrooms" type="number" value={formData.bathrooms || ''} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value ? Number(e.target.value) : undefined })} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="size" className="text-right">Size (sqft)</Label>
                    <Input id="size" value={formData.size || ''} onChange={(e) => setFormData({ ...formData, size: e.target.value })} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Textarea id="description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="monthlyRent" className="text-right">Monthly Rent (£)</Label>
                    <Input id="monthlyRent" type="number" value={formData.monthlyRent} onChange={(e) => setFormData({ ...formData, monthlyRent: Number(e.target.value) })} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deposit" className="text-right">Deposit (£)</Label>
                    <Input id="deposit" type="number" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isAvailable" className="text-right">Available</Label>
                    <div className="col-span-3">
                      <input type="checkbox" id="isAvailable" checked={formData.isAvailable} onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{editingProperty ? 'Save Changes' : 'Create Property'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{property.address}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {property.city}, {property.postcode}
                    </CardDescription>
                  </div>
                  <Badge variant={property.isAvailable ? 'default' : 'secondary'}>
                    {property.isAvailable ? 'Available' : 'Occupied'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Home className="h-4 w-4" />
                      <span>{property.propertyType}</span>
                    </div>
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.bedrooms} bed</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms} bath</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Monthly Rent</p>
                      <p className="font-semibold">£{property.monthlyRent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deposit</p>
                      <p className="font-semibold">£{property.deposit.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div className="text-center">
                      <p className="font-semibold">{property._count.tenancies}</p>
                      <p>Tenancies</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{property._count.maintenanceRequests}</p>
                      <p>Maintenance</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{property._count.complianceRecords}</p>
                      <p>Compliance</p>
                    </div>
                  </div>

                  {property.tenancies.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-2">Current Tenant:</p>
                      <p className="text-sm text-muted-foreground">
                        {property.tenancies[0].tenant.name}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(property)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(property.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No properties match your search criteria.' : 'Start by adding your first property.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}