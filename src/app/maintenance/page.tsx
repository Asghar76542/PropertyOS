'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppHeader } from '@/components/layout/app-header'
import { MaintenanceRequest, Contractor } from '@/types/maintenance'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Wrench, CheckCircle, Clock, DollarSign, Eye, Edit, MoreHorizontal } from "lucide-react"
import { sonner } from 'sonner';

// Helper to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "OPEN": return <Clock className="h-6 w-6 text-orange-600" />;
    case "IN_PROGRESS": return <Wrench className="h-6 w-6 text-blue-600" />;
    case "COMPLETED": return <CheckCircle className="h-6 w-6 text-green-600" />;
    default: return <Clock className="h-6 w-6 text-gray-500" />;
  }
};

// API fetching function
const fetchMaintenanceData = async () => {
  const res = await fetch('/api/maintenance');
  if (!res.ok) {
    throw new Error('Failed to fetch maintenance data');
  }
  return res.json();
};

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: 'all', priority: 'all' });
  const [isNewRequestDialogOpen, setIsNewRequestDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);

  // Main data query
  const { data, isLoading, error } = useQuery({
    queryKey: ['maintenanceData'],
    queryFn: fetchMaintenanceData,
  });

  const [newRequestData, setNewRequestData] = useState({ title: '', description: '', propertyId: '', priority: 'MEDIUM' });

  // Main data query
  const { data, isLoading, error } = useQuery<{
    maintenanceRequests: MaintenanceRequest[],
    contractors: Contractor[],
    properties: { id: string, address: string }[]
  }>({ 
    queryKey: ['maintenanceData'], 
    queryFn: fetchMaintenanceData 
  });

  const { maintenanceRequests = [], contractors = [], properties = [] } = data || {};

  // Mutation for creating a new request
  const createMutation = useMutation({
    mutationFn: (newRequest: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'reporter' | 'property' | 'assignee'>) => {
      return fetch(`/api/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      }).then(res => {
        if (!res.ok) throw new Error('Creation failed');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceData'] });
      setIsNewRequestDialogOpen(false);
      sonner.success('New maintenance request created.');
      setNewRequestData({ title: '', description: '', propertyId: '', priority: 'MEDIUM' });
    },
    onError: () => {
      sonner.error('Failed to create request.');
    }
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newRequestData as any);
  }

  // Mutation for updating a maintenance request (Assign, Complete, etc.)
  const updateMutation = useMutation({
    mutationFn: (updatedRequest: Partial<MaintenanceRequest> & { id: string }) => {
      return fetch(`/api/maintenance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRequest),
      }).then(res => {
        if (!res.ok) throw new Error('Update failed');
        return res.json();
      });
    },
    onMutate: async (updatedRequest) => {
      await queryClient.cancelQueries({ queryKey: ['maintenanceData'] });
      const previousData = queryClient.getQueryData<any>(['maintenanceData']);
      
      queryClient.setQueryData(['maintenanceData'], (oldData: any) => {
        const newRequests = oldData.maintenanceRequests.map((req: MaintenanceRequest) => 
          req.id === updatedRequest.id ? { ...req, ...updatedRequest } : req
        );
        return { ...oldData, maintenanceRequests: newRequests };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['maintenanceData'], context.previousData);
      }
      sonner.error('Failed to update request.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceData'] });
      setIsAssignDialogOpen(false);
    },
  });

  const handleAssignRequest = (contractorId: string) => {
    if (selectedRequest) {
      updateMutation.mutate({ id: selectedRequest.id, assignedTo: contractorId, status: 'IN_PROGRESS' });
    }
  };

  const handleCompleteRequest = (request: MaintenanceRequest) => {
    // Potentially open a dialog to confirm cost, etc.
    updateMutation.mutate({ id: request.id, status: 'COMPLETED' });
  };

  // Filtering logic
  const filteredRequests = maintenanceRequests.filter((request: MaintenanceRequest) => {
      const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filters.status === 'all' || request.status === filters.status;
      const matchesPriority = filters.priority === 'all' || request.priority === filters.priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading maintenance data: {error.message}</div>;

  return (
    <>
      <div className="min-h-screen bg-background">
        <AppHeader title="Maintenance Portal" description="Track and manage property maintenance requests" />

        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Maintenance Dashboard</h2>
            <Dialog open={isNewRequestDialogOpen} onOpenChange={setIsNewRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> New Request</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Maintenance Request</DialogTitle>
                <DialogDescription>Fill out the form to create a new maintenance request.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRequest}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Title</Label>
                    <Input id="title" value={newRequestData.title} onChange={(e) => setNewRequestData({ ...newRequestData, title: e.target.value })} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Textarea id="description" value={newRequestData.description} onChange={(e) => setNewRequestData({ ...newRequestData, description: e.target.value })} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="propertyId" className="text-right">Property</Label>
                    <Select value={newRequestData.propertyId} onValueChange={(value) => setNewRequestData({ ...newRequestData, propertyId: value })}>
                      <SelectTrigger className="col-span-3"><SelectValue placeholder="Select property" /></SelectTrigger>
                      <SelectContent>
                        {properties.map((property: any) => (
                          <SelectItem key={property.id} value={property.id}>{property.address}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="priority" className="text-right">Priority</Label>
                    <Select value={newRequestData.priority} onValueChange={(value) => setNewRequestData({ ...newRequestData, priority: value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' })}>
                      <SelectTrigger className="col-span-3"><SelectValue placeholder="Select priority" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>Submit Request</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
             <Input
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            {/* Add Selects for status and priority filters */}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="requests">Maintenance Requests</TabsTrigger>
              {/* Other tabs here */}
            </TabsList>

            <TabsContent value="requests" className="space-y-4">
              <div className="grid gap-4">
                {filteredRequests.map((request: MaintenanceRequest) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            {getStatusIcon(request.status)}
                            <div>
                                <h3 className="font-semibold text-lg">{request.title}</h3>
                                <p className="text-muted-foreground mb-3">{request.property.address}</p>
                                <Badge>{request.priority}</Badge>
                                <Badge variant="secondary">{request.status}</Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> View</Button>
                          {request.status === 'OPEN' && (
                            <Button size="sm" onClick={() => { setSelectedRequest(request); setIsAssignDialogOpen(true); }}>Assign</Button>
                          )}
                          {request.status === 'IN_PROGRESS' && (
                            <Button size="sm" onClick={() => handleCompleteRequest(request)}>Complete</Button>
                          )}
                          <Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Assign Contractor Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Contractor</DialogTitle>
            <DialogDescription>Select a contractor to assign to this maintenance request.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select onValueChange={handleAssignRequest}>
                <SelectTrigger><SelectValue placeholder="Select a contractor" /></SelectTrigger>
                <SelectContent>
                    {contractors.map((contractor: Contractor) => (
                        <SelectItem key={contractor.id} value={contractor.id}>{contractor.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Request Dialog can be implemented here using another mutation */}
    </>
  );
}
