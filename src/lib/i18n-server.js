import { cookies } from "next/headers";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE } from "@/lib/i18n";

/**
 * Server-side helper — resolves the active locale from the cookie.
 * Safe to call in Server Components and Route Handlers only.
 */
export async function getLocale() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  return SUPPORTED_LOCALES.includes(raw) ? raw : DEFAULT_LOCALE;
}
