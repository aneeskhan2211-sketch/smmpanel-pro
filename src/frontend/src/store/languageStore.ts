import {
  type Language,
  type TranslationKey,
  translations,
} from "@/i18n/translations";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "en" as Language,

      setLanguage: (lang) => {
        set({ language: lang });
        // Apply RTL for Arabic
        if (typeof document !== "undefined") {
          document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
          document.documentElement.lang = lang;
        }
      },

      t: (key: TranslationKey) => {
        const { language } = get();
        return translations[language]?.[key] ?? translations.en[key] ?? key;
      },
    }),
    {
      name: "smm-language",
      onRehydrateStorage: () => (state) => {
        // Reapply RTL direction on hydration
        if (state && typeof document !== "undefined") {
          document.documentElement.dir =
            state.language === "ar" ? "rtl" : "ltr";
          document.documentElement.lang = state.language;
        }
      },
    },
  ),
);

/** Convenience hook — call t(key) inline in components */
export function useTranslation() {
  return useLanguageStore((s) => s.t);
}
