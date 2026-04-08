"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";

export async function updateOrderStatusAction(orderId, status) {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) throw new Error("Unauthorized");

  const validStatuses = ["PENDING", "VALIDATED", "PROCESSING", "SHIPPED"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath("/admin/orders");
}
