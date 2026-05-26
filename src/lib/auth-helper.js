import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "./prisma.js";

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  // Check if user's email is verified
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, approved: true },
  });

  if (!user?.emailVerified) {
    redirect("/auth/verify-email-pending");
  }

  if (!user?.approved) {
    redirect("/auth/verify-email-pending?approval=pending");
  }

  return session;
}
