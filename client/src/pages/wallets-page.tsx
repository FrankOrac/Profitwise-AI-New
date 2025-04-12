import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { MobileSidebar } from "@/components/ui/mobile-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
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

export default function WalletsPage() {
  const { toast } = useToast();
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const { data: wallets, isLoading: walletsLoading, refetch: refetchWallets } = useQuery({
    queryKey: ["/api/web3/wallets"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ["/api/web3/transactions"],
    refetchInterval: 10000 // Refresh every 10 seconds
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
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive"
      });
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
    onSuccess: (data) => {
      toast({
        title: "Transaction Sent",
        description: `Transaction hash: ${data.hash.slice(0, 10)}...`
      });
      setSendAmount("");
      setRecipientAddress("");
    },
    onError: (error: Error) => {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSend = (walletId: string) => {
    if (!sendAmount || !recipientAddress) {
      toast({
        title: "Invalid Input",
        description: "Please enter amount and recipient address",
        variant: "destructive"
      });
      return;
    }

    sendTransaction.mutate({
      walletId,
      to: recipientAddress,
      value: sendAmount
    });
  };

  return (
    <>
      <Helmet>
        <title>Web3 Wallets | ProfitWise AI</title>
      </Helmet>
      <div className="flex h-screen bg-slate-50">
        <MobileSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Web3 Wallets</h1>
                <Button 
                  onClick={() => setShowConnectForm(true)}
                  disabled={connectWallet.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {connectWallet.isPending ? "Connecting..." : "Connect Wallet"}
                </Button>
              </div>

              <Tabs defaultValue="wallets">
                <TabsList>
                  <TabsTrigger value="wallets">Wallets</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
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
                      <Card key={wallet.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{wallet?.name || `${wallet?.type || 'Unknown'} Wallet`}</CardTitle>
                              <CardDescription className="flex items-center mt-1">
                                {wallet?.type ? `${wallet.type.charAt(0).toUpperCase()}${wallet.type.slice(1)} Wallet` : 'Unknown Wallet'}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => refetchWallets()}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500">Balance</span>
                              <span className="font-bold">{wallet?.balance || '0'} {wallet?.type?.toUpperCase() || 'UNKNOWN'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500">Address</span>
                              <div className="flex items-center">
                                <span className="text-sm font-mono">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(wallet.address);
                                    toast({ title: "Address copied" });
                                  }}
                                  className="ml-1 text-slate-400 hover:text-slate-700"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" onClick={() => setSelectedWallet(wallet.id)}>
                                <ArrowUpRight className="h-4 w-4 mr-2" />
                                Send
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send {wallet?.type?.toUpperCase() || 'UNKNOWN'}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Recipient Address</Label>
                                  <Input
                                    value={recipientAddress}
                                    onChange={(e) => setRecipientAddress(e.target.value)}
                                    placeholder="0x..."
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Amount</Label>
                                  <Input
                                    type="number"
                                    value={sendAmount}
                                    onChange={(e) => setSendAmount(e.target.value)}
                                    placeholder="0.0"
                                  />
                                </div>
                                <Button
                                  className="w-full"
                                  onClick={() => handleSend(wallet.id)}
                                  disabled={sendTransaction.isPending}
                                >
                                  {sendTransaction.isPending ? "Sending..." : "Send"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" asChild>
                            <a
                              href={`https://etherscan.io/address/${wallet.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Explorer
                            </a>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                    </div>
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
                                <tr key={tx.hash} className="border-b">
                                  <td className="p-2">{tx?.type || '-'}</td>
                                  <td className="p-2">{tx?.value || '-'}</td>
                                  <td className="p-2 font-mono">
                                    {tx?.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : '-'}
                                  </td>
                                  <td className="p-2">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        tx.status === 'completed'
                                          ? 'bg-green-100 text-green-800'
                                          : tx.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {tx.status}
                                    </span>
                                  </td>
                                  <td className="p-2">
                                    {new Date(tx.createdAt).toLocaleDateString()}
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
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}