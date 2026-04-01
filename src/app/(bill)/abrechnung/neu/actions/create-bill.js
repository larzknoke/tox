"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { sendEmail } from "@/lib/email";
import { billCreatedEmail } from "@/email/billCreatedEmail";

export async function createBillAction(billData) {
  try {
    // Get current user session
    const session = await requireSession();
    const userId = session.user.id;

    // Validate required fields
    if (
      !billData.trainerId ||
      !billData.teamId ||
      !billData.quarter ||
      !billData.year
    ) {
      throw new Error(
        "Pflichtfelder fehlen: Trainer, Mannschaft, Quartal und Jahr sind erforderlich"
      );
    }

    if (!billData.events || billData.events.length === 0) {
      throw new Error("Keine Trainingstermine vorhanden");
    }

    // Check for duplicate bill
    const existingBill = await prisma.bill.findUnique({
      where: {
        trainerId_teamId_quarter_year: {
          trainerId: billData.trainerId,
          teamId: billData.teamId,
          quarter: billData.quarter,
          year: billData.year,
        },
      },
    });

    if (existingBill) {
      throw new Error(
        `Eine Abrechnung für diesen Trainer, diese Mannschaft und Q${billData.quarter}/${billData.year} existiert bereits`
      );
    }

    // Create bill with events
    const bill = await prisma.bill.create({
      data: {
        trainerId: billData.trainerId,
        teamId: billData.teamId,
        userId: userId,
        iban: billData.iban || null,
        quarter: billData.quarter,
        year: billData.year,
        hourlyRate: billData.hourlyRate,
        totalCost: billData.totalCost,
        status: "unpaid",
        events: {
          create: billData.events,
        },
      },
      include: {
        trainer: true,
        team: true,
        user: true,
        events: true,
      },
    });

    // Send email notification
    try {
      const emailContent = billCreatedEmail(bill);
      await sendEmail({
        to: process.env.KASSENWART_EMAIL,
        cc: session.user?.email || undefined,
        bcc: process.env.ADMIN_EMAIL,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
      console.log("Bill creation email sent successfully");
    } catch (emailError) {
      console.error("Error sending bill creation email:", emailError);
      // Don't fail the entire operation if email fails
    }

    revalidatePath("/abrechnung");

    return { success: true, bill };
  } catch (error) {
    console.error("Error creating bill:", error);
    return { success: false, error: error.message };
  }
}
