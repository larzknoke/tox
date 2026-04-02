"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { cartItems, cartCount, updateQuantity, removeFromCart, clearCart } =
    useCart();

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
        <PageHeader title="Shopping Cart" />
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button asChild variant="outline">
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader title="Shopping Cart" />

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        {/* Items */}
        <div className="flex-1 flex flex-col gap-0 rounded-md border divide-y">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-4 py-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  {item.reference} &middot;{" "}
                  {item.quantityPerPack.toLocaleString()} tickets/pack &middot;{" "}
                  {(item.quantityPerPack * item.quantity).toLocaleString()}{" "}
                  tickets total
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
                    aria-label="Remove item"
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

        {/* Summary */}
        <div className="lg:w-72 shrink-0">
          <div className="rounded-md border p-5 flex flex-col gap-4 sticky top-6">
            <h2 className="font-semibold text-base">Order Summary</h2>
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
              <span>Subtotal (excl. VAT)</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total tickets</span>
              <span>{totalTickets.toLocaleString()}</span>
            </div>
            <Button className="w-full" disabled>
              Proceed to Order
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground w-full"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
