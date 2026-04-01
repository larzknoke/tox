"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function deletePlayerAction(id) {
  await prisma.player.delete({
    where: { id },
  });

  revalidatePath("/player");
}
