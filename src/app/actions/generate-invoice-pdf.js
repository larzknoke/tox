"use server";

import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "@/pdf/invoice-pdf";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";
import { getMessages, SUPPORTED_LOCALES } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

function getActiveLocale(locale) {
  if (locale && SUPPORTED_LOCALES.includes(locale)) {
    return locale;
  }
  return null;
}

export async function generateInvoicePDFAction(orderId, locale) {
  const session = await requireSession();
  const isAdmin = hasRole(session, "ADMIN");

  try {
    const order = await prisma.order.findFirst({
      where: isAdmin
        ? { id: orderId }
        : {
            id: orderId,
            userId: session.user.id,
          },
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

    const resolvedLocale = getActiveLocale(locale) ?? (await getLocale());
    const messages = getMessages(resolvedLocale);

    const blob = await pdf(
      InvoicePDF({
        order,
        locale: resolvedLocale,
        messages: messages?.pdf?.invoice,
      }),
    ).toBlob();
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
