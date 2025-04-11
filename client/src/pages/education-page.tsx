import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { EducationalContent } from "@shared/schema";
import { Search, Loader2, BookOpen, Bookmark, Play, Filter } from "lucide-react";
import { EducationCard } from "@/components/education/education-card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [durationFilter, setDurationFilter] = useState<string | null>(null);
  
  const { data: educationContent = [], isLoading } = useQuery<EducationalContent[]>({
    queryKey: ["/api/education"],
  });
  
  const filteredContent = educationContent.filter(content => {
    // Filter by search query
    if (searchQuery && 
        !content.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !content.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by tab category
    if (activeTab !== "all" && content.category !== activeTab) {
      return false;
    }
    
    // Filter by difficulty
    if (difficultyFilter && content.difficulty !== difficultyFilter) {
      return false;
    }
    
    // Filter by duration (simplified for demo)
    if (durationFilter) {
      const minutes = parseInt(content.duration);
      if (durationFilter === "short" && minutes > 15) return false;
      if (durationFilter === "medium" && (minutes <= 15 || minutes > 30)) return false;
      if (durationFilter === "long" && minutes <= 30) return false;
    }
    
    return true;
  });
  
  // Get unique categories for tabs
  const categories = Array.from(new Set(educationContent.map(content => content.category)));
  
  // Get featured content (first 3 items or those marked as featured)
  const featuredContent = educationContent.slice(0, 3);
  
  return (
    <>
      <Helmet>
        <title>Education Hub | ProfitWise AI</title>
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
                <h1 className="text-2xl font-bold mb-2">Education Hub</h1>
                <p className="text-slate-500">Learn and improve your investment knowledge</p>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none md:w-60">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search content..." 
                    className="pl-9 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  My Library
                </Button>
              </div>
            </div>
            
            {/* Featured Content */}
            {!searchQuery && activeTab === "all" && !difficultyFilter && !durationFilter && (
              <div className="mb-10">
                <h2 className="text-lg font-bold mb-6">Featured Content</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredContent.map((content) => (
                    <Card key={content.id} className="overflow-hidden flex flex-col h-full">
                      <div className="relative h-48 bg-slate-200">
                        <img 
                          src={content.imageUrl || '/placeholder-image.jpg'} 
                          alt={content.title} 
                          className="w-full h-full object-cover" 
                        />
                        <Badge className="absolute top-2 right-2 bg-primary-600">Featured</Badge>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Button variant="secondary" size="sm" className="rounded-full">
                            <Play className="h-4 w-4 mr-1" />
                            Watch Now
                          </Button>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="text-xs text-primary-600 font-medium mb-2">{content.category}</div>
                        <h3 className="text-lg font-bold mb-2">{content.title}</h3>
                        <p className="text-sm text-slate-500 mb-4 flex-1">{content.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">
                            {content.difficulty} • {content.duration}
                          </span>
                          <Button variant="ghost" size="sm" className="ml-auto">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Select value={difficultyFilter || ""} onValueChange={(value) => setDifficultyFilter(value || null)}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Difficulty" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Difficulties</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={durationFilter || ""} onValueChange={(value) => setDurationFilter(value || null)}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Duration" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Durations</SelectItem>
                    <SelectItem value="short">Short (&lt; 15 min)</SelectItem>
                    <SelectItem value="medium">Medium (15-30 min)</SelectItem>
                    <SelectItem value="long">Long (&gt; 30 min)</SelectItem>
                  </SelectContent>
                </Select>
                
                {(searchQuery || difficultyFilter || durationFilter || activeTab !== "all") && (
                  <Button variant="ghost" onClick={() => {
                    setSearchQuery("");
                    setDifficultyFilter(null);
                    setDurationFilter(null);
                    setActiveTab("all");
                  }}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList>
                <TabsTrigger value="all">All Categories</TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                {isLoading ? (
                  <Card>
                    <CardContent className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                    </CardContent>
                  </Card>
                ) : filteredContent.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <div className="flex justify-center mb-4">
                        <BookOpen className="h-12 w-12 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No content found</h3>
                      <p className="text-slate-500 mb-4">
                        {searchQuery 
                          ? "No educational content matches your search criteria. Try a different query." 
                          : "There is no content available for this category with the selected filters."}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContent.map((content) => (
                      <EducationCard key={content.id} content={content} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Learning Paths */}
            {!searchQuery && activeTab === "all" && !difficultyFilter && !durationFilter && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-6">Learning Paths</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-slate-200 rounded-lg p-6 bg-primary-50">
                      <h3 className="font-bold text-lg mb-2">Beginner Investor Path</h3>
                      <p className="text-slate-600 mb-4">
                        Learn the basics of investing, understanding markets, and building your first portfolio.
                      </p>
                      <div className="flex items-center text-sm text-slate-500 mb-4">
                        <span className="mr-4">5 Modules</span>
                        <span>3 Hours Total</span>
                      </div>
                      <div className="mb-4 bg-slate-200 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full w-1/4"></div>
                      </div>
                      <Button className="w-full">Continue Learning</Button>
                    </div>
                    
                    <div className="border border-slate-200 rounded-lg p-6">
                      <h3 className="font-bold text-lg mb-2">Cryptocurrency Trading Path</h3>
                      <p className="text-slate-600 mb-4">
                        Master cryptocurrency trading strategies, blockchain technology, and market analysis.
                      </p>
                      <div className="flex items-center text-sm text-slate-500 mb-4">
                        <span className="mr-4">8 Modules</span>
                        <span>5.5 Hours Total</span>
                      </div>
                      <div className="mb-4 bg-slate-200 rounded-full h-2">
                        <div className="bg-slate-400 h-2 rounded-full w-0"></div>
                      </div>
                      <Button variant="outline" className="w-full">Start Path</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Upcoming Live Webinars */}
            {!searchQuery && activeTab === "all" && !difficultyFilter && !durationFilter && (
              <div className="mb-8">
                <h2 className="text-lg font-bold mb-6">Upcoming Live Webinars</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <Badge className="mb-4 bg-primary-50 text-primary-700 hover:bg-primary-100">June 15, 2:00 PM EST</Badge>
                      <h3 className="font-bold text-lg mb-2">Navigating Market Volatility</h3>
                      <p className="text-slate-600 mb-4">
                        Learn strategies to protect your portfolio during market turbulence.
                      </p>
                      <Button variant="outline" className="w-full">Register</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <Badge className="mb-4 bg-primary-50 text-primary-700 hover:bg-primary-100">June 22, 1:00 PM EST</Badge>
                      <h3 className="font-bold text-lg mb-2">AI in Investment Analysis</h3>
                      <p className="text-slate-600 mb-4">
                        Discover how AI is transforming investment analysis and decision-making.
                      </p>
                      <Button variant="outline" className="w-full">Register</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <Badge className="mb-4 bg-primary-50 text-primary-700 hover:bg-primary-100">June 30, 3:00 PM EST</Badge>
                      <h3 className="font-bold text-lg mb-2">Sustainable Investing</h3>
                      <p className="text-slate-600 mb-4">
                        Explore ESG investing principles and opportunities in the green economy.
                      </p>
                      <Button variant="outline" className="w-full">Register</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
