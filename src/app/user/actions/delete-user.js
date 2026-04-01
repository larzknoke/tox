"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteUserAction(userId) {
  await prisma.user.delete({
    where: { id: userId },
  });

  // Server-Cache für Benutzerliste invalidieren
  revalidatePath("/user");
}
