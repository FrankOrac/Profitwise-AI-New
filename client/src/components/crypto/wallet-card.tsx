
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";

interface WalletData {
  address: string;
  balance: string;
  tokenBalances: Array<{
    symbol: string;
    balance: string;
  }>;
}

export function WalletCard() {
  const { data: wallet, isLoading, refetch } = useQuery<WalletData>({
    queryKey: ["/api/web3/wallets"],
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/web3/connect-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ethereum" })
      });
      if (!response.ok) throw new Error("Failed to connect wallet");
      return response.json();
    },
    onSuccess: () => refetch()
  });

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
                    <span>{token.balance}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Button 
          onClick={() => connectMutation.mutate()}
          disabled={connectMutation.isPending}
          className="w-full"
        >
          {connectMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Connect Wallet
        </Button>
      )}
    </Card>
  );
}
