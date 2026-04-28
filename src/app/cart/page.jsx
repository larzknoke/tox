"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { EmptyCart } from "@/components/empty-cart";
import { useLocale } from "@/lib/locale-context";

export default function CartPage() {
  const { locale, t } = useLocale();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.pricePerPack * item.quantity,
    0,
  );
  const totalTickets = cartItems.reduce(
    (sum, item) => sum + item.quantityPerPack * item.quantity,
    0,
  );

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <PageHeader title={t("cart.pageTitle")} />
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader title={t("cart.pageTitle")} />

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        <div className="flex-1 flex flex-col gap-0 rounded-md border divide-y">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-4 py-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  {item.reference} &middot;{" "}
                  {t("cart.ticketsPerPack", {
                    count: item.quantityPerPack.toLocaleString(locale),
                  })}{" "}
                  &middot;{" "}
                  {item.quantityPerPack * item.quantity
                    ? t("cart.ticketsTotalCount", {
                        count: (
                          item.quantityPerPack * item.quantity
                        ).toLocaleString(locale),
                      })
                    : t("cart.ticketsTotal")}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <ButtonGroup>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value) || 1)
                    }
                    className="w-16 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={t("cart.removeItem")}
                  >
                    <Trash2 />
                  </Button>
                </ButtonGroup>
                <span className="text-sm font-semibold w-20 text-right">
                  €{(item.pricePerPack * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-72 shrink-0">
          <div className="rounded-md border p-5 flex flex-col gap-4 sticky top-6">
            <h2 className="font-semibold text-base">
              {t("cart.orderSummary")}
            </h2>
            <div className="flex flex-col gap-2 text-sm">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">
                    {item.reference} × {item.quantity}
                  </span>
                  <span className="shrink-0">
                    €{(item.pricePerPack * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>{t("cart.subtotal")}</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t("cart.totalTickets")}</span>
              <span>{totalTickets.toLocaleString(locale)}</span>
            </div>
            <Button className="w-full" asChild>
              <Link href="/checkout">{t("cart.proceedToCheckout")}</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground w-full"
              onClick={clearCart}
            >
              {t("cart.clearCart")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
