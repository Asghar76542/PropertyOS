'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppHeader } from '@/components/layout/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from '@/components/ui/progress'
import { Plus, Search, Download, DollarSign, TrendingUp, BarChart3, AlertTriangle, Receipt, Eye, MoreHorizontal, CreditCard, Home } from "lucide-react"
import { sonner } from 'sonner'

// API fetching function
const fetchFinancialData = async () => {
  const res = await fetch('/api/financial');
  if (!res.ok) {
    throw new Error('Failed to fetch financial data');
  }
  return res.json();
};

export default function FinancialPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'RENT', amount: 0, dueDate: new Date().toISOString().split('T')[0], propertyId: '', tenancyId: '', description: '' });

  // Main data query
  const { data, isLoading, error } = useQuery({
    queryKey: ['financialData'],
    queryFn: fetchFinancialData,
  });

  const { properties = [], rentPayments = [], expenses = [], financialSummary = {} } = data || {};

  // Mutation for creating a transaction
  const createTransactionMutation = useMutation({
    mutationFn: (newTransaction: any) => {
      return fetch('/api/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create transaction');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialData'] });
      setIsDialogOpen(false);
      sonner.success('Transaction recorded successfully.');
    },
    onError: () => {
      sonner.error('Failed to record transaction.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTransactionMutation.mutate(formData);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading financial data.</div>;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Financial Dashboard" description="Track rent payments, expenses, and financial performance" />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Financial Overview</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Record Transaction</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record a Transaction</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit}>
                {/* Form content for new transaction */}
                 <DialogFooter><Button type="submit" disabled={createTransactionMutation.isPending}>Save</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card><CardHeader><CardTitle>Net Income</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">£{financialSummary.netIncome?.toLocaleString()}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Total Income</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">£{financialSummary.collectedRent?.toLocaleString()}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-600">-£{financialSummary.totalExpenses?.toLocaleString()}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Occupancy Rate</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{financialSummary.occupancyRate?.toFixed(0)}%</p></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rent">Rent Tracking</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="rent">
            <Card>
              <CardHeader><CardTitle>Rent Payments</CardTitle></CardHeader>
              <CardContent>
                {/* Table of rentPayments */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader><CardTitle>Expenses</CardTitle></CardHeader>
              <CardContent>
                {/* Table of expenses */}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
