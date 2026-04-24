import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

export const SUPPORTED_LOCALES = ["en", "fr"];
export const DEFAULT_LOCALE = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

const messages = { en, fr };

/**
 * Return the full message dictionary for a given locale.
 */
export function getMessages(locale) {
  return messages[locale] ?? messages[DEFAULT_LOCALE];
}

/**
 * Simple interpolation helper: replaces {key} tokens with values from the
 * provided params object.
 * @param {string} template  e.g. "Hello {name}"
 * @param {Record<string, string | number>} params
 */
export function t(template, params = {}) {
  if (!template) return "";
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in params ? String(params[key]) : `{${key}}`,
  );
}
