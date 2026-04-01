"use server";

import prisma from "@/lib/prisma";

export async function getBillDetailsAction(billId) {
  try {
    if (!billId) {
      throw new Error("Bill ID ist erforderlich");
    }

    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: {
        user: true,
        trainer: true,
        team: true,
        events: {
          orderBy: { startDate: "asc" },
        },
      },
    });

    if (!bill) {
      throw new Error("Abrechnung nicht gefunden");
    }

    return { success: true, bill };
  } catch (error) {
    console.error("Error fetching bill details:", error);
    return { success: false, error: error.message };
  }
}
