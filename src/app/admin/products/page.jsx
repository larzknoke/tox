import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import ProductTable from "./components/ProductTable";

async function getProducts() {
  return prisma.product.findMany({ orderBy: { reference: "asc" } });
}

async function ProductsContent() {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) redirect("/");

  const raw = await getProducts();
  const products = raw.map((p) => ({
    ...p,
    pricePerPack: Number(p.pricePerPack),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Products" />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ProductTable products={products} />
      </Suspense>
    </div>
  );
}

export default ProductsContent;
