import { createActor } from "@/backend";
import type { Transaction } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type { Transaction };

export function useWalletBalance() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: ["wallet", "balance"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getMyBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTransactions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Transaction[]>({
    queryKey: ["wallet", "transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_amountInRupees: number): Promise<CheckoutSession> => {
      // Stripe checkout session creation requires backend Stripe extension.
      // When the backend is configured with the Stripe extension, replace this
      // stub with a real actor call: actor.createCheckoutSession(items, successUrl, cancelUrl)
      throw new Error(
        "Stripe is not yet configured. Please set up the Stripe extension in the backend.",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}
