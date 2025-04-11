import { useState } from "react";
import { Helmet } from "react-helmet";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AiInsight } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowUpRight, 
  AlertTriangle, 
  Lightbulb, 
  Loader2, 
  Search,
  RefreshCw,
  Clock,
  TrendingUp,
  ArrowDownRight
} from "lucide-react";

export default function AiInsightsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: insights = [], isLoading } = useQuery<AiInsight[]>({
    queryKey: ["/api/insights"],
  });
  
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/insights/generate");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
      toast({
        title: "New insight generated",
        description: "An AI-powered insight has been added to your dashboard.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate insight",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleGenerateInsight = () => {
    generateMutation.mutate();
  };
  
  const filteredInsights = insights.filter(insight => {
    // Filter by search query
    if (searchQuery && 
        !insight.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !insight.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by tab category
    if (activeTab !== "all" && insight.type !== activeTab) {
      return false;
    }
    
    return true;
  });
  
  const getInsightIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <ArrowUpRight className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "info":
        return <Lightbulb className="h-5 w-5 text-primary-700" />;
      default:
        return <Lightbulb className="h-5 w-5 text-primary-700" />;
    }
  };
  
  const getInsightColor = (type: string) => {
    switch (type) {
      case "buy":
        return "border-success/20 bg-success/5";
      case "warning":
        return "border-warning/20 bg-warning/5";
      case "info":
        return "border-primary-200 bg-primary-50";
      default:
        return "border-slate-200 bg-slate-50";
    }
  };
  
  const getIconBackground = (type: string) => {
    switch (type) {
      case "buy":
        return "bg-success/20";
      case "warning":
        return "bg-warning/20";
      case "info":
        return "bg-primary-100";
      default:
        return "bg-slate-100";
    }
  };
  
  const getTitleColor = (type: string) => {
    switch (type) {
      case "buy":
        return "text-success";
      case "warning":
        return "text-warning";
      case "info":
        return "text-primary-700";
      default:
        return "text-slate-700";
    }
  };
  
  return (
    <>
      <Helmet>
        <title>AI Insights | ProfitWise AI</title>
      </Helmet>
      
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        <div className="flex flex-col">
          <Header />
          
          <main className="bg-slate-50 p-6 flex-1 overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">AI Investment Insights</h1>
                <p className="text-slate-500">AI-powered analysis and recommendations based on market data</p>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none md:w-60">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search insights..." 
                    className="pl-9 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={handleGenerateInsight} disabled={generateMutation.isPending}>
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate New Insight
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList>
                <TabsTrigger value="all">All Insights</TabsTrigger>
                <TabsTrigger value="buy">Buy Signals</TabsTrigger>
                <TabsTrigger value="warning">Warnings</TabsTrigger>
                <TabsTrigger value="info">Information</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                {isLoading ? (
                  <Card>
                    <CardContent className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                    </CardContent>
                  </Card>
                ) : filteredInsights.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <div className="flex justify-center mb-4">
                        <Lightbulb className="h-12 w-12 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No insights found</h3>
                      <p className="text-slate-500 mb-4">
                        {searchQuery 
                          ? "No insights match your search criteria. Try a different query." 
                          : "There are no insights available for this category."}
                      </p>
                      <Button onClick={handleGenerateInsight} disabled={generateMutation.isPending}>
                        Generate New Insight
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredInsights.map((insight) => (
                      <Card key={insight.id}>
                        <CardContent className={`p-6 border-l-4 ${
                          insight.type === "buy" 
                            ? "border-l-success" 
                            : insight.type === "warning" 
                              ? "border-l-warning" 
                              : "border-l-primary-600"
                        }`}>
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getIconBackground(insight.type)} flex items-center justify-center`}>
                              {getInsightIcon(insight.type)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className={`font-medium text-lg ${getTitleColor(insight.type)}`}>
                                  {insight.title}
                                </h3>
                                <Badge className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-primary-50 text-primary-700 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  New
                                </Badge>
                              </div>
                              <p className="text-slate-600 mt-2 mb-4">
                                {insight.content}
                              </p>
                              
                              <div className="flex flex-wrap gap-2">
                                {insight.type === "buy" && (
                                  <>
                                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                      Strong Buy
                                    </Badge>
                                    <Badge variant="outline" className="bg-slate-100 border-slate-200">
                                      Confidence: High
                                    </Badge>
                                  </>
                                )}
                                {insight.type === "warning" && (
                                  <>
                                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Warning
                                    </Badge>
                                    <Badge variant="outline" className="bg-slate-100 border-slate-200">
                                      Risk: Moderate
                                    </Badge>
                                  </>
                                )}
                                {insight.type === "info" && (
                                  <>
                                    <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                                      <Lightbulb className="h-3 w-3 mr-1" />
                                      Information
                                    </Badge>
                                    <Badge variant="outline" className="bg-slate-100 border-slate-200">
                                      Opportunity
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" className="text-primary-600">
                              View Full Analysis
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* AI Trends Section */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">Market Trends & Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary-700" />
                      </div>
                      <div>
                        <h3 className="font-medium text-primary-700">Tech Sector Momentum</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          Technology sector showing strong momentum, particularly in AI and semiconductor companies.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                        <ArrowDownRight className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <h3 className="font-medium text-warning">Consumer Discretionary Caution</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          Potential slowdown in consumer spending affecting retail and luxury goods.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                        <ArrowUpRight className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <h3 className="font-medium text-success">Energy Sector Recovery</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          Energy stocks rebounding with higher oil prices and renewable energy investments.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* AI-Powered Investment Tools */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4">AI-Powered Investment Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                      <Lightbulb className="h-5 w-5 text-primary-700" />
                    </div>
                    <h3 className="font-medium mb-2">Portfolio Optimizer</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      AI-driven analysis to optimize your portfolio allocation for maximum returns.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">Launch Tool</Button>
                  </div>
                  
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                      <TrendingUp className="h-5 w-5 text-primary-700" />
                    </div>
                    <h3 className="font-medium mb-2">Stock Screener</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Identify investment opportunities based on custom criteria and AI insights.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">Launch Tool</Button>
                  </div>
                  
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                      <AlertTriangle className="h-5 w-5 text-primary-700" />
                    </div>
                    <h3 className="font-medium mb-2">Risk Analyzer</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Evaluate the risk profile of your investments and receive mitigation strategies.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">Launch Tool</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </>
  );
}
