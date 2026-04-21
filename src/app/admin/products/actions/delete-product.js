"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";

const schema = z.coerce.number().int().positive();

export async function deleteProductAction(id) {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) throw new Error("Unauthorized");

  const parsed = schema.safeParse(id);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid product id");
  }

  await prisma.product.delete({ where: { id: parsed.data } });

  revalidatePath("/admin/products");
}
