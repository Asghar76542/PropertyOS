interface User {
  name: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  property: {
    id: string;
    address: string;
  };
  reporter: User;
  assignee: User | null;
  createdAt: string;
  dueDate: string;
  assignedTo: string;
  actualCost: number;
  estimatedCost: number;
  tags: string[];
  images: any[];
  documents: any[];
  category: string;
}

export interface Contractor {
  id: string;
  name: string;
  rating: number;
  category: string;
  phone: string;
  email: string;
  totalJobs: number;
  completedJobs: number;
  averageCost: number;
  responseTime: string;
  specialties: string[];
}

export interface Property {
  id: string;
  address: string;
}