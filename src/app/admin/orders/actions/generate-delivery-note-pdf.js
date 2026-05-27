"use server";

import { pdf } from "@react-pdf/renderer";
import DeliveryNotePDF from "@/pdf/delivery-note-pdf";
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

export async function generateDeliveryNotePDFAction(orderId, locale) {
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
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    const resolvedLocale = getActiveLocale(locale) ?? (await getLocale());
    const messages = getMessages(resolvedLocale);

    const blob = await pdf(
      DeliveryNotePDF({
        order,
        locale: resolvedLocale,
        messages: messages?.pdf?.deliveryNote,
      }),
    ).toBlob();
    const buffer = await blob.arrayBuffer();

    const filename = `Delivery_Note_${order.id}_${order.name.replace(/\s+/g, "_")}.pdf`;

    return {
      success: true,
      pdfBuffer: Array.from(new Uint8Array(buffer)),
      filename,
    };
  } catch (error) {
    console.error("Error generating delivery note PDF:", error);
    return {
      success: false,
      error: error.message || "Failed to generate delivery note PDF",
    };
  }
}
