import { Helmet } from "react-helmet";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/header";
import MobileSidebar from "@/components/ui/mobile-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { useWebSocket } from '@/hooks/use-websocket'; // Assuming this hook exists

interface Alert {
  id: number;
  symbol: string;
  condition: 'above' | 'below';
  price: number;
  active: boolean;
}

export default function MarketAlerts() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    condition: 'above' as const,
    price: 0
  });

  const { data: alerts = [], refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await fetch('/api/alerts');
      return response.json();
    }
  });

  const createAlertMutation = useMutation({
    mutationFn: async (alert: Omit<Alert, 'id' | 'active'>) => {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Alert created successfully' });
      refetch();
    }
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      await fetch(`/api/alerts/${alertId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast({ title: 'Alert deleted successfully' });
      refetch();
    }
  });

  const { sendMessage } = useWebSocket();

  const handleCreateAlert = () => {
    createAlertMutation.mutate(newAlert);
    // Send alert to WebSocket
    sendMessage('SET_ALERT', {
      symbol: newAlert.symbol,
      condition: newAlert.condition,
      price: newAlert.price
    });
    setNewAlert({ symbol: '', condition: 'above', price: 0 });
  };

  const handleDeleteAlert = (index: number) => {
    deleteAlertMutation.mutate(alerts[index].id);
    // Unsubscribe from alert in WebSocket
    sendMessage('UNSUBSCRIBE_MARKET', { symbol: alerts[index].symbol });
  };

  // Subscribe to market updates when component mounts
  useEffect(() => {
    alerts.forEach(alert => {
      sendMessage('SUBSCRIBE_MARKET', { symbol: alert.symbol });
    });
  }, [alerts, sendMessage]);

  return (
    <>
      <Helmet>
        <title>Market Alerts | ProfitWise AI</title>
      </Helmet>
      <div className="flex h-screen bg-slate-50">
        {!isMobile && <Sidebar />}
        <MobileSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl font-bold mb-6">Market Alerts</h1>
              <p>Configure and manage your market alerts here.</p>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Market Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Symbol (e.g. BTC)"
                        value={newAlert.symbol}
                        onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                      />
                      <Select
                        value={newAlert.condition}
                        onValueChange={(value: 'above' | 'below') =>
                          setNewAlert({ ...newAlert, condition: value })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="above">Above</SelectItem>
                          <SelectItem value="below">Below</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Price"
                        className="w-32"
                        value={newAlert.price}
                        onChange={(e) => setNewAlert({ ...newAlert, price: parseFloat(e.target.value) })}
                      />
                      <Button onClick={handleCreateAlert}>Create Alert</Button>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Active Alerts</h3>
                      {alerts.map((alert, index) => (
                        <div key={index} className="flex items-center justify-between bg-background p-3 rounded-lg mb-2">
                          <div>
                            <span className="font-medium">{alert.symbol}</span>
                            <span className="mx-2">{alert.condition}</span>
                            <span>${alert.price}</span>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteAlert(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}