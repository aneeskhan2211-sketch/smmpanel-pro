import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useEngagement() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const levelQuery = useQuery({
    queryKey: ["my-level"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyLevel();
    },
    enabled: !!actor && !isFetching,
  });

  const referralsQuery = useQuery({
    queryKey: ["my-referrals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyReferrals();
    },
    enabled: !!actor && !isFetching,
  });

  const couponsQuery = useQuery({
    queryKey: ["my-coupons"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyCoupons();
    },
    enabled: !!actor && !isFetching,
  });

  const engagementHistoryQuery = useQuery({
    queryKey: ["engagement-history"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyEngagementHistory(BigInt(20));
    },
    enabled: !!actor && !isFetching,
  });

  const claimDailyReward = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.claimDailyLoginReward();
    },
    onSuccess: (amount) => {
      toast.success(
        `Daily reward claimed! ₹${Number(amount)} added to wallet.`,
      );
      queryClient.invalidateQueries({ queryKey: ["engagement-history"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
    onError: () => {
      toast.error("Reward already claimed today or not available.");
    },
  });

  const spinWheel = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.spinWheelReward();
    },
    onSuccess: (amount) => {
      toast.success(`🎉 You won ₹${Number(amount)}! Added to wallet.`);
      queryClient.invalidateQueries({ queryKey: ["engagement-history"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
    onError: () => {
      toast.error("Spin wheel unavailable. Try again later.");
    },
  });

  // Determine if daily reward was claimed today from history
  const today = new Date().toDateString();
  const claimedToday = (engagementHistoryQuery.data ?? []).some((log) => {
    if (log.activityType.toString() !== "dailyLogin") return false;
    const logDate = new Date(Number(log.timestamp) / 1_000_000).toDateString();
    return logDate === today;
  });

  return {
    level: levelQuery.data ?? null,
    referrals: referralsQuery.data ?? [],
    coupons: couponsQuery.data ?? [],
    engagementHistory: engagementHistoryQuery.data ?? [],
    claimedToday,
    claimDailyReward,
    spinWheel,
    isLoading:
      levelQuery.isLoading ||
      referralsQuery.isLoading ||
      couponsQuery.isLoading,
  };
}
