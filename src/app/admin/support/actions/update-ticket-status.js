"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";
import { isValidSupportTicketStatus } from "@/lib/support-ticket";

export async function updateTicketStatusAction(ticketId, status) {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) throw new Error("Unauthorized");

  if (!isValidSupportTicketStatus(status)) {
    throw new Error("Invalid status");
  }

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status },
  });

  revalidatePath("/admin/support");
}
