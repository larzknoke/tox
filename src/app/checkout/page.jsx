"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/lib/cart-context";
import { getAddressesAction } from "@/app/account/actions/get-addresses";
import { placeOrderAction } from "./actions/place-order";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { EmptyCart } from "@/components/empty-cart";
import { getShippingByTicketCount } from "@/lib/shipping";
import { useLocale } from "@/lib/locale-context";

const emptyAddressBook = {
  billingAddresses: [],
  deliveryAddresses: [],
  defaultBillingAddressId: null,
  defaultDeliveryAddressId: null,
};

function AddressDisplay({ address, type, t }) {
  if (!address || !address.firstName) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("checkout.noAddressProvided")}
      </p>
    );
  }

  return (
    <div className="text-sm space-y-0.5 text-muted-foreground">
      <p className="text-foreground font-medium">
        {address.firstName} {address.lastName}
      </p>
      {address.company && <p>{address.company}</p>}
      {type === "billing" && address.vat && (
        <p>
          {t("checkout.taxId")}: {address.vat}
        </p>
      )}
      <p>{address.address1}</p>
      {address.address2 && <p>{address.address2}</p>}
      <p>
        {address.postalCode} {address.city}
      </p>
      <p>{address.country}</p>
      <p>{address.phone}</p>
    </div>
  );
}

export default function CheckoutPage() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { cartItems, clearCart } = useCart();
  const [isOrdering, startTransition] = useTransition();

  const [orderName, setOrderName] = useState("");
  const [addressBook, setAddressBook] = useState(emptyAddressBook);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState("");
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] =
    useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (session?.user) {
      getAddressesAction().then((result) => {
        if (result.success) {
          setAddressBook({
            billingAddresses: result.billingAddresses,
            deliveryAddresses: result.deliveryAddresses,
            defaultBillingAddressId: result.defaultBillingAddressId,
            defaultDeliveryAddressId: result.defaultDeliveryAddressId,
          });
          setSelectedBillingAddressId(
            String(
              result.defaultBillingAddressId ??
                result.billingAddresses[0]?.id ??
                "",
            ),
          );
          setSelectedDeliveryAddressId(
            String(
              result.defaultDeliveryAddressId ??
                result.deliveryAddresses[0]?.id ??
                "",
            ),
          );
        }
        setLoaded(true);
      });
    }
  }, [session]);

  useEffect(() => {
    if (!sessionPending && !session) {
      router.push("/signin");
    }
  }, [session, sessionPending, router]);

  if (sessionPending || !loaded) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <PageHeader title={t("checkout.pageTitle")} />
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          {t("checkout.loading")}
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <PageHeader title={t("checkout.pageTitle")} />
        <EmptyCart />
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.pricePerPack * item.quantity,
    0,
  );
  const totalTickets = cartItems.reduce(
    (sum, item) => sum + item.quantityPerPack * item.quantity,
    0,
  );
  const shipping = getShippingByTicketCount(totalTickets);
  const shippingCost = shipping.price ?? 0;
  const grandTotal = subtotal + shippingCost;

  const handlePlaceOrder = () => {
    if (shipping.isQuoteRequired) {
      toast.error(t("checkout.quoteRequiredError"));
      return;
    }

    startTransition(async () => {
      const result = await placeOrderAction({
        name: orderName,
        billingAddressId: Number(selectedBillingAddressId),
        deliveryAddressId: Number(selectedDeliveryAddressId),
        items: cartItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      });

      if (result.success) {
        clearCart();
        toast.success(t("checkout.orderPlaced"));
        router.push("/");
      } else {
        toast.error(t("checkout.orderFailed"));
      }
    });
  };

  const selectedBillingAddress =
    addressBook.billingAddresses.find(
      (address) => String(address.id) === selectedBillingAddressId,
    ) ?? null;
  const selectedDeliveryAddress =
    addressBook.deliveryAddresses.find(
      (address) => String(address.id) === selectedDeliveryAddressId,
    ) ?? null;

  const canOrder =
    orderName.trim() &&
    selectedBillingAddress &&
    selectedDeliveryAddress &&
    !shipping.isQuoteRequired;

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader title={t("checkout.pageTitle")} />

      <div className="flex flex-col gap-8 w-full">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("checkout.orderNameTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="order-name">
                  {t("checkout.orderNameLabel")}
                </Label>
                <Input
                  id="order-name"
                  placeholder={t("checkout.orderNamePlaceholder")}
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  disabled={isOrdering}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("checkout.billingAddressTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addressBook.billingAddresses.length ? (
                <>
                  <div className="space-y-2">
                    <Label>{t("checkout.selectBillingAddress")}</Label>
                    <Select
                      value={selectedBillingAddressId}
                      onValueChange={setSelectedBillingAddressId}
                      disabled={isOrdering}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("checkout.selectAddressPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {addressBook.billingAddresses.map((address) => (
                          <SelectItem
                            key={address.id}
                            value={String(address.id)}
                          >
                            {address.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <AddressDisplay
                    address={selectedBillingAddress}
                    type="billing"
                    t={t}
                  />
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {t("checkout.noBillingAddressSaved")}
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/account">{t("checkout.manageAddresses")}</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("checkout.deliveryAddressTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addressBook.deliveryAddresses.length ? (
                <>
                  <div className="space-y-2">
                    <Label>{t("checkout.selectDeliveryAddress")}</Label>
                    <Select
                      value={selectedDeliveryAddressId}
                      onValueChange={setSelectedDeliveryAddressId}
                      disabled={isOrdering}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("checkout.selectAddressPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {addressBook.deliveryAddresses.map((address) => (
                          <SelectItem
                            key={address.id}
                            value={String(address.id)}
                          >
                            {address.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <AddressDisplay
                    address={selectedDeliveryAddress}
                    type="delivery"
                    t={t}
                  />
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {t("checkout.noDeliveryAddressSaved")}
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/account">{t("checkout.manageAddresses")}</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="w-full">
          <div className="rounded-md border p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-base">
              {t("checkout.orderSummary")}
            </h2>

            <div className="flex flex-col gap-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col gap-0.5">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="font-medium truncate">{item.name}</span>
                    <span className="shrink-0 font-semibold">
                      €{(item.pricePerPack * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.reference} &middot; {item.quantity}{" "}
                    {item.quantity === 1
                      ? t("checkout.packOne")
                      : t("checkout.packOther")}{" "}
                    × €{item.pricePerPack.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between font-medium">
              <span>{t("checkout.totalExclVat")}</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {shipping.parcels > 0
                  ? t("checkout.shippingWithParcels", {
                      count: shipping.parcels,
                      parcelLabel:
                        shipping.parcels === 1
                          ? t("checkout.parcelOne")
                          : t("checkout.parcelOther"),
                    })
                  : t("checkout.shipping")}
              </span>
              <span>
                {shipping.isQuoteRequired
                  ? t("checkout.uponRequest")
                  : `€${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>{t("checkout.totalInclShipping")}</span>
              <span>
                {shipping.isQuoteRequired
                  ? t("checkout.uponRequest")
                  : `€${grandTotal.toFixed(2)}`}
              </span>
            </div>
            {shipping.isQuoteRequired && (
              <p className="text-xs text-muted-foreground">
                {t("checkout.quoteRequiredInfo")}
              </p>
            )}
            <div className="flex w-full items-center justify-between">
              <Button asChild variant="ghost" size="sm" className="w-40">
                <Link href="/cart">
                  <ArrowLeft className="h-4 w-4" />
                  {t("checkout.backToCart")}
                </Link>
              </Button>
              <Button
                className="w-40"
                onClick={handlePlaceOrder}
                disabled={!canOrder || isOrdering}
              >
                {isOrdering
                  ? t("checkout.placingOrder")
                  : t("checkout.placeOrder")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
