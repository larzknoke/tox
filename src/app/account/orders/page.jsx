"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { getMyOrdersAction } from "../actions/get-my-orders";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { getOrderPricingSummary } from "@/lib/shipping";
import { useLocale } from "@/lib/locale-context";

const statusVariant = {
  PENDING: "secondary",
  VALIDATED: "default",
  PROCESSING: "default",
  SHIPPED: "outline",
};

function getStatusLabel(status, t) {
  const map = {
    PENDING: "account.orders.status.pending",
    VALIDATED: "account.orders.status.validated",
    PROCESSING: "account.orders.status.processing",
    SHIPPED: "account.orders.status.shipped",
  };
  return t(map[status] ?? "") || status;
}

function AddressSummary({ address }) {
  if (!address) return <span className="text-muted-foreground">—</span>;
  return (
    <span>
      {address.firstName} {address.lastName}, {address.address1},{" "}
      {address.postalCode} {address.city}
    </span>
  );
}

function OrderCard({ order, locale, t }) {
  const [expanded, setExpanded] = useState(false);

  const pricing = getOrderPricingSummary(order.items);

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{order.name}</CardTitle>
              <Badge variant={statusVariant[order.status] ?? "secondary"}>
                {getStatusLabel(order.status, t)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              #{order.id}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="font-semibold">
                {pricing.shipping.isQuoteRequired
                  ? t("orders.uponRequest")
                  : `€${pricing.grandTotal.toFixed(2)}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {pricing.totalPacks}{" "}
                {pricing.totalPacks === 1
                  ? t("account.orders.packOne")
                  : t("account.orders.packOther")}{" "}
                &middot; {pricing.totalTickets.toLocaleString(locale)}{" "}
                {t("orders.tickets")} &middot;{" "}
                {new Date(order.createdAt).toLocaleDateString(locale)}
              </p>
            </div>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />

          {/* Items table */}
          <div className="rounded-md border mb-6">
            <div className="grid grid-cols-[1fr_3rem_6rem_6rem] gap-x-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b bg-muted/40">
              <span>{t("orders.detailProduct")}</span>
              <span className="text-right">{t("orders.detailQty")}</span>
              <span className="text-right">{t("orders.detailUnitPrice")}</span>
              <span className="text-right">{t("orders.detailTotal")}</span>
            </div>
            {order.items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_3rem_6rem_6rem] gap-x-4 px-4 py-2.5 text-sm border-b last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{item.designation}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {item.reference} &middot; {item.quantityPerPack}{" "}
                    {t("orders.ticketsPerPack")} &middot;{" "}
                    {(item.quantityPerPack * item.numberOfPacks).toLocaleString(
                      locale,
                    )}{" "}
                    {t("orders.ticketsTotal")}
                  </p>
                </div>
                <span className="text-right tabular-nums">
                  {item.numberOfPacks}
                </span>
                <span className="text-right tabular-nums">
                  €{item.pricePerPack.toFixed(2)}
                </span>
                <span className="text-right font-semibold tabular-nums">
                  €{item.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_3rem_6rem_6rem] gap-x-4 px-4 py-2.5 text-sm font-semibold bg-muted/40">
              <span>{t("orders.detailSubtotal")}</span>
              <span />
              <span />
              <span className="text-right tabular-nums">
                €{pricing.subtotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="rounded-md border p-3 text-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>
                {pricing.shipping.parcels === 1
                  ? t("orders.detailShipping", {
                      parcels: pricing.shipping.parcels,
                    })
                  : t("orders.detailShippingPlural", {
                      parcels: pricing.shipping.parcels,
                    })}
              </span>
              <span>
                {pricing.shipping.isQuoteRequired
                  ? t("orders.uponRequest")
                  : `€${pricing.shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span>{t("orders.detailGrandTotal")}</span>
              <span>
                {pricing.shipping.isQuoteRequired
                  ? t("orders.uponRequest")
                  : `€${pricing.grandTotal.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {t("orders.detailBillingAddress")}
              </p>
              {order.billingAddress ? (
                <div className="text-sm space-y-0.5 text-muted-foreground">
                  <p className="text-foreground font-medium">
                    {order.billingAddress.firstName}{" "}
                    {order.billingAddress.lastName}
                  </p>
                  {order.billingAddress.company && (
                    <p>{order.billingAddress.company}</p>
                  )}
                  {order.billingAddress.vat && (
                    <p>
                      {t("checkout.taxId")}: {order.billingAddress.vat}
                    </p>
                  )}
                  <p>{order.billingAddress.address1}</p>
                  {order.billingAddress.address2 && (
                    <p>{order.billingAddress.address2}</p>
                  )}
                  <p>
                    {order.billingAddress.postalCode}{" "}
                    {order.billingAddress.city}
                  </p>
                  <p>{order.billingAddress.country}</p>
                  <p>{order.billingAddress.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {t("orders.detailShippingAddress")}
              </p>
              {order.deliveryAddress ? (
                <div className="text-sm space-y-0.5 text-muted-foreground">
                  <p className="text-foreground font-medium">
                    {order.deliveryAddress.firstName}{" "}
                    {order.deliveryAddress.lastName}
                  </p>
                  {order.deliveryAddress.company && (
                    <p>{order.deliveryAddress.company}</p>
                  )}
                  <p>{order.deliveryAddress.address1}</p>
                  {order.deliveryAddress.address2 && (
                    <p>{order.deliveryAddress.address2}</p>
                  )}
                  <p>
                    {order.deliveryAddress.postalCode}{" "}
                    {order.deliveryAddress.city}
                  </p>
                  <p>{order.deliveryAddress.country}</p>
                  <p>{order.deliveryAddress.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </div>
          </div>

          {/* Invoice info */}
          {order.invoice && (
            <div className="mt-4 text-sm">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {t("account.orders.invoice")}
              </p>
              <p>
                #{order.invoice.invoiceNumber} &middot;{" "}
                {new Date(order.invoice.invoiceDate).toLocaleDateString(locale)}{" "}
                &middot; €{pricing.grandTotal.toFixed(2)}{" "}
                {order.invoice.currency}
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const { data: session, isPending } = authClient.useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      getMyOrdersAction().then((result) => {
        if (result.success) {
          setOrders(result.orders);
        }
        setLoading(false);
      });
    }
  }, [session]);

  if (isPending || loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <PageHeader title={t("account.orders.pageTitle")} />
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          {t("account.orders.loading")}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <PageHeader title={t("account.orders.pageTitle")} />
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">{t("account.orders.empty")}</p>
          <Button asChild variant="outline">
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4" />
              {t("account.orders.goToShop")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader title={t("account.orders.pageTitle")} />
      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} locale={locale} t={t} />
        ))}
      </div>
    </div>
  );
}
