
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, TrendingUp, ArrowUpDown } from "lucide-react";

interface Trade {
  id: number;
  symbol: string;
  type: "buy" | "sell";
  quantity: string;
  price: string;
  date: string;
  pnl: string;
  notes: string;
}

export default function TradeJournal() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isAddingTrade, setIsAddingTrade] = useState(false);
  const [newTrade, setNewTrade] = useState({
    symbol: "",
    type: "buy",
    quantity: "",
    price: "",
    notes: ""
  });

  const addTrade = () => {
    const trade: Trade = {
      id: Date.now(),
      ...newTrade,
      date: new Date().toISOString(),
      pnl: "0.00%"
    };
    setTrades([trade, ...trades]);
    setIsAddingTrade(false);
    setNewTrade({ symbol: "", type: "buy", quantity: "", price: "", notes: "" });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trade Journal</CardTitle>
        <Button onClick={() => setIsAddingTrade(!isAddingTrade)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Trade
        </Button>
      </CardHeader>
      <CardContent>
        {isAddingTrade && (
          <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Symbol"
                value={newTrade.symbol}
                onChange={(e) => setNewTrade({ ...newTrade, symbol: e.target.value })}
              />
              <Select
                value={newTrade.type}
                onValueChange={(value) => setNewTrade({ ...newTrade, type: value as "buy" | "sell" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Quantity"
                value={newTrade.quantity}
                onChange={(e) => setNewTrade({ ...newTrade, quantity: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Price"
                value={newTrade.price}
                onChange={(e) => setNewTrade({ ...newTrade, price: e.target.value })}
              />
            </div>
            <Input
              placeholder="Notes"
              value={newTrade.notes}
              onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddingTrade(false)}>Cancel</Button>
              <Button onClick={addTrade}>Add Trade</Button>
            </div>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>{new Date(trade.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell className={trade.type === "buy" ? "text-success" : "text-error"}>
                    {trade.type.toUpperCase()}
                  </TableCell>
                  <TableCell>{trade.quantity}</TableCell>
                  <TableCell>${trade.price}</TableCell>
                  <TableCell className={parseFloat(trade.pnl) >= 0 ? "text-success" : "text-error"}>
                    {trade.pnl}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{trade.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
