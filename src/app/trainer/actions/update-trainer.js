"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";

const schema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name ist erforderlich"),
  stammverein: z.string().optional(),
  licenseType: z.string().optional(),
});

export async function updateTrainerAction(formData) {
  console.log("updateTrainerAction called");
  const session = await requireSession();
  const data = Object.fromEntries(formData);

  const parsed = schema.safeParse({
    id: parseInt(data.id),
    name: data.name,
    stammverein: data.stammverein || undefined,
    licenseType: data.licenseType || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { trainerId: true },
  });

  const isAdmin = hasRole(session, "admin");

  if (!isAdmin && currentUser?.trainerId !== parsed.data.id) {
    throw new Error(
      "Keine Berechtigung: Sie können nur Ihren verknüpften Trainer bearbeiten.",
    );
  }

  await prisma.trainer.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      stammverein: parsed.data.stammverein || null,
      licenseType: parsed.data.licenseType || null,
    },
  });

  revalidatePath("/trainer");
}
