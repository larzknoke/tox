import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import OrderTable from "./components/OrderTable";

async function getOrders() {
  return prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: true,
      billingAddress: true,
      deliveryAddress: true,
      invoice: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

async function OrdersContent() {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) redirect("/");

  const raw = await getOrders();
  const orders = raw.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    confirmationEmailSentAt:
      order.confirmationEmailSentAt?.toISOString() ?? null,
    invoiceEmailSentAt: order.invoiceEmailSentAt?.toISOString() ?? null,
    items: order.items.map((item) => ({
      ...item,
      pricePerPack: Number(item.pricePerPack),
      totalPrice: Number(item.totalPrice),
    })),
    invoice: order.invoice
      ? {
          ...order.invoice,
          totalAmount: Number(order.invoice.totalAmount),
          invoiceDate: order.invoice.invoiceDate.toISOString(),
          sentAt: order.invoice.sentAt?.toISOString() ?? null,
          createdAt: order.invoice.createdAt.toISOString(),
          updatedAt: order.invoice.updatedAt.toISOString(),
        }
      : null,
    billingAddress: order.billingAddress
      ? {
          ...order.billingAddress,
          createdAt: order.billingAddress.createdAt.toISOString(),
          updatedAt: order.billingAddress.updatedAt.toISOString(),
        }
      : null,
    deliveryAddress: order.deliveryAddress
      ? {
          ...order.deliveryAddress,
          createdAt: order.deliveryAddress.createdAt.toISOString(),
          updatedAt: order.deliveryAddress.updatedAt.toISOString(),
        }
      : null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Order Management" />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <OrderTable orders={orders} />
      </Suspense>
    </div>
  );
}

export default OrdersContent;
