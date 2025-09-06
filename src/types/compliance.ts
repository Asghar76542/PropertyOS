export interface ComplianceRecord {
  id: string;
  title: string;
  description: string;
  requirement: string;
  status: 'COMPLIANT' | 'PENDING' | 'OVERDUE' | 'EXPIRED';
  dueDate: string;
  propertyId: string;
  property?: {
    address: string;
  };
}

export interface ComplianceStatus {
  overall: number;
  gasSafety: number;
  epc: number;
  electrical: number;
  fireSafety: number;
  hmoLicense: number;
}