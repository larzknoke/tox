"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";
import { persistOrderStatus } from "./order-status-helpers";

export async function updateOrderStatusAction(orderId, status) {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) throw new Error("Unauthorized");

  const updatedOrder = await persistOrderStatus(orderId, status);

  revalidatePath("/admin/orders");
  return updatedOrder;
}
