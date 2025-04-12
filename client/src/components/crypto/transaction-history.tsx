
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ExternalLink, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Transaction {
  id: string;
  hash: string;
  type: 'send' | 'receive' | 'swap';
  amount: string;
  token: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  to?: string;
  from?: string;
  fee?: string;
  tokenPrice?: string;
  network: string;
}

export function TransactionHistory() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/web3/transactions"],
    refetchInterval: 10000
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'default';
    }
  };

  const formatAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">Loading transactions...</div>
          ) : transactions?.length === 0 ? (
            <div className="text-center py-4">No transactions found</div>
          ) : (
            <div className="space-y-3">
              {transactions?.map((tx) => (
                <div key={tx.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {tx.type === 'send' ? (
                        <ArrowUpRight className="text-red-500" />
                      ) : tx.type === 'receive' ? (
                        <ArrowDownLeft className="text-green-500" />
                      ) : (
                        <ArrowUpRight className="text-blue-500" />
                      )}
                      <div>
                        <div className="font-medium">
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </div>
                        <div className="text-sm text-slate-500">
                          {format(new Date(tx.timestamp), 'MMM d, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {tx.amount} {tx.token}
                      </div>
                      {tx.tokenPrice && (
                        <div className="text-sm text-slate-500">
                          ≈ ${(parseFloat(tx.amount) * parseFloat(tx.tokenPrice)).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">From: </span>
                      {formatAddress(tx.from || '')}
                    </div>
                    <div>
                      <span className="text-slate-500">To: </span>
                      {formatAddress(tx.to || '')}
                    </div>
                    {tx.fee && (
                      <div>
                        <span className="text-slate-500">Network Fee: </span>
                        {tx.fee}
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500">Network: </span>
                      {tx.network}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant={getStatusColor(tx.status)}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </Badge>
                    <a
                      href={`https://etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      View on Explorer
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
