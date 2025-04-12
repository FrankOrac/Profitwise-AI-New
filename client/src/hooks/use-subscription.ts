
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { toast } from "./use-toast";

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: currentSubscription } = useQuery({
    queryKey: ["/api/subscriptions/current"],
    enabled: !!user
  });

  const upgradeMutation = useMutation({
    mutationFn: async ({ planId, paymentMethodId }: { planId: string, paymentMethodId: string }) => {
      const response = await fetch("/api/subscriptions/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, paymentMethodId })
      });
      if (!response.ok) throw new Error("Failed to upgrade subscription");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/current"] });
      toast({ title: "Subscription upgraded successfully" });
    }
  });

  return {
    currentSubscription,
    upgradeSubscription: upgradeMutation.mutate,
    isUpgrading: upgradeMutation.isPending
  };
}
