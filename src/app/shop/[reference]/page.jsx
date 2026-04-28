import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { getLocale } from "@/lib/i18n-server";
import { getMessages, t as interpolate } from "@/lib/i18n";
import AddToCartForm from "./AddToCartForm";

export default async function ProductDetailPage({ params }) {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const t = (key, params = {}) => {
    const parts = key.split(".");
    let value = messages;
    for (const part of parts) {
      if (value == null || typeof value !== "object") return key;
      value = value[part];
    }
    if (typeof value !== "string") return key;
    return interpolate(value, params);
  };

  const { reference } = await params;
  const raw = await prisma.product.findUnique({ where: { reference } });

  if (!raw) notFound();

  const product = {
    ...raw,
    pricePerPack: Number(raw.pricePerPack),
  };

  const details = [
    { label: t("shop.detail.reference"), value: product.reference },
    {
      label: t("shop.detail.quantityPerPack"),
      value: t("shop.detail.ticketsCount", {
        count: product.quantityPerPack.toLocaleString(locale),
      }),
    },
    {
      label: t("shop.detail.pricePerPack"),
      value: `€${product.pricePerPack.toFixed(2)}`,
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader title={t("shop.detail.pageTitle")} />

      <div className="max-w-2xl w-full">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("shop.detail.backToShop")}
        </Link>

        <div className="flex items-start gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">
                {product.reference}
              </span>
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive
                  ? t("shop.badges.inStock")
                  : t("shop.badges.unavailable")}
              </Badge>
            </div>
            <h2 className="text-xl font-semibold leading-tight">
              {product.name}
            </h2>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {product.description}
        </p>

        <Separator className="mb-6" />

        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-8">
          {details.map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>

        <Separator className="mb-6" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">
              €{product.pricePerPack.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("shop.detail.perPackInfo", {
                count: product.quantityPerPack.toLocaleString(locale),
              })}
            </p>
          </div>
          <AddToCartForm product={product} />
        </div>
      </div>
    </div>
  );
}
