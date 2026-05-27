"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocale } from "@/lib/locale-context";
import { CONSENT_ACCEPTED_VALUE, CONSENT_COOKIE } from "@/lib/consent";

function hasAcceptedConsent() {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some(
      (cookie) =>
        cookie.trim() === `${CONSENT_COOKIE}=${CONSENT_ACCEPTED_VALUE}`,
    );
}

export function CookieConsentBanner() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setVisible(!hasAcceptedConsent());
  }, []);

  const acceptConsent = async () => {
    setSaving(true);

    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accepted: true }),
      });

      if (!res.ok) throw new Error("Failed to save consent");
      setVisible(false);
      router.refresh();
    } catch {
      document.cookie = `${CONSENT_COOKIE}=${CONSENT_ACCEPTED_VALUE}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      setVisible(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  if (pathname === "/privacy") return null;

  return (
    <Dialog open={visible} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-xl"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t("cookieBanner.title")}</DialogTitle>
          <DialogDescription>{t("cookieBanner.description")}</DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          <Link href="/privacy" className="underline underline-offset-4">
            {t("cookieBanner.privacyLink")}
          </Link>
        </p>

        <DialogFooter>
          <Button
            onClick={acceptConsent}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {saving ? t("cookieBanner.accepting") : t("cookieBanner.accept")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
