
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Bell, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Alert {
  id: number;
  symbol: string;
  condition: "above" | "below";
  price: string;
  active: boolean;
}

export function MarketAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [newAlert, setNewAlert] = useState({
    symbol: "",
    condition: "above" as const,
    price: "",
  });

  const addAlert = () => {
    const alert: Alert = {
      id: Date.now(),
      ...newAlert,
      active: true
    };
    setAlerts([...alerts, alert]);
    setNewAlert({ symbol: "", condition: "above", price: "" });
  };

  const toggleAlert = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, active: !alert.active } : alert
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Market Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Symbol"
              value={newAlert.symbol}
              onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
            />
            <Select
              value={newAlert.condition}
              onValueChange={(value) => setNewAlert({ ...newAlert, condition: value as "above" | "below" })}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Above</SelectItem>
                <SelectItem value="below">Below</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Price"
              value={newAlert.price}
              onChange={(e) => setNewAlert({ ...newAlert, price: e.target.value })}
            />
            <Button onClick={addAlert}>Add Alert</Button>
          </div>

          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  alert.active ? "bg-slate-50" : "bg-slate-100"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="font-medium">{alert.symbol}</span>
                  {alert.condition === "above" ? (
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-error" />
                  )}
                  <span>${alert.price}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={alert.active ? "success" : "secondary"}>
                    {alert.active ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAlert(alert.id)}
                  >
                    {alert.active ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MarketAlerts;
