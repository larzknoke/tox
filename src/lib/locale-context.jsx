"use client";

import { createContext, useContext } from "react";
import { t as interpolate } from "@/lib/i18n";

const LocaleContext = createContext({ locale: "en", messages: {} });

export function LocaleProvider({ locale, messages, children }) {
  return (
    <LocaleContext.Provider value={{ locale, messages }}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Returns the active locale string and a `t(key, params?)` translation helper
 * that looks up a dot-separated key within the shared messages object.
 *
 * @example
 *   const { t } = useLocale();
 *   t("nav.logout")          // "Logout" | "Déconnexion"
 *   t("orders.itemsSelected", { count: 3 }) // "Items (3)"
 */
export function useLocale() {
  const { locale, messages } = useContext(LocaleContext);

  function t(key, params = {}) {
    const parts = key.split(".");
    let value = messages;
    for (const part of parts) {
      if (value == null || typeof value !== "object") return key;
      value = value[part];
    }
    if (typeof value !== "string") return key;
    return interpolate(value, params);
  }

  return { locale, t };
}
