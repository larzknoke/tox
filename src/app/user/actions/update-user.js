"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";

const schema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  banned: z.boolean(),
  banReason: z.string().optional(),
});

export async function updateUserAction(formData) {
  console.log("updateUserAction called");
  const data = Object.fromEntries(formData);

  const parsed = schema.safeParse({
    id: data.id,
    name: data.name,
    email: data.email,
    banned: data.banned === "true",
    banReason: data.banReason || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  await prisma.user.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      banned: parsed.data.banned,
      banReason: parsed.data.banReason || null,
    },
  });

  revalidatePath("/user");
}
