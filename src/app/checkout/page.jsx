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
import { toast } from "sonner";
import { ArrowLeft, Pencil } from "lucide-react";
import { EmptyCart } from "@/components/empty-cart";
import { getShippingByTicketCount } from "@/lib/shipping";
import { useLocale } from "@/lib/locale-context";

const emptyAddress = {
  firstName: "",
  lastName: "",
  company: "",
  vat: "",
  address1: "",
  address2: "",
  postalCode: "",
  city: "",
  country: "",
  phone: "",
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

function AddressForm({ address, onChange, disabled, type, t }) {
  const update = (field, value) => {
    onChange({ ...address, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("checkout.fields.firstName")}</Label>
          <Input
            value={address.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>{t("checkout.fields.lastName")}</Label>
          <Input
            value={address.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t("checkout.fields.company")}</Label>
        <Input
          value={address.company}
          onChange={(e) => update("company", e.target.value)}
          disabled={disabled}
          required
        />
      </div>
      {type === "billing" && (
        <div className="space-y-2">
          <Label>{t("checkout.fields.vat")}</Label>
          <Input
            value={address.vat}
            onChange={(e) => update("vat", e.target.value)}
            disabled={disabled}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label>{t("checkout.fields.address1")}</Label>
        <Input
          value={address.address1}
          onChange={(e) => update("address1", e.target.value)}
          disabled={disabled}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>{t("checkout.fields.address2")}</Label>
        <Input
          value={address.address2}
          onChange={(e) => update("address2", e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("checkout.fields.postalCode")}</Label>
          <Input
            value={address.postalCode}
            onChange={(e) => update("postalCode", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>{t("checkout.fields.city")}</Label>
          <Input
            value={address.city}
            onChange={(e) => update("city", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t("checkout.fields.country")}</Label>
        <Input
          value={address.country}
          onChange={(e) => update("country", e.target.value)}
          disabled={disabled}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>{t("checkout.fields.phone")}</Label>
        <Input
          type="tel"
          value={address.phone}
          onChange={(e) => update("phone", e.target.value)}
          disabled={disabled}
          required
        />
      </div>
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
  const [billingAddress, setBillingAddress] = useState(emptyAddress);
  const [deliveryAddress, setDeliveryAddress] = useState(emptyAddress);
  const [editingBilling, setEditingBilling] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (session?.user) {
      getAddressesAction().then((result) => {
        if (result.success) {
          if (result.billingAddress) {
            setBillingAddress({
              firstName: result.billingAddress.firstName || "",
              lastName: result.billingAddress.lastName || "",
              company: result.billingAddress.company || "",
              vat: result.billingAddress.vat || "",
              address1: result.billingAddress.address1 || "",
              address2: result.billingAddress.address2 || "",
              postalCode: result.billingAddress.postalCode || "",
              city: result.billingAddress.city || "",
              country: result.billingAddress.country || "",
              phone: result.billingAddress.phone || "",
            });
          } else {
            setEditingBilling(true);
          }
          if (result.deliveryAddress) {
            setDeliveryAddress({
              firstName: result.deliveryAddress.firstName || "",
              lastName: result.deliveryAddress.lastName || "",
              company: result.deliveryAddress.company || "",
              vat: result.deliveryAddress.vat || "",
              address1: result.deliveryAddress.address1 || "",
              address2: result.deliveryAddress.address2 || "",
              postalCode: result.deliveryAddress.postalCode || "",
              city: result.deliveryAddress.city || "",
              country: result.deliveryAddress.country || "",
              phone: result.deliveryAddress.phone || "",
            });
          } else {
            setEditingDelivery(true);
          }
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
        billingAddress,
        deliveryAddress,
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

  const isAddressComplete = (addr) => {
    const required = [
      "firstName",
      "lastName",
      "company",
      "address1",
      "postalCode",
      "city",
      "country",
      "phone",
    ];
    return required.every((f) => addr[f]?.trim());
  };

  const canOrder =
    orderName.trim() &&
    isAddressComplete(billingAddress) &&
    isAddressComplete(deliveryAddress) &&
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{t("checkout.billingAddressTitle")}</CardTitle>
              {!editingBilling && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingBilling(true)}
                  disabled={isOrdering}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  {t("checkout.edit")}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingBilling ? (
                <div className="space-y-4">
                  <AddressForm
                    address={billingAddress}
                    onChange={setBillingAddress}
                    disabled={isOrdering}
                    type="billing"
                    t={t}
                  />
                  {isAddressComplete(billingAddress) && (
                    <Button
                      onClick={() => setEditingBilling(false)}
                      disabled={isOrdering}
                    >
                      {t("checkout.save")}
                    </Button>
                  )}
                </div>
              ) : (
                <AddressDisplay address={billingAddress} type="billing" t={t} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{t("checkout.deliveryAddressTitle")}</CardTitle>
              {!editingDelivery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingDelivery(true)}
                  disabled={isOrdering}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  {t("checkout.edit")}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingDelivery ? (
                <div className="space-y-4">
                  <AddressForm
                    address={deliveryAddress}
                    onChange={setDeliveryAddress}
                    disabled={isOrdering}
                    type="delivery"
                    t={t}
                  />
                  {isAddressComplete(deliveryAddress) && (
                    <Button
                      onClick={() => setEditingDelivery(false)}
                      disabled={isOrdering}
                    >
                      {t("checkout.save")}
                    </Button>
                  )}
                </div>
              ) : (
                <AddressDisplay
                  address={deliveryAddress}
                  type="delivery"
                  t={t}
                />
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
