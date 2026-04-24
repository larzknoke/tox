"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { SUPPORTED_LOCALES } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

const LOCALE_LABELS = {
  en: "English",
  fr: "Français",
};

export function LanguageSwitcher({ compact = false }) {
  const { locale } = useLocale();
  const router = useRouter();

  async function switchLocale(next) {
    if (next === locale) return;
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={
            compact ? "h-7 gap-1 px-1.5 text-[10px]" : "gap-1.5 px-2 text-xs"
          }
        >
          <Globe className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
          {compact
            ? locale.toUpperCase()
            : (LOCALE_LABELS[locale] ?? locale.toUpperCase())}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start">
        {SUPPORTED_LOCALES.map((code) => (
          <DropdownMenuItem
            key={code}
            onSelect={() => switchLocale(code)}
            className={code === locale ? "font-semibold" : ""}
          >
            {LOCALE_LABELS[code]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
