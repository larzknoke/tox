"use server";

import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "@/pdf/invoice-pdf";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";

export async function generateInvoicePDFAction(orderId) {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) throw new Error("Unauthorized");

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        billingAddress: true,
        deliveryAddress: true,
        items: true,
        invoice: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    const blob = await pdf(InvoicePDF({ order })).toBlob();
    const buffer = await blob.arrayBuffer();

    const filename = `Invoice_${order.id}_${order.name.replace(/\s+/g, "_")}.pdf`;

    return {
      success: true,
      pdfBuffer: Array.from(new Uint8Array(buffer)),
      filename,
    };
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return {
      success: false,
      error: error.message || "Failed to generate PDF",
    };
  }
}
