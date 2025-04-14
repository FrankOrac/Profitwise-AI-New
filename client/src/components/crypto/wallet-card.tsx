import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw, Send, ArrowDownUp, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TokenBalance {
  symbol: string;
  balance: string;
  usdValue?: string;
}

interface WalletData {
  address: string;
  balance: string;
  tokenBalances: TokenBalance[];
  type: string;
}

export function WalletCard() {
  const { toast } = useToast();
  const [showSendForm, setShowSendForm] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("ETH");
  const availableTokens = [
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "USDC", name: "USD Coin" },
    { symbol: "WBTC", name: "Wrapped Bitcoin" },
    { symbol: "DAI", name: "Dai Stablecoin" }
  ];

  const { data: wallet, isLoading, refetch } = useQuery<WalletData>({
    queryKey: ["/api/web3/wallets"],
    refetchInterval: 30000
  });

  const sendTransaction = useMutation({
    mutationFn: async (data: { to: string; value: string; token: string }) => {
      const response = await fetch("/api/web3/transactions/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to send transaction");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Transaction sent successfully" });
      setShowSendForm(false);
      setRecipientAddress("");
      setAmount("");
      refetch();
    },
    onError: () => {
      toast({ title: "Failed to send transaction", variant: "destructive" });
    }
  });

  const handleSend = () => {
    if (!recipientAddress || !amount) return;
    sendTransaction.mutate({
      to: recipientAddress,
      value: amount,
      token: selectedToken
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-semibold text-lg">Crypto Wallet</h3>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => refetch()}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {wallet ? (
        <>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-500">Address</div>
              <div className="font-mono text-sm truncate">{wallet.address}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Balance</div>
              <div className="text-lg font-semibold">{wallet.balance} ETH</div>
            </div>
            {wallet.tokenBalances?.length > 0 && (
              <div>
                <div className="text-sm text-slate-500 mb-2">Tokens</div>
                <div className="space-y-2">
                  {wallet.tokenBalances.map((token) => (
                    <div key={token.symbol} className="flex justify-between">
                      <span>{token.symbol}</span>
                      <div className="text-right">
                        <div>{token.balance}</div>
                        {token.usdValue && (
                          <div className="text-sm text-slate-500">${token.usdValue}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <div className="mb-4">
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {availableTokens.map(token => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center">
                        <span className="mr-2">{token.symbol}</span>
                        <span className="text-slate-500 text-sm">{token.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showSendForm} onOpenChange={setShowSendForm}>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send {selectedToken}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-4">
                  <div>
                    <label className="text-sm text-slate-500">Recipient Address</label>
                    <Input
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="0x..."
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Amount</label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleSend}
                    disabled={sendTransaction.isPending}
                  >
                    {sendTransaction.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Send {selectedToken}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="flex-1">
              <ArrowDownUp className="h-4 w-4 mr-2" />
              Swap
            </Button>
            <Button variant="outline" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Buy
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Connect your wallet to start managing your crypto assets.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button 
                onClick={() => connectMutation.mutate({ type: 'metamask' })}
                disabled={connectMutation.isPending}
                className="w-full"
              >
                {connectMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <img src="/metamask.svg" alt="MetaMask" className="h-4 w-4 mr-2" />
                    MetaMask
                  </>
                )}
              </Button>
              <Button 
                onClick={() => connectMutation.mutate({ type: 'walletconnect' })}
                disabled={connectMutation.isPending}
                variant="outline"
                className="w-full"
              >
                <img src="/walletconnect.svg" alt="WalletConnect" className="h-4 w-4 mr-2" />
                WalletConnect
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}