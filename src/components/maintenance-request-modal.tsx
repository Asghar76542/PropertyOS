'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  X,
  Camera,
  FileText
} from "lucide-react"

interface MaintenanceRequestModalProps {
  onSubmit: (request: MaintenanceRequestData) => void
  isOpen: boolean
  onClose: () => void
}

interface MaintenanceRequestData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  location: string
  accessInstructions: string
  preferredDate?: string
  contactPreference: 'email' | 'phone' | 'text'
}

const categories = [
  'Plumbing',
  'Electrical',
  'HVAC/Heating',
  'Appliance',
  'Structural',
  'Pest Control',
  'Security',
  'Other'
]

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
]

export function MaintenanceRequestModal({ onSubmit, isOpen, onClose }: MaintenanceRequestModalProps) {
  const [formData, setFormData] = useState<MaintenanceRequestData>({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    location: '',
    accessInstructions: '',
    preferredDate: '',
    contactPreference: 'email'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        location: '',
        accessInstructions: '',
        preferredDate: '',
        contactPreference: 'email'
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error submitting maintenance request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof MaintenanceRequestData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorities.find(p => p.value === priority)
    return priorityConfig ? (
      <Badge className={priorityConfig.color}>
        {priorityConfig.label}
      </Badge>
    ) : null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Submit Maintenance Request
          </DialogTitle>
          <DialogDescription>
            Please provide detailed information about the maintenance issue you're experiencing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Kitchen faucet leaking"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Priority <span className="text-red-500">*</span>
              </label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(priority.value)}
                        <span>{priority.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Location <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Kitchen, Bathroom, Living Room"
              className={errors.location ? 'border-red-500' : ''}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Please provide detailed information about the issue, when it started, and any other relevant details..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Access Instructions */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Access Instructions
            </label>
            <Textarea
              value={formData.accessInstructions}
              onChange={(e) => handleInputChange('accessInstructions', e.target.value)}
              placeholder="e.g., Ring doorbell, key under mat, call before entering..."
              rows={2}
            />
          </div>

          {/* Preferred Date and Contact Preference */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Preferred Date (Optional)
              </label>
              <Input
                type="date"
                value={formData.preferredDate}
                onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Contact Preference
              </label>
              <Select value={formData.contactPreference} onValueChange={(value) => handleInputChange('contactPreference', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="text">Text Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Emergency Notice */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800 mb-1">Emergency?</h4>
                  <p className="text-sm text-orange-700">
                    If this is an emergency (e.g., flooding, no heat, security issue), please contact your landlord or property manager immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}