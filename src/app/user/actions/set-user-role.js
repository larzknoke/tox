"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasRole } from "@/lib/roles";
import prisma from "@/lib/prisma";

const schema = z.object({
  userId: z.string(),
  role: z.enum(["admin", "kassenwart", "trainer"]),
});

export async function setUserRoleAction(formData) {
  // Get current session to verify admin privileges
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  console.log("session", session);

  if (!session) {
    throw new Error("Nicht authentifiziert");
  }

  if (!hasRole(session, "admin")) {
    throw new Error("Keine Berechtigung");
  }

  const data = Object.fromEntries(formData);

  const parsed = schema.safeParse({
    userId: data.userId,
    role: data.role,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  try {
    // Update user role directly via Prisma since we've verified admin status
    const updatedUser = await prisma.user.update({
      where: { id: parsed.data.userId },
      data: {
        role: parsed.data.role,
      },
    });

    console.log("User role updated:", updatedUser);
    revalidatePath("/user");
  } catch (error) {
    console.error("Error setting user role:", error);
    throw new Error("Fehler beim Setzen der Benutzerrolle");
  }
}
