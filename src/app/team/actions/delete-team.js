"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function deleteTeamAction(id) {
  await prisma.team.delete({
    where: { id },
  });

  revalidatePath("/team");
}
