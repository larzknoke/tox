"use server";

import { pdf } from "@react-pdf/renderer";
import BillPDF from "@/pdf/bill-pdf";
import prisma from "@/lib/prisma";

export async function generateBillPDFAction(billId) {
  try {
    // Fetch bill details from database
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: {
        trainer: true,
        team: true,
        events: {
          orderBy: {
            startDate: "asc",
          },
        },
      },
    });

    if (!bill) {
      return { success: false, error: "Abrechnung nicht gefunden" };
    }

    // Group events by location
    const groupedEvents = bill.events.reduce((acc, event) => {
      const location = event.location;
      if (!acc[location]) {
        acc[location] = { count: 0, totalHours: 0, totalCost: 0 };
      }

      acc[location].count += 1;
      acc[location].totalHours += event.durationHours;
      acc[location].totalCost += event.cost;

      return acc;
    }, {});

    // Generate PDF blob and convert to array buffer
    const blob = await pdf(BillPDF({ bill, groupedEvents })).toBlob();

    const buffer = await blob.arrayBuffer();

    // Generate filename
    const filename = `Abrechnung_${bill.id}_${bill.trainer.name.replace(
      /\s+/g,
      "_"
    )}_Q${bill.quarter}_${bill.year}.pdf`;

    return {
      success: true,
      pdfBuffer: Array.from(new Uint8Array(buffer)),
      filename,
    };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      success: false,
      error: error.message || "Fehler beim Erstellen des PDFs",
    };
  }
}
