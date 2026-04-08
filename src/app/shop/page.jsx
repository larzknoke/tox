import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function ShopPage() {
  const raw = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { reference: "asc" },
  });
  const products = raw.map((p) => ({
    ...p,
    pricePerPack: Number(p.pricePerPack),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader title="Shop" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.reference}`}
            className="group focus:outline-none"
          >
            <Card className="h-full transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-primary">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Package className="h-6 w-6" />
                  </div>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "In Stock" : "Unavailable"}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-base leading-snug">
                  {product.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground font-mono">
                  {product.reference}
                </p>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground line-clamp-3">
                {product.description}
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-0">
                <div>
                  <span className="text-lg font-semibold">
                    €{product.pricePerPack.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    / pack ({product.quantityPerPack} tickets)
                  </span>
                </div>
                <Button size="sm" variant="outline" tabIndex={-1}>
                  View
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
