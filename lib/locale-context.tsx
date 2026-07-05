"use client";

import { createContext, useContext, type ReactNode } from "react";
import { translations, type Locale, type TranslationKey } from "./i18n";

const LocaleContext = createContext<Locale>("ko");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useTranslations() {
  const locale = useLocale();
  return (key: TranslationKey) => translations[locale][key];
}
