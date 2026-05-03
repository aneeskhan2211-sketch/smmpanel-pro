import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CurrencyOption {
  code: string;
  symbol: string;
  flag: string;
  displayName: string;
  exchangeRate: number;
  isActive: boolean;
}

// Fallback static currencies until backend data loads
export const DEFAULT_CURRENCIES: CurrencyOption[] = [
  {
    code: "INR",
    symbol: "₹",
    flag: "🇮🇳",
    displayName: "Indian Rupee",
    exchangeRate: 1,
    isActive: true,
  },
  {
    code: "USD",
    symbol: "$",
    flag: "🇺🇸",
    displayName: "US Dollar",
    exchangeRate: 0.012,
    isActive: true,
  },
  {
    code: "AED",
    symbol: "د.إ",
    flag: "🇦🇪",
    displayName: "UAE Dirham",
    exchangeRate: 0.044,
    isActive: true,
  },
  {
    code: "OMR",
    symbol: "﷼",
    flag: "🇴🇲",
    displayName: "Omani Rial",
    exchangeRate: 0.0046,
    isActive: true,
  },
  {
    code: "SAR",
    symbol: "﷼",
    flag: "🇸🇦",
    displayName: "Saudi Riyal",
    exchangeRate: 0.045,
    isActive: true,
  },
  {
    code: "EUR",
    symbol: "€",
    flag: "🇪🇺",
    displayName: "Euro",
    exchangeRate: 0.011,
    isActive: true,
  },
  {
    code: "GBP",
    symbol: "£",
    flag: "🇬🇧",
    displayName: "British Pound",
    exchangeRate: 0.0096,
    isActive: true,
  },
];

interface CurrencyState {
  selectedCurrency: CurrencyOption;
  currencies: CurrencyOption[];
  setCurrency: (code: string) => void;
  setCurrencies: (currencies: CurrencyOption[]) => void;
  convertFromINR: (amountINR: number) => number;
  formatAmount: (amountINR: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      selectedCurrency: DEFAULT_CURRENCIES[0],
      currencies: DEFAULT_CURRENCIES,

      setCurrency: (code) => {
        const { currencies } = get();
        const found = currencies.find((c) => c.code === code);
        if (found) set({ selectedCurrency: found });
      },

      setCurrencies: (currencies) => {
        const { selectedCurrency } = get();
        const updated = currencies.find(
          (c) => c.code === selectedCurrency.code,
        );
        set({
          currencies,
          selectedCurrency: updated ?? currencies[0] ?? selectedCurrency,
        });
      },

      convertFromINR: (amountINR) => {
        const { selectedCurrency } = get();
        return amountINR * selectedCurrency.exchangeRate;
      },

      formatAmount: (amountINR) => {
        const { selectedCurrency, convertFromINR } = get();
        const converted = convertFromINR(amountINR);
        return `${selectedCurrency.symbol}${converted.toFixed(2)}`;
      },
    }),
    {
      name: "smm-currency",
      partialize: (state) => ({ selectedCurrency: state.selectedCurrency }),
    },
  ),
);
