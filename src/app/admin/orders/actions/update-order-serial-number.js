"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";

export async function updateOrderSerialNumberAction(orderId, serialNumber) {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) throw new Error("Unauthorized");

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { serialNumber: serialNumber?.trim() || null },
    select: { id: true, serialNumber: true },
  });

  revalidatePath("/admin/orders");
  return updated;
}
