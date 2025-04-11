import { MobileSidebar } from "@/components/ui/mobile-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  ArrowUpRight, 
  Copy, 
  MessageSquare, 
  Search, 
  ThumbsUp, 
  TrendingUp, 
  Users,
  UserPlus,
  Filter
} from "lucide-react";
import { Helmet } from "react-helmet-async";

type Trader = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  followers: number;
  performance: string;
  winRate: string;
  verified: boolean;
  biography: string;
};

type TradePost = {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  action: "buy" | "sell" | "hold";
  asset: {
    name: string;
    symbol: string;
    price: string;
  };
};

export default function SocialTradingPage() {
  // Mock data for top traders
  const topTraders: Trader[] = [
    {
      id: "1",
      name: "Alex Morgan",
      username: "alexm_trader",
      avatar: "",
      followers: 12453,
      performance: "+32.4%",
      winRate: "76%",
      verified: true,
      biography: "Full-time crypto trader with 5 years of experience. Specialized in momentum trading and technical analysis."
    },
    {
      id: "2",
      name: "Sarah Chen",
      username: "cryptosarah",
      avatar: "",
      followers: 8761,
      performance: "+28.7%",
      winRate: "72%",
      verified: true,
      biography: "Professional stock trader and portfolio manager. Focused on long-term growth and value investing strategies."
    },
    {
      id: "3",
      name: "David Johnson",
      username: "dave_trades",
      avatar: "",
      followers: 6542,
      performance: "+21.5%",
      winRate: "68%",
      verified: true,
      biography: "Day trader and market analyst. I share daily insights on market trends and trading opportunities."
    }
  ];
  
  // Mock data for trade posts
  const tradePosts: TradePost[] = [
    {
      id: "1",
      user: {
        name: "Alex Morgan",
        username: "alexm_trader",
        avatar: "",
        verified: true
      },
      content: "Just added more BTC to my portfolio. I believe we're going to see a major breakout above $70k within the next few weeks. The technical indicators are aligning nicely.",
      timestamp: "2 hours ago",
      likes: 245,
      comments: 32,
      action: "buy",
      asset: {
        name: "Bitcoin",
        symbol: "BTC",
        price: "$68,245.18"
      }
    },
    {
      id: "2",
      user: {
        name: "Sarah Chen",
        username: "cryptosarah",
        avatar: "",
        verified: true
      },
      content: "Taking profits on some of my ETH position. The resistance at $3,800 is strong, and I expect a short-term pullback before the next leg up. Will rebuy lower.",
      timestamp: "5 hours ago",
      likes: 187,
      comments: 24,
      action: "sell",
      asset: {
        name: "Ethereum",
        symbol: "ETH",
        price: "$3,782.45"
      }
    },
    {
      id: "3",
      user: {
        name: "David Johnson",
        username: "dave_trades",
        avatar: "",
        verified: true
      },
      content: "I'm holding my SOL position through this volatility. The fundamentals remain strong, and ecosystem growth continues to impress. This is a long-term play.",
      timestamp: "Yesterday",
      likes: 132,
      comments: 18,
      action: "hold",
      asset: {
        name: "Solana",
        symbol: "SOL",
        price: "$142.35"
      }
    }
  ];

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
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="feed">
                <TabsList className="mb-6">
                  <TabsTrigger value="feed">Trading Feed</TabsTrigger>
                  <TabsTrigger value="traders">Top Traders</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                </TabsList>
                
                <TabsContent value="feed">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      {tradePosts.map((post) => (
                        <Card key={post.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary-100 text-primary-700">
                                  {post.user.name.charAt(0)}
                                </AvatarFallback>
                                {post.user.avatar && <AvatarImage src={post.user.avatar} />}
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
                                    <div className="text-sm font-medium">{post.asset.name} ({post.asset.symbol})</div>
                                    <div className="text-lg font-bold">{post.asset.price}</div>
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
                                  <button className="flex items-center gap-1 text-slate-500 hover:text-primary-600">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{post.likes}</span>
                                  </button>
                                  <button className="flex items-center gap-1 text-slate-500 hover:text-primary-600">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>{post.comments}</span>
                                  </button>
                                  <button className="flex items-center gap-1 text-slate-500 hover:text-primary-600">
                                    <Copy className="h-4 w-4" />
                                    <span>Copy Trade</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Top Traders</CardTitle>
                          <CardDescription>Popular traders based on performance</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y">
                            {topTraders.slice(0, 3).map((trader) => (
                              <div key={trader.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback className="bg-primary-100 text-primary-700">
                                      {trader.name.charAt(0)}
                                    </AvatarFallback>
                                    {trader.avatar && <AvatarImage src={trader.avatar} />}
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">{trader.name}</span>
                                      {trader.verified && (
                                        <svg className="h-3 w-3 text-blue-500 fill-current" viewBox="0 0 24 24">
                                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.5 14.5l-4-4 1.5-1.5 2.5 2.5 6-6 1.5 1.5-7.5 7.5z" />
                                        </svg>
                                      )}
                                    </div>
                                    <div className="text-xs text-slate-500">{trader.performance} • {trader.followers.toLocaleString()} followers</div>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline">
                                  <UserPlus className="h-3 w-3 mr-1" />
                                  Follow
                                </Button>
                              </div>
                            ))}
                          </div>
                          <div className="p-4">
                            <Button variant="ghost" className="w-full text-primary-600">
                              View All Traders
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Top Performing Assets</CardTitle>
                          <CardDescription>Assets with highest gains today</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y">
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                                  <span className="font-bold text-amber-600">B</span>
                                </div>
                                <div>
                                  <div className="font-medium">Bitcoin</div>
                                  <div className="text-xs text-slate-500">BTC</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">$68,245.18</div>
                                <div className="text-xs text-green-600">+5.2%</div>
                              </div>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="font-bold text-blue-600">E</span>
                                </div>
                                <div>
                                  <div className="font-medium">Ethereum</div>
                                  <div className="text-xs text-slate-500">ETH</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">$3,782.45</div>
                                <div className="text-xs text-green-600">+3.8%</div>
                              </div>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                  <span className="font-bold text-purple-600">S</span>
                                </div>
                                <div>
                                  <div className="font-medium">Solana</div>
                                  <div className="text-xs text-slate-500">SOL</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">$142.35</div>
                                <div className="text-xs text-green-600">+7.2%</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="traders">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topTraders.map((trader) => (
                      <Card key={trader.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center">
                            <Avatar className="h-16 w-16 mb-4">
                              <AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
                                {trader.name.charAt(0)}
                              </AvatarFallback>
                              {trader.avatar && <AvatarImage src={trader.avatar} />}
                            </Avatar>
                            <div className="text-center mb-2">
                              <div className="flex items-center justify-center gap-1">
                                <h3 className="font-bold text-lg">{trader.name}</h3>
                                {trader.verified && (
                                  <svg className="h-4 w-4 text-blue-500 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.5 14.5l-4-4 1.5-1.5 2.5 2.5 6-6 1.5 1.5-7.5 7.5z" />
                                  </svg>
                                )}
                              </div>
                              <p className="text-slate-500 text-sm">@{trader.username}</p>
                            </div>
                            <p className="text-center text-sm mb-4">{trader.biography}</p>
                            <div className="grid grid-cols-3 w-full gap-2 mb-4">
                              <div className="text-center p-2 bg-slate-50 rounded-md">
                                <div className="text-xs text-slate-500">Performance</div>
                                <div className="font-bold text-green-600">{trader.performance}</div>
                              </div>
                              <div className="text-center p-2 bg-slate-50 rounded-md">
                                <div className="text-xs text-slate-500">Win Rate</div>
                                <div className="font-bold">{trader.winRate}</div>
                              </div>
                              <div className="text-center p-2 bg-slate-50 rounded-md">
                                <div className="text-xs text-slate-500">Followers</div>
                                <div className="font-bold">{trader.followers.toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full">
                              <Button className="flex-1">
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