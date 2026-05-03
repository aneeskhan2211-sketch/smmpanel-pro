import { createActor } from "@/backend";
import { useCurrencyStore } from "@/store/currencyStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useCurrencies() {
  const { actor, isFetching } = useActor(createActor);
  const setCurrencies = useCurrencyStore((s) => s.setCurrencies);

  const query = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCurrencies();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10 * 60 * 1000, // 10 min
  });

  useEffect(() => {
    if (query.data && query.data.length > 0) {
      setCurrencies(
        query.data.map((c) => ({
          code: c.code,
          symbol: c.symbol,
          flag: c.flag,
          displayName: c.displayName,
          exchangeRate: c.exchangeRate,
          isActive: c.isActive,
        })),
      );
    }
  }, [query.data, setCurrencies]);

  return query;
}
