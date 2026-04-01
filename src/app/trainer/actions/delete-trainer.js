"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteTrainerAction(trainerId) {
  await prisma.trainer.delete({
    where: { id: trainerId },
  });

  // Server-Cache für Trainerliste invalidieren
  revalidatePath("/trainer");
}
