"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";

export async function deleteBillAction(billId) {
  const session = await requireSession();

  const isAdminOrKassenwart =
    hasRole(session, "admin") || hasRole(session, "kassenwart");

  if (!isAdminOrKassenwart) {
    throw new Error("Keine Berechtigung zum Löschen");
  }

  if (!billId) {
    throw new Error("Bill ID ist erforderlich");
  }

  await prisma.bill.delete({
    where: { id: billId },
  });

  revalidatePath("/abrechnung");

  return { success: true };
}
