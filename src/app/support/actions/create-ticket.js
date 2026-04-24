"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  supportTicketAdminEmail,
  supportTicketUserConfirmationEmail,
} from "@/email/supportTicketEmail";
import { isValidSupportTicketType } from "@/lib/support-ticket";

export async function createSupportTicketAction(payload) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  const name = payload?.name?.trim();
  const email = payload?.email?.trim();
  const phone = payload?.phone?.trim();
  const subject = payload?.subject?.trim();
  const type = payload?.type;
  const description = payload?.description?.trim();
  const locale = payload?.locale === "fr" ? "fr" : "en";

  if (!name || !email || !phone || !subject || !description || !type) {
    return { success: false, error: "Missing required fields" };
  }

  if (!isValidSupportTicketType(type)) {
    return { success: false, error: "Invalid ticket type" };
  }

  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        name,
        email,
        phone,
        subject,
        type,
        description,
        status: "open",
      },
    });

    const adminPayload = supportTicketAdminEmail(ticket);
    const userPayload = supportTicketUserConfirmationEmail(ticket, locale);

    const emailTasks = [];

    if (process.env.ADMIN_EMAIL) {
      emailTasks.push(
        sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: adminPayload.subject,
          html: adminPayload.html,
          text: adminPayload.text,
        }),
      );
    }

    emailTasks.push(
      sendEmail({
        to: email,
        subject: userPayload.subject,
        html: userPayload.html,
        text: userPayload.text,
      }),
    );

    try {
      await Promise.all(emailTasks);
    } catch (emailError) {
      console.error("Support ticket emails failed:", emailError);
    }

    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return { success: false, error: "Failed to create support ticket" };
  }
}
