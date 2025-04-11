import { MobileSidebar } from "@/components/ui/mobile-sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowUpRight, 
  CreditCard, 
  Plus, 
  Wallet as WalletIcon,
  AlertCircle,
  ExternalLink,
  Copy,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet-async";

type Wallet = {
  id: string;
  name: string;
  type: "ethereum" | "bitcoin" | "solana";
  address: string;
  balance: string;
  symbol: string;
  connected: boolean;
};

type Transaction = {
  date: string;
  type: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function WalletsPage() {
  const { toast } = useToast();
  const [showConnectForm, setShowConnectForm] = useState(false);

  // Mock wallet data
  const wallets: Wallet[] = [
    {
      id: "1",
      name: "Main Ethereum Wallet",
      type: "ethereum",
      address: "0x1234...5678",
      balance: "2.45",
      symbol: "ETH",
      connected: true
    },
    {
      id: "2",
      name: "Trading Bitcoin Wallet",
      type: "bitcoin",
      address: "bc1q...7v3h",
      balance: "0.087",
      symbol: "BTC",
      connected: true
    },
    {
      id: "3",
      name: "Solana DeFi Wallet",
      type: "solana",
      address: "CuieV...dRQm",
      balance: "45.2",
      symbol: "SOL",
      connected: false
    }
  ];

  const transactions: Transaction[] = [
    { date: '2024-03-08', type: 'Deposit', amount: '1.5 ETH', status: 'completed' },
    { date: '2024-03-07', type: 'Withdrawal', amount: '0.2 BTC', status: 'pending' },
    { date: '2024-03-06', type: 'Trade', amount: '10 SOL', status: 'completed' },
    { date: '2024-03-05', type: 'Deposit', amount: '50 USDC', status: 'failed' },
  ];


  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const handleConnect = () => {
    // Mock connecting wallet
    toast({
      title: "Wallet Connected",
      description: "Your wallet has been successfully connected",
      variant: "default",
    });
    setShowConnectForm(false);
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
                <Button onClick={() => setShowConnectForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {showConnectForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Connect Web3 Wallet</CardTitle>
                      <CardDescription>
                        Connect your cryptocurrency wallet to track assets and make trades
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="wallet-type">Wallet Type</Label>
                          <select 
                            id="wallet-type" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            defaultValue="metamask"
                          >
                            <option value="metamask">MetaMask</option>
                            <option value="walletconnect">WalletConnect</option>
                            <option value="phantom">Phantom</option>
                            <option value="coinbase">Coinbase Wallet</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="wallet-name">Wallet Name (Optional)</Label>
                          <Input id="wallet-name" placeholder="Main ETH Wallet" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setShowConnectForm(false)}>Cancel</Button>
                      <Button onClick={handleConnect}>Connect Wallet</Button>
                    </CardFooter>
                  </Card>
                )}

                <Tabs defaultValue="connected">
                  <TabsList className="mb-6">
                    <TabsTrigger value="connected">Connected Wallets</TabsTrigger>
                    <TabsTrigger value="assets">Crypto Assets</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="connected">
                    {wallets.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wallets.map((wallet) => (
                          <Card key={wallet.id} className={wallet.connected ? "" : "opacity-70"}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{wallet.name}</CardTitle>
                                  <CardDescription className="flex items-center mt-1">
                                    {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)} Wallet
                                    {!wallet.connected && (
                                      <span className="ml-2 text-amber-600 flex items-center text-xs">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Disconnected
                                      </span>
                                    )}
                                  </CardDescription>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                  <WalletIcon className="h-4 w-4 text-primary-600" />
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-slate-500">Balance</span>
                                <span className="font-bold">{wallet.balance} {wallet.symbol}</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-slate-500">Address</span>
                                <div className="flex items-center">
                                  <span className="text-sm font-mono">{wallet.address}</span>
                                  <button 
                                    onClick={() => handleCopyAddress(wallet.address)}
                                    className="ml-1 text-slate-400 hover:text-slate-700"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                              <Button size="sm" variant="outline">
                                Details
                              </Button>
                              {wallet.connected ? (
                                <Button size="sm">
                                  <ArrowUpRight className="h-4 w-4 mr-1" />
                                  Send
                                </Button>
                              ) : (
                                <Button size="sm">
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Connect
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <WalletIcon className="h-8 w-8 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">No Wallets Connected</h3>
                          <p className="text-slate-500 text-center mb-6 max-w-md">
                            Connect your Web3 wallets to track your cryptocurrency assets and make trades directly from the platform.
                          </p>
                          <Button onClick={() => setShowConnectForm(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Connect Wallet
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="assets">
                    <Card>
                      <CardHeader>
                        <CardTitle>Crypto Assets</CardTitle>
                        <CardDescription>View and manage all your cryptocurrency assets in one place</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-md">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-3 text-sm font-medium text-slate-500">Asset</th>
                                <th className="text-left p-3 text-sm font-medium text-slate-500">Wallet</th>
                                <th className="text-right p-3 text-sm font-medium text-slate-500">Balance</th>
                                <th className="text-right p-3 text-sm font-medium text-slate-500">Value (USD)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-3 flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                                    <CreditCard className="h-4 w-4 text-amber-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Ethereum</div>
                                    <div className="text-xs text-slate-500">ETH</div>
                                  </div>
                                </td>
                                <td className="p-3 text-sm">Main Ethereum Wallet</td>
                                <td className="p-3 text-right">2.45 ETH</td>
                                <td className="p-3 text-right font-medium">$4,987.23</td>
                              </tr>
                              <tr className="border-b">
                                <td className="p-3 flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                                    <CreditCard className="h-4 w-4 text-amber-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Bitcoin</div>
                                    <div className="text-xs text-slate-500">BTC</div>
                                  </div>
                                </td>
                                <td className="p-3 text-sm">Trading Bitcoin Wallet</td>
                                <td className="p-3 text-right">0.087 BTC</td>
                                <td className="p-3 text-right font-medium">$3,654.12</td>
                              </tr>
                              <tr>
                                <td className="p-3 flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                                    <CreditCard className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Solana</div>
                                    <div className="text-xs text-slate-500">SOL</div>
                                  </div>
                                </td>
                                <td className="p-3 text-sm">Solana DeFi Wallet</td>
                                <td className="p-3 text-right">45.2 SOL</td>
                                <td className="p-3 text-right font-medium">$1,898.40</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="transactions">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>View your recent cryptocurrency transactions across all wallets</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-md">
                          <div className="space-y-4">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left p-2">Date</th>
                                    <th className="text-left p-2">Type</th>
                                    <th className="text-left p-2">Amount</th>
                                    <th className="text-left p-2">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {transactions.map((tx, i) => (
                                    <tr key={i} className="border-b">
                                      <td className="p-2">{tx.date}</td>
                                      <td className="p-2">{tx.type}</td>
                                      <td className="p-2">{tx.amount}</td>
                                      <td className="p-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                          tx.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {tx.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="flex justify-end">
                              <Button variant="outline">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View on Block Explorer
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}