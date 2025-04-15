import { Helmet } from 'react-helmet';
import { useState } from 'react';
import { Search, Filter, Play, BookOpen, Clock, Star, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { MobileSidebar } from '@/components/ui/mobile-sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, BarChart, CreditCard, Medal, Film } from "lucide-react";


type Tutorial = {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  imageUrl: string | null;
  videoUrl: string | null;
  instructor: string;
  rating: number;
  progress?: number;
};

export default function TutorialsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const tutorials: Tutorial[] = [
    {
      id: 1,
      title: "Getting Started with Cryptocurrency Trading",
      description: "Learn the fundamentals of cryptocurrency markets and how to execute your first trades safely and efficiently.",
      category: "Cryptocurrency",
      difficulty: "Beginner",
      duration: "45 mins",
      imageUrl: null,
      videoUrl: null,
      instructor: "Alex Morgan",
      rating: 4.8,
      progress: 0
    },
    {
      id: 2,
      title: "Technical Analysis Fundamentals",
      description: "Master the key chart patterns and indicators used in technical analysis to identify trading opportunities.",
      category: "Technical Analysis",
      difficulty: "Intermediate",
      duration: "1 hour 20 mins",
      imageUrl: null,
      videoUrl: null,
      instructor: "Sarah Chen",
      rating: 4.9,
      progress: 0
    },
    {
      id: 3,
      title: "Understanding DeFi Protocols",
      description: "Explore the world of decentralized finance, including lending, borrowing, and yield farming strategies.",
      category: "DeFi",
      difficulty: "Advanced",
      duration: "2 hours",
      imageUrl: null,
      videoUrl: null,
      instructor: "David Johnson",
      rating: 4.7,
      progress: 0
    },
    {
      id: 4,
      title: "Risk Management Strategies for Traders",
      description: "Learn essential risk management techniques to protect your capital and maximize your returns over time.",
      category: "Risk Management",
      difficulty: "Intermediate",
      duration: "55 mins",
      imageUrl: null,
      videoUrl: null,
      instructor: "Jennifer Wu",
      rating: 4.6,
      progress: 0
    },
    {
      id: 5,
      title: "NFT Investing Masterclass",
      description: "Discover how to identify promising NFT projects and build a diversified digital art portfolio.",
      category: "NFTs",
      difficulty: "Beginner",
      duration: "1 hour 10 mins",
      imageUrl: null,
      videoUrl: null,
      instructor: "Michael Thompson",
      rating: 4.5,
      progress: 0
    },
    {
      id: 6,
      title: "Algorithmic Trading Basics",
      description: "An introduction to creating and implementing automated trading strategies using Python.",
      category: "Algorithmic Trading",
      difficulty: "Advanced",
      duration: "2 hours 30 mins",
      imageUrl: null,
      videoUrl: null,
      instructor: "Emma Rodriguez",
      rating: 4.9,
      progress: 0
    }
  ];

  const filteredTutorials = tutorials.filter(tutorial => 
    (!searchQuery || tutorial.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!selectedCategory || tutorial.category === selectedCategory)
  );

  const featuredTutorial: Tutorial = {
    id: 2, //changed to a tutorial with image capability
    title: "Technical Analysis Fundamentals",
    description: "Learn the fundamentals of technical analysis and chart patterns",
    category: "Technical Analysis",
    difficulty: "Beginner",
    duration: "45 min",
    imageUrl: "/tutorials/technical-analysis.jpg", // needs to be an actual image file
    videoUrl: "https://example.com/video",
    instructor: "Sarah Johnson",
    rating: 4.8,
    progress: 30
  };

  return (
    <>
      <Helmet>
        <title>Tutorials | ProfitWise AI</title>
      </Helmet>
      <div className="flex h-screen bg-slate-50">
        <MobileSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tutorials & Courses</h1>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <Input 
                      placeholder="Search tutorials..." 
                      className="pl-10 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setSelectedCategory(null)}>
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Card className="mb-8">
                <div className="grid md:grid-cols-2">
                  <div className="p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{featuredTutorial.category}</Badge>
                      <span className="text-sm text-slate-500">{featuredTutorial.difficulty}</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{featuredTutorial.title}</h2>
                    <p className="text-slate-600 mb-4">{featuredTutorial.description}</p>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{featuredTutorial.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-slate-600">{featuredTutorial.rating}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{featuredTutorial.progress}%</span>
                      </div>
                      <Progress value={featuredTutorial.progress} />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                  {featuredTutorial.imageUrl && (
                    <div className="relative h-64 md:h-auto">
                      <img 
                        src={featuredTutorial.imageUrl} 
                        alt={featuredTutorial.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </Card>

              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Popular Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[{ name: "Cryptocurrency", icon: <Wallet className="h-4 w-4" /> },
                  { name: "Technical Analysis", icon: <BarChart className="h-4 w-4" /> },
                  { name: "DeFi", icon: <CreditCard className="h-4 w-4" /> },
                  { name: "Risk Management", icon: <Medal className="h-4 w-4" /> },
                  { name: "NFTs", icon: <BookOpen className="h-4 w-4" /> },
                  { name: "Algorithmic Trading", icon: <Film className="h-4 w-4" /> }].map((category) => (
                    <Button key={category.name} variant="ghost" className="w-full" onClick={() => setSelectedCategory(category.name)}>
                      <div className="flex items-center justify-center gap-2">
                        {category.icon}
                        {category.name}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>


              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Tutorials</TabsTrigger>
                  <TabsTrigger value="beginner">Beginner</TabsTrigger>
                  <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTutorials.map((tutorial) => (
                      <TutorialCard key={tutorial.id} tutorial={tutorial} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="beginner" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTutorials.filter(tutorial => tutorial.difficulty === "Beginner").map((tutorial) => (
                      <TutorialCard key={tutorial.id} tutorial={tutorial} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="intermediate" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTutorials.filter(tutorial => tutorial.difficulty === "Intermediate").map((tutorial) => (
                      <TutorialCard key={tutorial.id} tutorial={tutorial} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="advanced" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTutorials.filter(tutorial => tutorial.difficulty === "Advanced").map((tutorial) => (
                      <TutorialCard key={tutorial.id} tutorial={tutorial} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

function Badge({ variant, children }: { variant?: string; children: React.ReactNode }) {
  return (
    <span className={`text-xs font-medium py-1 px-2 rounded-full ${variant === 'secondary' ? 'bg-primary-100 text-primary-700' : 'bg-primary-200 text-primary-800'}`}>
      {children}
    </span>
  );
}

function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  return (
    <Card>
      <div className="aspect-video bg-slate-100 flex items-center justify-center">
        {tutorial.category === "Cryptocurrency" && (
          <Wallet className="h-10 w-10 text-primary-300" />
        )}
        {tutorial.category === "Technical Analysis" && (
          <BarChart className="h-10 w-10 text-primary-300" />
        )}
        {tutorial.category === "DeFi" && (
          <CreditCard className="h-10 w-10 text-primary-300" />
        )}
        {tutorial.category === "Risk Management" && (
          <Medal className="h-10 w-10 text-primary-300" />
        )}
        {tutorial.category === "NFTs" && (
          <BookOpen className="h-10 w-10 text-primary-300" />
        )}
        {tutorial.category === "Algorithmic Trading" && (
          <Film className="h-10 w-10 text-primary-300" />
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary">{tutorial.category}</Badge>
          <span className="text-xs text-slate-500">{tutorial.difficulty}</span>
        </div>
        <CardTitle className="text-lg">{tutorial.title}</CardTitle>
        <CardDescription className="line-clamp-2">{tutorial.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500">{tutorial.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-slate-500">{tutorial.rating}/5</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Watch Tutorial
        </Button>
      </CardFooter>
    </Card>
  );
}