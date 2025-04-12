
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Transaction {
  id: string;
  hash: string;
  type: 'send' | 'receive';
  amount: string;
  token: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  to?: string;
  from?: string;
}

export function TransactionHistory() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/web3/transactions"],
    refetchInterval: 10000
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div>Loading transactions...</div>
          ) : transactions?.length === 0 ? (
            <div>No transactions found</div>
          ) : (
            <div className="space-y-2">
              {transactions?.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={tx.type === 'send' ? 'destructive' : 'default'}>
                        {tx.type === 'send' ? 'Sent' : 'Received'}
                      </Badge>
                      <span className="font-mono text-sm">
                        {tx.amount} {tx.token}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {format(new Date(tx.timestamp), 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono truncate w-24">
                      {tx.type === 'send' ? tx.to : tx.from}
                    </div>
                    <Badge 
                      variant={
                        tx.status === 'completed' ? 'default' :
                        tx.status === 'pending' ? 'secondary' : 'destructive'
                      }
                      className="mt-1"
                    >
                      {tx.status}
                    </Badge>
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
