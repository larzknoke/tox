"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";

export async function deleteProductAction(id) {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) throw new Error("Unauthorized");

  await prisma.product.delete({ where: { id } });

  revalidatePath("/admin/products");
}
