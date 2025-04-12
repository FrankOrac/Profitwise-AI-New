import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { MobileSidebar } from "@/components/ui/mobile-sidebar";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/header";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ArrowUpRight,
  CreditCard,
  Plus,
  Wallet as WalletIcon,
  AlertCircle,
  ExternalLink,
  Copy,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WalletCard } from "@/components/crypto/wallet-card";
import { PriceChart } from "@/components/crypto/price-chart";
import { TokenSwap } from "@/components/crypto/token-swap";

const WalletsPage = () => {
  const defaultWallets = [
    { 
      name: 'Main Wallet',
      address: '0x...',
      balance: '0.00',
      type: 'ETH',
      id: 1 // Added ID for key
    }
  ];
  const { toast } = useToast();
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const isMobile = useIsMobile();

  const { data: wallets = defaultWallets, isLoading: walletsLoading, refetch: refetchWallets } = useQuery({
    queryKey: ["/api/web3/wallets"],
    refetchInterval: 30000
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["/api/web3/transactions"],
    refetchInterval: 10000
  });

  const connectWallet = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/web3/connect-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to connect wallet");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected"
      });
      refetchWallets();
      setShowConnectForm(false);
    }
  });

  const sendTransaction = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/web3/transactions/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to send transaction");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Transaction Sent",
        description: "Transaction has been sent successfully"
      });
      setSendAmount("");
      setRecipientAddress("");
    }
  });

  return (
    <>
      <Helmet>
        <title>Web3 Wallets | ProfitWise AI</title>
      </Helmet>
      <div className="flex h-screen bg-slate-50">
        {isMobile ? <MobileSidebar /> : <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <PriceChart symbol="ETH" />
            <TokenSwap />
          </div>
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Web3 Wallets</h1>
                <Button onClick={() => setShowConnectForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>

              <Tabs defaultValue="wallets">
                <TabsList>
                  <TabsTrigger value="wallets">Wallets</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  {/* Added placeholder for educational content tab */}
                  <TabsTrigger value="education">Educational Content</TabsTrigger>
                </TabsList>

                <TabsContent value="wallets">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {walletsLoading ? (
                      <Card>
                        <CardContent className="p-6">
                          <div>Loading wallets...</div>
                        </CardContent>
                      </Card>
                    ) : !wallets?.length ? (
                      <Card>
                        <CardContent className="p-6">
                          <div>No wallets connected. Click "Connect Wallet" to get started.</div>
                        </CardContent>
                      </Card>
                    ) : wallets?.map((wallet: any) => (
                      <WalletCard key={wallet.id} wallet={wallet} refetchWallets={refetchWallets} sendTransaction={sendTransaction} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="transactions">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Type</th>
                                <th className="text-left p-2">Amount</th>
                                <th className="text-left p-2">To</th>
                                <th className="text-left p-2">Status</th>
                                <th className="text-left p-2">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {transactions?.map((tx: any) => (
                                <tr key={tx.id} className="border-b">
                                  <td className="p-2">{tx?.type || '-'}</td>
                                  <td className="p-2">{tx?.value || '-'}</td>
                                  <td className="p-2 font-mono">
                                    {tx?.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : '-'}
                                  </td>
                                  <td className="p-2">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        tx?.status === 'completed'
                                          ? 'bg-green-100 text-green-800'
                                          : tx?.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {tx?.status || 'unknown'}
                                    </span>
                                  </td>
                                  <td className="p-2">
                                    {tx?.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transactions">
                  <TransactionHistory />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
export default WalletsPage;