import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MetricVariant = "success" | "warning" | "info" | "default";

interface MetricCardProps {
  title: string;
  value: string;
  subValue: string;
  badgeText?: string;
  badgeVariant?: MetricVariant;
  isLoading?: boolean; // Added isLoading prop
}

export function MetricCard({
  title,
  value,
  subValue,
  badgeText,
  badgeVariant = "default",
  isLoading = false, // Added default value for isLoading
}: MetricCardProps) {
  const getBadgeVariant = () => {
    switch (badgeVariant) {
      case "success":
        return "bg-success/10 text-success hover:bg-success/20";
      case "warning":
        return "bg-warning/10 text-warning hover:bg-warning/20";
      case "info":
        return "bg-primary-100 text-primary-700 hover:bg-primary-200";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-6 bg-slate-200 rounded"></div>
            </div>
            <div className="rounded-full bg-slate-200 h-12 w-12"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-500">{title}</h3>
          {badgeText && (
            <Badge className={cn("font-medium", getBadgeVariant())} variant="outline">
              {badgeText}
            </Badge>
          )}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-slate-500 mt-1">{subValue}</div>
      </CardContent>
    </Card>
  );
}

export default MetricCard;