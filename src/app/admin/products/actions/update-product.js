"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";

const schema = z.object({
  id: z.string().min(1),
  reference: z.string().min(1, "Reference is required").toUpperCase(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  pricePerPack: z.coerce.number().positive("Price must be positive"),
  quantityPerPack: z.coerce.int().positive("Quantity must be positive"),
  isActive: z.boolean(),
});

export async function updateProductAction(data) {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) throw new Error("Unauthorized");

  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  const {
    id,
    reference,
    name,
    description,
    pricePerPack,
    quantityPerPack,
    isActive,
  } = parsed.data;

  await prisma.product.update({
    where: { id },
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
