
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, TrendingUp, Users, Star } from "lucide-react";

interface TraderCardProps {
  trader: {
    id: number;
    name: string;
    avatar: string;
    winRate: number;
    followers: number;
    monthlyReturn: number;
    risk: "low" | "moderate" | "high";
  };
  onFollow: (id: number) => void;
}

export function TraderCard({ trader, onFollow }: TraderCardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-success/20 text-success";
      case "moderate":
        return "bg-warning/20 text-warning";
      case "high":
        return "bg-error/20 text-error";
      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-4 pb-4">
        <img
          src={trader.avatar}
          alt={trader.name}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <h3 className="font-semibold">{trader.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Users className="h-4 w-4" />
            <span>{trader.followers} followers</span>
          </div>
        </div>
        <Button onClick={() => onFollow(trader.id)} variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-slate-600">Win Rate</div>
            <div className="font-semibold flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              {trader.winRate}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-slate-600">Monthly Return</div>
            <div className="font-semibold flex items-center text-success">
              <TrendingUp className="h-4 w-4 mr-1" />
              {trader.monthlyReturn}%
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Badge className={getRiskColor(trader.risk)}>
            {trader.risk.charAt(0).toUpperCase() + trader.risk.slice(1)} Risk
          </Badge>
          <Button variant="ghost" size="sm">View Profile</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default TraderCard;
