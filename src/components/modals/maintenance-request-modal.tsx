'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Wrench, Upload, Loader2, CheckCircle, AlertCircle, Camera } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MaintenanceRequestModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
  onRequestSubmitted?: () => void
}

export function MaintenanceRequestModal({ isOpen, onClose, tenantId, onRequestSubmitted }: MaintenanceRequestModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real implementation, this would be:
      // const response = await fetch('/api/maintenance-requests', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ title, description, priority, category, tenantId })
      // })
      
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
        onRequestSubmitted?.()
        // Reset form
        setTitle('')
        setDescription('')
        setPriority('medium')
        setCategory('')
      }, 2000)
    } catch (error) {
      console.error('Failed to submit maintenance request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low Priority</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-green-800">Request Submitted!</DialogTitle>
            <DialogDescription className="mt-2 text-gray-600">
              Your maintenance request has been submitted successfully. You'll receive updates via email.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-600" />
            Submit Maintenance Request
          </DialogTitle>
          <DialogDescription>
            Report an issue or request maintenance for your property
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Request Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="heating">Heating/Cooling</SelectItem>
                    <SelectItem value="appliances">Appliances</SelectItem>
                    <SelectItem value="structural">Structural</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Can wait a few days</SelectItem>
                    <SelectItem value="medium">Medium - Within a week</SelectItem>
                    <SelectItem value="high">High - Urgent attention needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide detailed information about the issue, including location, when it started, and any relevant details..."
                className="min-h-[120px]"
                required
              />
            </div>
          </div>

          {/* Priority Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Selected Priority:</span>
              {getPriorityBadge(priority)}
            </div>
            <p className="text-sm text-gray-600">
              {priority === 'high' && "High priority requests are typically addressed within 24 hours."}
              {priority === 'medium' && "Medium priority requests are typically addressed within 2-3 business days."}
              {priority === 'low' && "Low priority requests are typically addressed within a week."}
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Photos (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload photos to help us understand the issue better
              </p>
              <Button type="button" variant="outline" size="sm" disabled>
                <Upload className="w-4 h-4 mr-2" />
                Choose Files (Demo)
              </Button>
            </div>
          </div>

          {/* Important Notes */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Emergency situations:</strong> For urgent issues like gas leaks, electrical hazards, or security breaches, 
              please contact our emergency hotline immediately at <strong>0800 123 4567</strong>.
            </AlertDescription>
          </Alert>

          {/* Access Information */}
          <div className="space-y-2">
            <Label>Access Instructions (Optional)</Label>
            <Textarea
              placeholder="Any special instructions for accessing the property or specific areas..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting || !title || !description}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
