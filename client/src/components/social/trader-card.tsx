import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserCheck, UserPlus, ChartLine, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface TraderCardProps {
  trader: {
    id: number;
    name: string;
    avatar?: string;
    winRate: number;
    totalReturn: number;
    followerCount: number;
    isFollowing?: boolean;
  };
}

export default function TraderCard({ trader }: TraderCardProps) {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/social/follow/${trader.id}`, {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traders'] });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-slate-200 flex-shrink-0">
          {trader.avatar && (
            <img
              src={trader.avatar}
              alt={trader.name}
              className="h-full w-full rounded-full object-cover"
            />
          )}
        </div>
        <div>
          <h3 className="font-semibold">{trader.name}</h3>
          <p className="text-sm text-slate-500">Trader</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-slate-500">Win Rate</p>
            <p className="text-lg font-semibold">{trader.winRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Return</p>
            <p className="text-lg font-semibold">{trader.totalReturn.toFixed(2)}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600">{trader.followerCount} followers</span>
        </div>
        <Button
          variant={trader.isFollowing ? "outline" : "default"}
          className="w-full"
          onClick={() => followMutation.mutate()}
          disabled={followMutation.isPending}
        >
          {trader.isFollowing ? (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Follow
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}