import { MobileSidebar } from "@/components/ui/mobile-sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Clock, 
  Film, 
  Play, 
  Search, 
  Star, 
  Medal,
  Filter,
  BarChart,
  Wallet,
  ArrowRight,
  CreditCard
} from "lucide-react";
import { Helmet } from "react-helmet-async";

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
};

export default function TutorialsPage() {
  // Mock data for tutorials
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
      rating: 4.8
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
      rating: 4.9
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
      rating: 4.7
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
      rating: 4.6
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
      rating: 4.5
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
      rating: 4.9
    }
  ];
  
  const categories = [
    { name: "Cryptocurrency", icon: <Wallet className="h-4 w-4" /> },
    { name: "Technical Analysis", icon: <BarChart className="h-4 w-4" /> },
    { name: "DeFi", icon: <CreditCard className="h-4 w-4" /> },
    { name: "Risk Management", icon: <Medal className="h-4 w-4" /> },
    { name: "NFTs", icon: <BookOpen className="h-4 w-4" /> },
    { name: "Algorithmic Trading", icon: <Film className="h-4 w-4" /> }
  ];
  
  const featuredTutorial = tutorials[1]; // Technical Analysis Fundamentals

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
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Card className="mb-8 overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div className="p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge featuredTutorial={featuredTutorial} />
                      <span className="text-sm text-slate-500">{featuredTutorial.difficulty}</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{featuredTutorial.title}</h2>
                    <p className="text-slate-600 mb-4">{featuredTutorial.description}</p>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{featuredTutorial.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="text-sm">{featuredTutorial.rating}/5</span>
                      </div>
                      <div className="text-sm">By {featuredTutorial.instructor}</div>
                    </div>
                    <Button className="w-fit">
                      <Play className="h-4 w-4 mr-2" />
                      Watch Now
                    </Button>
                  </div>
                  <div className="bg-slate-100 flex items-center justify-center p-10">
                    <div className="h-36 w-36 rounded-full bg-primary-100 flex items-center justify-center">
                      <BarChart className="h-16 w-16 text-primary-600" />
                    </div>
                  </div>
                </div>
              </Card>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Popular Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {categories.map((category) => (
                    <Card key={category.name} className="cursor-pointer hover:border-primary-300 transition-colors">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                          {category.icon}
                        </div>
                        <h3 className="font-medium">{category.name}</h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <Tabs defaultValue="all">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="all">All Tutorials</TabsTrigger>
                    <TabsTrigger value="beginner">Beginner</TabsTrigger>
                    <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                  <Button variant="ghost" className="text-primary-600">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
                
                <TabsContent value="all" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutorials.map((tutorial) => (
                      <TutorialCard key={tutorial.id} tutorial={tutorial} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="beginner" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutorials
                      .filter(tutorial => tutorial.difficulty === "Beginner")
                      .map((tutorial) => (
                        <TutorialCard key={tutorial.id} tutorial={tutorial} />
                      ))
                    }
                  </div>
                </TabsContent>
                
                <TabsContent value="intermediate" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutorials
                      .filter(tutorial => tutorial.difficulty === "Intermediate")
                      .map((tutorial) => (
                        <TutorialCard key={tutorial.id} tutorial={tutorial} />
                      ))
                    }
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutorials
                      .filter(tutorial => tutorial.difficulty === "Advanced")
                      .map((tutorial) => (
                        <TutorialCard key={tutorial.id} tutorial={tutorial} />
                      ))
                    }
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

function Badge({ featuredTutorial }: { featuredTutorial: Tutorial }) {
  return (
    <span className="text-xs font-medium py-1 px-2 rounded-full bg-primary-100 text-primary-700">
      {featuredTutorial.category}
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
          <span className="text-xs font-medium py-0.5 px-2 rounded-full bg-primary-100 text-primary-700">
            {tutorial.category}
          </span>
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