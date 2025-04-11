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
}

export function MetricCard({
  title,
  value,
  subValue,
  badgeText,
  badgeVariant = "default"
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
