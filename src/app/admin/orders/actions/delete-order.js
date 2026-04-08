"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";

export async function deleteOrderAction(orderId) {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) throw new Error("Unauthorized");

  await prisma.order.delete({ where: { id: orderId } });

  revalidatePath("/admin/orders");
}
