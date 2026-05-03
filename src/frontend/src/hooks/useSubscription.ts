import { createActor } from "@/backend";
import type { SubscriptionPlan, UserSubscriptionPublic } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type { SubscriptionPlan, UserSubscriptionPublic };

export function useSubscriptionPlans() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SubscriptionPlan[]>({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubscriptionPlans();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMySubscription() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserSubscriptionPublic | null>({
    queryKey: ["mySubscription"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMySubscription();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubscribeToPlan() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      planId,
      autoRenew,
    }: {
      planId: bigint;
      autoRenew: boolean;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.subscribeToPlan(planId, autoRenew);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySubscription"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] });
    },
  });
}

export function useCancelSubscription() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.cancelMySubscription();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySubscription"] });
    },
  });
}

export function useCreateSubscriptionCheckout() {
  return useMutation({
    mutationFn: async (
      _items: Array<{
        currency: string;
        productName: string;
        productDescription: string;
        priceInCents: bigint;
        quantity: bigint;
      }>,
    ) => {
      // Payment integration requires Stripe extension — not available in this environment
      throw new Error("Payment integration not available");
    },
  });
}
