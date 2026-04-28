"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

export function EmptyCart() {
  const { t } = useLocale();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <ShoppingBag className="h-12 w-12 text-muted-foreground" />
      <p className="text-muted-foreground">{t("cart.emptyMessage")}</p>
      <Button asChild variant="outline">
        <Link href="/shop">
          <ArrowLeft className="h-4 w-4" />
          {t("cart.backToShop")}
        </Link>
      </Button>
    </div>
  );
}
