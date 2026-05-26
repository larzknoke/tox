"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendUserApprovedNotification } from "@/lib/send-user-approved-email";

const schema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  banned: z.boolean(),
  approved: z.boolean(),
  banReason: z.string().optional(),
});

export async function updateUserAction(formData) {
  const data = Object.fromEntries(formData);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const parsed = schema.safeParse({
    id: data.id,
    name: data.name,
    email: data.email,
    banned: data.banned === "true",
    approved: data.approved === "true",
    banReason: data.banReason || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid user data");
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: parsed.data.id },
    select: {
      approved: true,
      banReason: true,
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  const isTransitioningToApproved =
    !existingUser.approved && parsed.data.approved;

  let banned = parsed.data.banned;
  let banReason = parsed.data.banReason || null;

  if (!parsed.data.approved) {
    banned = true;
    banReason = banReason || "PENDING_APPROVAL";
  }

  if (parsed.data.approved && existingUser.banReason === "PENDING_APPROVAL") {
    banned = false;
    banReason = null;
  }

  const updatedUser = await prisma.user.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      approved: parsed.data.approved,
      approvedAt: parsed.data.approved
        ? existingUser.approved
          ? undefined
          : new Date()
        : null,
      approvedBy: parsed.data.approved
        ? existingUser.approved
          ? undefined
          : session?.user?.id || null
        : null,
      banned,
      banReason,
    },
  });

  if (isTransitioningToApproved) {
    try {
      await sendUserApprovedNotification(updatedUser);
    } catch (error) {
      console.error("Failed to send approval email:", error);
    }
  }

  revalidatePath("/user");
}
