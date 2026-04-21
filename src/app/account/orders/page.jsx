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

const statusVariant = {
  PENDING: "secondary",
  VALIDATED: "default",
  PROCESSING: "default",
  SHIPPED: "outline",
};

const statusLabel = {
  PENDING: "Pending",
  VALIDATED: "Validated",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
};

function AddressSummary({ address }) {
  if (!address) return <span className="text-muted-foreground">—</span>;
  return (
    <span>
      {address.firstName} {address.lastName}, {address.address1},{" "}
      {address.postalCode} {address.city}
    </span>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  const totalItems = order.items.reduce((sum, i) => sum + i.numberOfPacks, 0);
  const totalPrice = order.items.reduce((sum, i) => sum + i.totalPrice, 0);
  const totalTickets = order.items.reduce(
    (sum, i) => sum + i.quantityPerPack * i.numberOfPacks,
    0,
  );

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
                {statusLabel[order.status] ?? order.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              #{order.id}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="font-semibold">€{totalPrice.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {totalItems} {totalItems === 1 ? "pack" : "packs"} &middot;{" "}
                {totalTickets.toLocaleString()} tickets &middot;{" "}
                {new Date(order.createdAt).toLocaleDateString("de-DE")}
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
              <span>Product</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Total</span>
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
                    tickets/pack &middot;{" "}
                    {(
                      item.quantityPerPack * item.numberOfPacks
                    ).toLocaleString()}{" "}
                    tickets total
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
              <span>Total (excl. VAT)</span>
              <span />
              <span />
              <span className="text-right tabular-nums">
                €{totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Billing Address
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
                    <p>Tax identification number: {order.billingAddress.vat}</p>
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
                Delivery Address
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
                Invoice
              </p>
              <p>
                #{order.invoice.invoiceNumber} &middot;{" "}
                {new Date(order.invoice.invoiceDate).toLocaleDateString(
                  "de-DE",
                )}{" "}
                &middot; €{order.invoice.totalAmount.toFixed(2)}{" "}
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
        <PageHeader title="My Orders" />
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <PageHeader title="My Orders" />
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">You have no orders yet.</p>
          <Button asChild variant="outline">
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4" />
              Go to Shop
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader title="My Orders" />
      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
