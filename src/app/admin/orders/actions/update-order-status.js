"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";

export async function updateOrderStatusAction(orderId, status) {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) throw new Error("Unauthorized");

  const validStatuses = ["IN_PROGRESS", "SHIPPED"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      shippedDate: status === "SHIPPED" ? new Date() : null,
    },
    select: {
      id: true,
      status: true,
      shippedDate: true,
    },
  });

  revalidatePath("/admin/orders");

  return {
    id: updatedOrder.id,
    status: updatedOrder.status,
    shippedDate: updatedOrder.shippedDate?.toISOString() ?? null,
  };
}
