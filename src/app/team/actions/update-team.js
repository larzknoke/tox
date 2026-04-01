"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";

const schema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name ist erforderlich"),
  trainerIds: z.array(z.number()).optional().default([]),
});

export async function updateTeamAction(formData) {
  console.log("updateTeamAction called");
  const data = Object.fromEntries(formData);

  // Parse trainerIds from JSON string if present
  const trainerIds = data.trainerIds ? JSON.parse(data.trainerIds) : [];

  const parsed = schema.safeParse({
    id: parseInt(data.id),
    name: data.name,
    trainerIds: trainerIds,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  // Delete existing trainer relations and create new ones
  await prisma.team.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      trainerTeams: {
        deleteMany: {},
        create: parsed.data.trainerIds.map((trainerId) => ({
          trainer: { connect: { id: trainerId } },
        })),
      },
    },
  });

  revalidatePath("/team");
}
