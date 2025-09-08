'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/hooks/use-socket'
import { AppHeader } from '@/components/layout/app-header'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertTriangle, Send } from "lucide-react"

// API fetching functions
const fetchTenantDashboardData = async () => {
  const res = await fetch('/api/tenant/dashboard');
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
};

const fetchMessageHistory = async (contactId: string) => {
  const res = await fetch(`/api/messages?contactId=${contactId}`);
  if (!res.ok) throw new Error('Failed to fetch message history');
  return res.json();
};

export default function TenantDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Main dashboard data
  const { data: tenantData, isLoading, error } = useQuery({
    queryKey: ['tenantDashboard'],
    queryFn: fetchTenantDashboardData,
  });

  const landlordId = tenantData?.personalInfo?.landlordId;

  // Message History
  const { data: historyData } = useQuery({
    queryKey: ['messageHistory', landlordId],
    queryFn: () => fetchMessageHistory(landlordId!),
    enabled: !!landlordId, // Only fetch when landlordId is available
  });

  // Real-time messaging hook
  const { messages: realTimeMessages, sendMessage, isConnected } = useSocket(userId!);

  // Combined message state
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (historyData?.messages) {
      setAllMessages(historyData.messages);
    }
  }, [historyData]);

  useEffect(() => {
    if (realTimeMessages.length > 0) {
      setAllMessages((prev) => [...prev, ...realTimeMessages]);
    }
  }, [realTimeMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && userId && landlordId) {
      sendMessage({
        fromId: userId,
        toId: landlordId,
        subject: `Message from ${tenantData?.personalInfo?.name}`,
        body: newMessage,
      });
      setNewMessage("");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading dashboard.</div>;
  if (!tenantData) return <div>No data.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Tenant Portal" description={`Welcome, ${tenantData.personalInfo.name}`} />
      <div className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList> 
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            {/* Other triggers */}
          </TabsList>

          <TabsContent value="overview">
            {/* Overview content as before */}
            <Card><CardHeader><CardTitle>Property Info</CardTitle></CardHeader><CardContent>{tenantData.personalInfo.propertyAddress}</CardContent></Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader><CardTitle>Messages with Landlord</CardTitle></CardHeader>
              <CardContent style={{ height: '500px', overflowY: 'auto' }}>
                {allMessages.map((msg) => (
                  <div key={msg.id} className={`p-2 my-2 rounded-lg ${msg.fromId === userId ? 'bg-blue-100 text-right' : 'bg-gray-100'}`}>
                    <p className="font-bold">{msg.from.name}</p>
                    <p>{msg.body}</p>
                    <p className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                  </div>
                ))}
              </CardContent>
              <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
                <Button type="submit" disabled={!isConnected}><Send className="h-4 w-4" /></Button>
              </form>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
