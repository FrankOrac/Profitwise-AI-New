import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpRight, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import { AiInsight } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

type InsightType = "buy" | "warning" | "info";

interface AiInsightsProps {
  className?: string;
}

export function AiInsights({ className }: AiInsightsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ["/api/insights"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      setGenerating(true);
      const res = await apiRequest("POST", "/api/insights/generate");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
      toast({
        title: "New insight generated",
        description: "An AI-powered insight has been added to your dashboard.",
      });
      setGenerating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate insight",
        description: error.message,
        variant: "destructive",
      });
      setGenerating(false);
    },
  });

  const handleGenerateInsight = () => {
    generateMutation.mutate();
  };

  const refreshInsights = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
  };


  const getInsightIcon = (type: InsightType) => {
    switch (type) {
      case "buy":
        return <ArrowUpRight className="h-4 w-4 text-success" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "info":
        return <Lightbulb className="h-4 w-4 text-primary-700" />;
      default:
        return <Lightbulb className="h-4 w-4 text-primary-700" />;
    }
  };

  const getInsightColor = (type: InsightType) => {
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

  const getIconBackground = (type: InsightType) => {
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

  const getTitleColor = (type: InsightType) => {
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
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">AI Investment Insights</h2>
          <Button onClick={refreshInsights} variant="ghost">Refresh</Button>
          <Badge className="text-xs px-2.5 py-1 rounded-full font-medium bg-primary-50 text-primary-700 flex items-center">
            <Lightbulb className="h-3 w-3 mr-1.5" />
            Generated Just Now
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div 
                key={insight.id} 
                className={`p-4 border rounded-lg ${getInsightColor(insight.type as InsightType)}`}
              >
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className={`w-8 h-8 rounded-full ${getIconBackground(insight.type as InsightType)} flex items-center justify-center`}>
                      {getInsightIcon(insight.type as InsightType)}
                    </div>
                  </div>
                  <div>
                    <h3 className={`font-medium ${getTitleColor(insight.type as InsightType)}`}>
                      {insight.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {insight.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Button 
            className="w-full"
            onClick={handleGenerateInsight}
            disabled={isLoading || generating}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Generate More Insights
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AiInsights;