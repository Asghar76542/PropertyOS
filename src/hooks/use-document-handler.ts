'use client'

import { useState } from 'react'

export function useDocumentHandler() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const downloadDocument = async (documentId: string, documentName: string, documentType: 'lease' | 'receipt' | 'statement' | 'invoice') => {
    setDownloading(documentId)
    
    try {
      // In real implementation, this would be an API call:
      // const response = await fetch(`/api/documents/download/${documentId}`, {
      //   method: 'GET',
      //   headers: { 'Authorization': `Bearer ${token}` }
      // })
      
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate file download
      const link = document.createElement('a')
      
      // Generate mock document content based on type
      let content = ''
      const date = new Date().toLocaleDateString()
      
      switch (documentType) {
        case 'lease':
          content = `LEASE AGREEMENT\n\nDate: ${date}\nTenant: Sarah Johnson\nProperty: 123 Main St, Apt 2B\n\nThis lease agreement is between the landlord and tenant for the rental of the above property.\n\nTerms and Conditions:\n1. Rent: $1,200/month\n2. Security Deposit: $1,200\n3. Lease Term: 12 months\n4. Pet Policy: No pets allowed\n\nSignatures:\n_________________\nLandlord\n\n_________________\nTenant`
          break
        case 'receipt':
          content = `RENT RECEIPT\n\nReceipt #: RR-${Date.now()}\nDate: ${date}\nTenant: Sarah Johnson\nProperty: 123 Main St, Apt 2B\n\nPayment Details:\nRent Amount: $1,200.00\nLate Fee: $0.00\nTotal Paid: $1,200.00\nPayment Method: Online Transfer\n\nThank you for your payment!`
          break
        case 'statement':
          content = `ACCOUNT STATEMENT\n\nStatement Period: ${new Date(Date.now() - 30*24*60*60*1000).toLocaleDateString()} - ${date}\nTenant: Sarah Johnson\nProperty: 123 Main St, Apt 2B\n\nCharges:\nRent (${new Date().toLocaleString('default', { month: 'long' })}): $1,200.00\nUtilities: $150.00\nParking: $50.00\n\nPayments:\nPayment on ${new Date(Date.now() - 15*24*60*60*1000).toLocaleDateString()}: $1,400.00\n\nBalance: $0.00`
          break
        case 'invoice':
          content = `INVOICE\n\nInvoice #: INV-${Date.now()}\nDate: ${date}\nBill To: Sarah Johnson\nProperty: 123 Main St, Apt 2B\n\nDescription: Monthly Rent - ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}\nAmount: $1,200.00\nDue Date: ${new Date(Date.now() + 5*24*60*60*1000).toLocaleDateString()}\n\nPlease remit payment by the due date.`
          break
      }
      
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      
      link.href = url
      link.download = documentName
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Show success message (you could integrate with toast system)
      console.log(`Downloaded: ${documentName}`)
      
    } catch (error) {
      console.error('Download failed:', error)
      // Handle error (show toast notification, etc.)
    } finally {
      setDownloading(null)
    }
  }

  const previewDocument = async (documentId: string, documentName: string) => {
    try {
      // In real implementation, this would generate a preview URL:
      // const response = await fetch(`/api/documents/preview/${documentId}`)
      // const { previewUrl } = await response.json()
      
      // For now, open in new window with document details
      const previewContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Document Preview - ${documentName}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
            .header { border-bottom: 2px solid #ccc; padding-bottom: 20px; margin-bottom: 20px; }
            .content { line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Document Preview</h1>
            <p><strong>Document:</strong> ${documentName}</p>
            <p><strong>Type:</strong> ${documentId.includes('lease') ? 'Lease Agreement' : documentId.includes('receipt') ? 'Payment Receipt' : 'Account Statement'}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="content">
            <p>This is a preview of your document. The actual document contains your complete property and payment information.</p>
            <p>To download the full document, click the download button in your dashboard.</p>
            <br>
            <p><em>Preview functionality is currently in development. Full document preview will be available soon.</em></p>
          </div>
        </body>
        </html>
      `
      
      const previewWindow = window.open('', '_blank')
      previewWindow?.document.write(previewContent)
      previewWindow?.document.close()
      
    } catch (error) {
      console.error('Preview failed:', error)
    }
  }

  return {
    downloadDocument,
    previewDocument,
    downloading
  }
}
