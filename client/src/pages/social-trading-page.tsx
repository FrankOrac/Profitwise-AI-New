import { useState } from "react";
import { Helmet } from "react-helmet";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import TraderCard from "@/components/social/trader-card"; // Assuming this component exists
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export default function SocialTradingPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("top-traders");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: traders, isLoading } = useQuery({
    queryKey: ['traders'],
    queryFn: async () => {
      const response = await fetch('/api/social/top-traders');
      return response.json();
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      const response = await fetch("/api/social/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData)
      });
      if (!response.ok) throw new Error("Failed to create post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/social/feed"]);
      toast({
        title: "Success",
        description: "Your trade has been posted",
      });
    }
  });


  return (
    <>
      <Helmet>
        <title>Social Trading | ProfitWise AI</title>
      </Helmet>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex flex-col">
          <Header />

          <main className="bg-slate-50 p-6 flex-1">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">Social Trading</h1>
                <p className="text-slate-500">Follow and learn from successful traders</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Share Trade</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Your Trade</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    createPostMutation.mutate({
                      content: formData.get("content"),
                      symbol: formData.get("symbol"),
                      action: formData.get("action"),
                      position: formData.get("position")
                    });
                  }}>
                    <div className="space-y-4">
                      <div>
                        <Input name="symbol" placeholder="Asset Symbol (e.g., BTC)" required />
                      </div>
                      <div>
                        <Input name="action" placeholder="Action (buy/sell/hold)" required />
                      </div>
                      <div>
                        <Input
                          name="position"
                          type="number"
                          placeholder="Position Size"
                          required
                        />
                      </div>
                      <div>
                        <Textarea
                          name="content"
                          placeholder="Share your analysis..."
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Post Trade
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="top-traders">Top Traders</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="signals">Trading Signals</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-4 my-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search traders..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <TabsContent value="top-traders">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="h-48"></CardContent>
                      </Card>
                    ))
                  ) : traders?.map((trader: any) => (
                    <TraderCard key={trader.id} trader={trader} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="following">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold mb-4">Traders You Follow</h2>
                    {/* Following list will be implemented here */}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="signals">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Trading Signals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Trading signals feed will be implemented here */}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </>
  );
}