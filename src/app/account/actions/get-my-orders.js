"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function getMyOrdersAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: true,
        billingAddress: true,
        deliveryAddress: true,
        invoice: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Serialize Decimal/Date fields
    const serialized = orders.map((order) => ({
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

    return { success: true, orders: serialized };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}
