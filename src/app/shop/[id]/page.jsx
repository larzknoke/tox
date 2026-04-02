"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, ArrowLeft, ShoppingCart } from "lucide-react";

const DUMMY_PRODUCTS = [
  {
    id: "bofbsm",
    reference: "BOFBSM",
    nameFr: "BOCA SANS MASSICOT PRÉ PERFORÉ",
    nameEn: "BOCA WITHOUT CUTTER PRE-PERFORATED",
    pricePerPack: 42.5,
    quantityPerPack: 1000,
    isActive: true,
    description:
      "Pre-perforated thermal ticket roll for BOCA printers, without cutter. Compatible with standard box-office configurations.",
    details: [
      { label: "Reference", value: "BOFBSM" },
      { label: "Quantity per pack", value: "1,000 tickets" },
      { label: "Price per pack (excl. VAT)", value: "€42.50" },
      { label: "Printer compatibility", value: "BOCA" },
      { label: "Perforation", value: "Pre-perforated" },
      { label: "Cutter", value: "No" },
    ],
  },
  {
    id: "iepram",
    reference: "IEPRAM",
    nameFr: "MIXTE IER PRÉ PERFORÉ",
    nameEn: "IER MIXED PRE-PERFORATED",
    pricePerPack: 38.0,
    quantityPerPack: 1000,
    isActive: true,
    description:
      "Mixed pre-perforated thermal ticket roll for IER printers. Suitable for all mixed ticketing environments.",
    details: [
      { label: "Reference", value: "IEPRAM" },
      { label: "Quantity per pack", value: "1,000 tickets" },
      { label: "Price per pack (excl. VAT)", value: "€38.00" },
      { label: "Printer compatibility", value: "IER" },
      { label: "Perforation", value: "Pre-perforated" },
      { label: "Type", value: "Mixed" },
    ],
  },
];

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const product = DUMMY_PRODUCTS.find((p) => p.id === id);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader title="Product Details" />

      <div className="max-w-2xl w-full">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
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
                {product.isActive ? "In Stock" : "Unavailable"}
              </Badge>
            </div>
            <h2 className="text-xl font-semibold leading-tight">
              {product.nameEn}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {product.nameFr}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {product.description}
        </p>

        <Separator className="mb-6" />

        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-8">
          {product.details.map(({ label, value }) => (
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
              per pack of {product.quantityPerPack.toLocaleString()} tickets,
              excl. VAT
            </p>
          </div>
          <Button size="lg" className="gap-2" disabled>
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
