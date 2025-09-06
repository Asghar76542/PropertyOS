'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, CreditCard, DollarSign, Loader2, CheckCircle, Calendar } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  tenantData: any
}

export function PaymentModal({ isOpen, onClose, tenantData }: PaymentModalProps) {
  const [amount, setAmount] = useState(tenantData?.financials?.monthlyRent?.toString() || '')
  const [paymentType, setPaymentType] = useState('rent')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setIsProcessing(false)
    setSuccess(true)
    
    // Auto close after success
    setTimeout(() => {
      setSuccess(false)
      onClose()
    }, 2000)
  }

  const formatCurrency = (amount: number) => `£${amount.toLocaleString()}`

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-green-800">Payment Successful!</DialogTitle>
            <DialogDescription className="mt-2 text-gray-600">
              Your payment of £{amount} has been processed successfully.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Make a Payment
          </DialogTitle>
          <DialogDescription>
            Choose your payment amount and method
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Rent</span>
                <span className="font-semibold">{formatCurrency(tenantData?.financials?.monthlyRent || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Balance Due</span>
                <span className="font-semibold text-red-600">{formatCurrency(tenantData?.financials?.balanceDue || 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold text-green-600">{formatCurrency(parseFloat(amount) || 0)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-type">Payment Type</Label>
              <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Monthly Rent</SelectItem>
                  <SelectItem value="deposit">Security Deposit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (£)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Card Details (if card selected) */}
          {paymentMethod === 'card' && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-base">Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    defaultValue="4242 4242 4242 4242"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      defaultValue="12/25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      defaultValue="123"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This is a demo payment. No actual charges will be made.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay £{amount || '0'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
