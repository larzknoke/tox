"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  stammverein: z.string().optional(),
  licenseType: z.string().optional(),
});

export async function createTrainerAction(formData) {
  console.log("createTrainerAction called");
  const data = Object.fromEntries(formData);
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  await prisma.trainer.create({
    data: {
      name: parsed.data.name,
      stammverein: parsed.data.stammverein || null,
      licenseType: parsed.data.licenseType || null,
    },
  });

  // Optional: revalidate die Seite, die Todos anzeigt
  revalidatePath("/trainer");
}
