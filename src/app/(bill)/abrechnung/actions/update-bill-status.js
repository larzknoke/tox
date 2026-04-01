"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function updateBillStatusAction(billId, status) {
  try {
    if (!billId) {
      throw new Error("Bill ID ist erforderlich");
    }

    if (!["unpaid", "paid"].includes(status)) {
      throw new Error("Ungültiger Status");
    }

    const bill = await prisma.bill.update({
      where: { id: billId },
      data: { status },
      include: {
        trainer: true,
        team: true,
        events: true,
      },
    });

    revalidatePath("/abrechnung");

    return { success: true, bill };
  } catch (error) {
    console.error("Error updating bill status:", error);
    return { success: false, error: error.message };
  }
}
