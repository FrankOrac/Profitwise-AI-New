
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function APISettings() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState({
    stripePublishable: "",
    stripeSecret: "",
    openaiKey: "",
    alpacaKey: "",
    alpacaSecret: "",
    coinbaseKey: "",
    coinbaseSecret: "",
    etherscanKey: "",
  });

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiKeys)
      });
      
      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "API keys have been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API keys.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Stripe Publishable Key</Label>
            <Input
              type="password"
              value={apiKeys.stripePublishable}
              onChange={(e) => setApiKeys({...apiKeys, stripePublishable: e.target.value})}
            />
          </div>
          <div>
            <Label>Stripe Secret Key</Label>
            <Input
              type="password"
              value={apiKeys.stripeSecret}
              onChange={(e) => setApiKeys({...apiKeys, stripeSecret: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI & Market Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>OpenAI API Key</Label>
            <Input
              type="password"
              value={apiKeys.openaiKey}
              onChange={(e) => setApiKeys({...apiKeys, openaiKey: e.target.value})}
            />
          </div>
          <div>
            <Label>Alpaca API Key</Label>
            <Input
              type="password"
              value={apiKeys.alpacaKey}
              onChange={(e) => setApiKeys({...apiKeys, alpacaKey: e.target.value})}
            />
          </div>
          <div>
            <Label>Alpaca Secret Key</Label>
            <Input
              type="password"
              value={apiKeys.alpacaSecret}
              onChange={(e) => setApiKeys({...apiKeys, alpacaSecret: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crypto Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Coinbase API Key</Label>
            <Input
              type="password"
              value={apiKeys.coinbaseKey}
              onChange={(e) => setApiKeys({...apiKeys, coinbaseKey: e.target.value})}
            />
          </div>
          <div>
            <Label>Coinbase Secret Key</Label>
            <Input
              type="password"
              value={apiKeys.coinbaseSecret}
              onChange={(e) => setApiKeys({...apiKeys, coinbaseSecret: e.target.value})}
            />
          </div>
          <div>
            <Label>Etherscan API Key</Label>
            <Input
              type="password"
              value={apiKeys.etherscanKey}
              onChange={(e) => setApiKeys({...apiKeys, etherscanKey: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save API Settings</Button>
      </div>
    </div>
  );
}
