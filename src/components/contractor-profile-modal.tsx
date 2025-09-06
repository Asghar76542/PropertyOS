"use client"

import { Contractor } from "@/types/maintenance"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface ContractorProfileModalProps {
  contractor: Contractor | null
  isOpen: boolean
  onClose: () => void
}

export function ContractorProfileModal({
  contractor,
  isOpen,
  onClose,
}: ContractorProfileModalProps) {
  if (!contractor) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Contractor Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">{contractor.name}</div>
            <div className="flex items-center gap-1 text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`h-5 w-5 ${
                    i < contractor.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Contact Information</h4>
              <p>{contractor.phone}</p>
              <p>{contractor.email}</p>
            </div>
            <div>
              <h4 className="font-semibold">Job Statistics</h4>
              <p>Total Jobs: {contractor.totalJobs}</p>
              <p>Completed Jobs: {contractor.completedJobs}</p>
              <p>
                Average Cost: $
                {contractor.averageCost.toFixed(2)}
              </p>
              <p>Response Time: {contractor.responseTime}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold">Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {contractor.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}