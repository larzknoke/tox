"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";

const schema = z.object({
  reference: z.string().min(1, "Reference is required").toUpperCase(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  pricePerPack: z.coerce.number().positive("Price must be positive"),
  quantityPerPack: z.coerce
    .number()
    .int()
    .positive("Quantity must be positive"),
  isActive: z.boolean().default(true),
});

export async function createProductAction(data) {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) throw new Error("Unauthorized");

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid product data");
  }

  const {
    reference,
    name,
    description,
    pricePerPack,
    quantityPerPack,
    isActive,
  } = parsed.data;

  await prisma.product.create({
    data: {
      reference,
      name,
      description,
      pricePerPack,
      quantityPerPack,
      isActive,
    },
  });

  revalidatePath("/admin/products");
}
