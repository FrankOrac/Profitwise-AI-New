import { MobileSidebar } from "@/components/ui/mobile-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowUpRight, 
  Copy, 
  MessageSquare, 
  Search, 
  ThumbsUp, 
  TrendingUp, 
  Users,
  UserPlus,
  Filter,
  AlertTriangle,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from 'react';

export default function SocialTradingPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");

  const { data: tradePosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["/api/social/feed"],
    refetchInterval: 30000
  });

  const { data: traders } = useQuery({
    queryKey: ["/api/social/traders/performance"],
    refetchInterval: 60000
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

  const copyTradeMutation = useMutation({
    mutationFn: async ({ traderId, postId }) => {
      const response = await fetch("/api/social/copy-trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ traderId, postId })
      });
      if (!response.ok) throw new Error("Failed to copy trade");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Trade copied successfully",
      });
    }
  });

  const filteredPosts = useMemo(() => {
    if (!tradePosts) return [];
    return tradePosts.filter(post => {
      const matchesSearch = 
        post.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = selectedAction === "all" || post.action === selectedAction;
      return matchesSearch && matchesAction;
    });
  }, [tradePosts, searchQuery, selectedAction]);

  return (
    <>
      <Helmet>
        <title>Social Trading | ProfitWise AI</title>
      </Helmet>
      <div className="flex h-screen bg-slate-50">
        <MobileSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Social Trading</h1>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <Input 
                      placeholder="Search traders or assets..." 
                      className="pl-10 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                      <SelectItem value="hold">Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mb-6">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Share Trade
                  </Button>
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
                        <Select name="action" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buy">Buy</SelectItem>
                            <SelectItem value="sell">Sell</SelectItem>
                            <SelectItem value="hold">Hold</SelectItem>
                          </SelectContent>
                        </Select>
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

              <Tabs defaultValue="feed">
                <TabsList className="mb-6">
                  <TabsTrigger value="feed">Trading Feed</TabsTrigger>
                  <TabsTrigger value="traders">Top Traders</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                </TabsList>

                <TabsContent value="feed">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      {isLoadingPosts ? (
                        <div className="text-center py-10">Loading posts...</div>
                      ) : (
                        filteredPosts.map((post) => (
                          <Card key={post.id}>
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <Avatar>
                                  <AvatarFallback>
                                    {post.user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{post.user.name}</span>
                                    {post.user.verified && (
                                      <svg className="h-4 w-4 text-blue-500 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.5 14.5l-4-4 1.5-1.5 2.5 2.5 6-6 1.5 1.5-7.5 7.5z" />
                                      </svg>
                                    )}
                                    <span className="text-slate-500 text-sm">@{post.user.username}</span>
                                    <span className="text-slate-400 text-xs">• {post.timestamp}</span>
                                  </div>
                                  <p className="mt-2">{post.content}</p>
                                  <div className="mt-3 p-3 bg-slate-50 rounded-md flex items-center justify-between">
                                    <div>
                                      <div className="text-sm font-medium">
                                        {post.asset.name} ({post.asset.symbol})
                                      </div>
                                      <div className="text-lg font-bold">
                                        {post.asset.price}
                                        <span className={`ml-2 text-sm ${
                                          post.asset.change > 0 ? "text-green-600" : "text-red-600"
                                        }`}>
                                          {post.asset.change > 0 ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />}
                                          {Math.abs(post.asset.change)}%
                                        </span>
                                      </div>
                                    </div>
                                    <Badge
                                      className={
                                        post.action === "buy" 
                                          ? "bg-green-100 text-green-700 hover:bg-green-100" 
                                          : post.action === "sell" 
                                            ? "bg-red-100 text-red-700 hover:bg-red-100" 
                                            : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                      }
                                    >
                                      {post.action.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <div className="mt-4 flex items-center gap-4">
                                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-primary-600">
                                      <ThumbsUp className="h-4 w-4 mr-1" />
                                      <span>{post.likes}</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-primary-600">
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      <span>{post.comments}</span>
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="text-slate-500 hover:text-primary-600"
                                      onClick={() => copyTradeMutation.mutate({
                                        traderId: post.userId,
                                        postId: post.id
                                      })}
                                    >
                                      <Copy className="h-4 w-4 mr-1" />
                                      Copy Trade
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>

                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Top Traders</CardTitle>
                          <CardDescription>Popular traders based on performance</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y">
                            {traders?.map((trader) => (
                              <div key={trader.id} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarFallback>{trader.username.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium">{trader.name}</span>
                                        {trader.verified && (
                                          <svg className="h-4 w-4 text-blue-500 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.5 14.5l-4-4 1.5-1.5 2.5 2.5 6-6 1.5 1.5-7.5 7.5z" />
                                          </svg>
                                        )}
                                      </div>
                                      <div className="text-sm text-slate-500">
                                        Win Rate: {trader.winRate}%
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-green-600">
                                      +{trader.performance}%
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {trader.totalTrades} trades
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="flex-1">
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Follow
                                  </Button>
                                  <Button variant="outline" size="sm" className="flex-1">
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    Copy Trades
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Trading Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Success Rate</span>
                              <span className="font-medium text-green-600">72%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Avg. Return</span>
                              <span className="font-medium text-green-600">+18.5%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Total Trades</span>
                              <span className="font-medium">142</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Following</span>
                              <span className="font-medium">23</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="traders">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {traders?.map((trader, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center">
                            <Avatar className="h-16 w-16 mb-4">
                              <AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
                                {trader?.name?.charAt(0) || '?'}
                              </AvatarFallback>
                              {trader?.avatar && <AvatarImage src={trader.avatar} />}
                            </Avatar>
                            <div className="text-center mb-2">
                              <div className="flex items-center justify-center gap-1">
                                <h3 className="font-bold text-lg">{trader?.name || 'Unknown Trader'}</h3>
                                {trader.verified && (
                                  <svg className="h-4 w-4 text-blue-500 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.5 14.5l-4-4 1.5-1.5 2.5 2.5 6-6 1.5 1.5-7.5 7.5z" />
                                  </svg>
                                )}
                              </div>
                              <p className="text-slate-500 text-sm">@{trader?.username || 'Unknown'}</p>
                            </div>
                            <p className="text-center text-sm mb-4">{trader?.biography || 'No biography provided'}</p>
                            <div className="grid grid-cols-3 w-full gap-2 mb-4">
                              <div className="text-center p-2 bg-slate-50 rounded-md">
                                <div className="text-xs text-slate-500">Performance</div>
                                <div className="font-bold text-green-600">{trader?.performance || 0}</div>
                              </div>
                              <div className="text-center p-2 bg-slate-50 rounded-md">
                                <div className="text-xs text-slate-500">Win Rate</div>
                                <div className="font-bold">{trader?.winRate || 0}</div>
                              </div>
                              <div className="text-center p-2 bg-slate-50 rounded-md">
                                <div className="text-xs text-slate-500">Followers</div>
                                <div className="font-bold">{trader?.followers?.toLocaleString() || 0}</div>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full">
                              <Button className="flex-1" onClick={() => {
                                // Update follow status -  This needs a proper implementation with API call.
                                // trader.followers += 1; 
                                // Show success message -  This should also be handled via react-query.
                                // toast({
                                //   title: "Success",
                                //   description: `You are now following ${trader.name}`,
                                // });
                              }}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Follow
                              </Button>
                              <Button variant="outline" className="flex-1">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Copy Trades
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="following">
                  <Card>
                    <CardContent className="p-6 flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Not Following Anyone Yet</h3>
                      <p className="text-slate-500 text-center mb-6 max-w-md">
                        Follow top traders to see their trading activity, copy their trades, and learn from their strategies.
                      </p>
                      <Button>
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Discover Traders
                      </Button>
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