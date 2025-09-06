'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Send, Loader2, CheckCircle } from "lucide-react"

interface MessageComposeModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
  landlordName?: string
  onMessageSent?: () => void
}

export function MessageComposeModal({ 
  isOpen, 
  onClose, 
  tenantId, 
  landlordName = "Your Landlord",
  onMessageSent 
}: MessageComposeModalProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('normal')
  const [isSending, setIsSending] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real implementation, this would be:
      // const response = await fetch('/api/messages', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ subject, message, priority, tenantId })
      // })
      
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
        onMessageSent?.()
        // Reset form
        setSubject('')
        setMessage('')
        setPriority('normal')
      }, 2000)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
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
            <DialogTitle className="text-xl font-semibold text-green-800">Message Sent!</DialogTitle>
            <DialogDescription className="mt-2 text-gray-600">
              Your message has been sent to {landlordName}. You'll receive a response soon.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const subjectTemplates = [
    'Rent Payment Inquiry',
    'Property Maintenance Question',
    'Lease Renewal Discussion',
    'Property Access Request',
    'Neighbor Complaint',
    'Utility Issues',
    'General Inquiry'
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Send Message
          </DialogTitle>
          <DialogDescription>
            Send a message to {landlordName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipient">To</Label>
            <Input
              id="recipient"
              value={landlordName}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <div className="space-y-2">
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
                required
              />
              <div className="flex flex-wrap gap-1">
                <span className="text-sm text-gray-500 mr-2">Quick templates:</span>
                {subjectTemplates.map((template) => (
                  <Button
                    key={template}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setSubject(template)}
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - General inquiry</SelectItem>
                <SelectItem value="normal">Normal - Standard request</SelectItem>
                <SelectItem value="high">High - Needs prompt attention</SelectItem>
                <SelectItem value="urgent">Urgent - Immediate response needed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[150px]"
              required
            />
            <div className="text-sm text-gray-500 text-right">
              {message.length}/1000 characters
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Message Tips:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Be clear and specific about your request or concern</li>
              <li>• Include relevant dates, times, and locations</li>
              <li>• For urgent matters, also call the emergency hotline</li>
              <li>• Attach photos if helpful (feature coming soon)</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSending || !subject || !message}>
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending Message...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
