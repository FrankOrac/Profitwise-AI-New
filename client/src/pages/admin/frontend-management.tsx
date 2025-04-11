
import { useState } from "react";
import { Helmet } from "react-helmet";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FrontendManagement() {
  const [heroContent, setHeroContent] = useState({
    title: "Transform Your Trading with AI-Powered Intelligence",
    description: "ProfitWise AI combines advanced machine learning with real-time market data to help you make smarter investment decisions and maximize returns."
  });

  const [features, setFeatures] = useState([
    { icon: "Brain", title: "AI-Powered Insights", description: "Advanced algorithms analyze market trends" },
    { icon: "ChartLine", title: "Real-Time Analytics", description: "Live market data and portfolio tracking" },
    { icon: "Shield", title: "Enterprise Security", description: "Bank-grade encryption and protection" }
  ]);

  const updateContent = async (data: any) => {
    // Here you would implement the API call to update content
    console.log("Updating content:", data);
  };

  return (
    <>
      <Helmet>
        <title>Frontend Management | ProfitWise AI</title>
      </Helmet>
      
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        <div className="flex flex-col">
          <Header />
          
          <main className="bg-slate-50 p-6 flex-1 overflow-y-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Frontend Management</h1>
              <p className="text-slate-500">Customize your landing page and frontend content</p>
            </div>

            <Tabs defaultValue="hero">
              <TabsList>
                <TabsTrigger value="hero">Hero Section</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
              </TabsList>

              <TabsContent value="hero">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Hero Title</label>
                        <Input
                          value={heroContent.title}
                          onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Hero Description</label>
                        <Textarea
                          value={heroContent.description}
                          onChange={(e) => setHeroContent({ ...heroContent, description: e.target.value })}
                        />
                      </div>
                      <Button onClick={() => updateContent({ hero: heroContent })}>
                        Update Hero Section
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {features.map((feature, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            value={feature.title}
                            onChange={(e) => {
                              const newFeatures = [...features];
                              newFeatures[index].title = e.target.value;
                              setFeatures(newFeatures);
                            }}
                          />
                          <Input
                            value={feature.description}
                            onChange={(e) => {
                              const newFeatures = [...features];
                              newFeatures[index].description = e.target.value;
                              setFeatures(newFeatures);
                            }}
                          />
                          <Input
                            value={feature.icon}
                            onChange={(e) => {
                              const newFeatures = [...features];
                              newFeatures[index].icon = e.target.value;
                              setFeatures(newFeatures);
                            }}
                          />
                        </div>
                      ))}
                      <Button onClick={() => updateContent({ features })}>
                        Update Features
                      </Button>
                    </div>
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
