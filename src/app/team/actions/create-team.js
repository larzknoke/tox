"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  trainerIds: z.array(z.number()).optional().default([]),
});

export async function createTeamAction(formData) {
  console.log("createTeamAction called");
  const data = Object.fromEntries(formData);

  // Parse trainerIds from JSON string if present
  const trainerIds = data.trainerIds ? JSON.parse(data.trainerIds) : [];

  const parsed = schema.safeParse({
    name: data.name,
    trainerIds: trainerIds,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  await prisma.team.create({
    data: {
      name: parsed.data.name,
      trainerTeams: {
        create: parsed.data.trainerIds.map((trainerId) => ({
          trainer: { connect: { id: trainerId } },
        })),
      },
    },
  });

  revalidatePath("/team");
}
