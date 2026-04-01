"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  birthday: z.string().optional(),
  gender: z.string().optional(),
  stammverein: z.string().optional(),
  teamIds: z.array(z.number()).optional().default([]),
});

export async function createPlayerAction(formData) {
  console.log("createPlayerAction called");
  const data = Object.fromEntries(formData);

  // Parse teamIds from JSON string if present
  const teamIds = data.teamIds ? JSON.parse(data.teamIds) : [];

  const parsed = schema.safeParse({
    name: data.name,
    birthday: data.birthday || undefined,
    gender: data.gender || undefined,
    stammverein: data.stammverein || undefined,
    teamIds: teamIds,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  await prisma.player.create({
    data: {
      name: parsed.data.name,
      birthday: parsed.data.birthday ? new Date(parsed.data.birthday) : null,
      gender: parsed.data.gender || null,
      stammverein: parsed.data.stammverein || null,
      playerTeams: {
        create: parsed.data.teamIds.map((teamId) => ({
          team: { connect: { id: teamId } },
        })),
      },
    },
  });

  revalidatePath("/player");
}
