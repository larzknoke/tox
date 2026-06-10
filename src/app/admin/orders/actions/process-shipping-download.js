"use server";

import JSZip from "jszip";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";
import { sendEmail } from "@/lib/email";
import { getMessages, SUPPORTED_LOCALES } from "@/lib/i18n";
import { generateInvoicePDFAction } from "@/app/actions/generate-invoice-pdf";
import { generateDeliveryNotePDFAction } from "./generate-delivery-note-pdf";
import { generateLabelPDFAction } from "./generate-label-pdf";
import { persistOrderStatus } from "./order-status-helpers";
import { orderShippedEmail } from "@/email/orderShippedEmail";

function getActiveLocale(locale) {
  if (locale && SUPPORTED_LOCALES.includes(locale)) {
    return locale;
  }

  return "en";
}

function buildSafeName(orderName) {
  return orderName.replace(/\s+/g, "_");
}

export async function processShippingDownloadAction({
  orderId,
  locale,
  downloadZip,
  downloadLabelOnly,
  markAsShipped,
  notifyCustomer,
}) {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) {
    throw new Error("Unauthorized");
  }

  if (downloadZip && downloadLabelOnly) {
    return { success: false, error: "Please select only one download option" };
  }

  if (!downloadZip && !downloadLabelOnly && !markAsShipped && !notifyCustomer) {
    return { success: false, error: "Please select at least one action" };
  }

  const resolvedLocale = getActiveLocale(locale);

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: true,
        billingAddress: true,
        deliveryAddress: true,
        invoice: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (notifyCustomer && !order.user?.email) {
      return { success: false, error: "Customer has no email address" };
    }

    let fileBuffer = null;
    let filename = null;
    let mimeType = null;

    if (downloadZip) {
      const labelResult = await generateLabelPDFAction(orderId);
      if (!labelResult.success) {
        throw new Error(labelResult.error);
      }

      const [invoiceResult, deliveryNoteResult] = await Promise.all([
        generateInvoicePDFAction(orderId, resolvedLocale),
        generateDeliveryNotePDFAction(orderId, resolvedLocale),
      ]);

      if (!invoiceResult.success) {
        throw new Error(invoiceResult.error);
      }

      if (!deliveryNoteResult.success) {
        throw new Error(deliveryNoteResult.error);
      }

      const zip = new JSZip();
      zip.file(labelResult.filename, Uint8Array.from(labelResult.pdfBuffer));
      zip.file(
        invoiceResult.filename,
        Uint8Array.from(invoiceResult.pdfBuffer),
      );
      zip.file(
        deliveryNoteResult.filename,
        Uint8Array.from(deliveryNoteResult.pdfBuffer),
      );

      const zipBytes = await zip.generateAsync({ type: "uint8array" });
      fileBuffer = Array.from(zipBytes);
      filename = `Shipping_Documents_${order.id}_${buildSafeName(order.name)}.zip`;
      mimeType = "application/zip";
    } else if (downloadLabelOnly) {
      const labelResult = await generateLabelPDFAction(orderId);
      if (!labelResult.success) {
        throw new Error(labelResult.error);
      }

      fileBuffer = labelResult.pdfBuffer;
      filename = labelResult.filename;
      mimeType = "application/pdf";
    }

    let updatedOrder = null;
    if (markAsShipped) {
      updatedOrder = await persistOrderStatus(orderId, "SHIPPED");
      revalidatePath("/admin/orders");
    }

    const warnings = [];
    if (notifyCustomer) {
      try {
        const messages = getMessages(resolvedLocale);
        const shippingMail = orderShippedEmail(
          {
            ...order,
            status: updatedOrder?.status ?? order.status,
            shippedDate: updatedOrder?.shippedDate ?? order.shippedDate,
          },
          resolvedLocale,
          messages?.email?.orderShipped,
        );

        await sendEmail({
          to: order.user.email,
          subject: shippingMail.subject,
          html: shippingMail.html,
          text: shippingMail.text,
        });
      } catch (error) {
        console.error("Error sending shipped notification:", error);
        warnings.push("customerNotificationFailed");
      }
    }

    return {
      success: true,
      fileBuffer,
      filename,
      mimeType,
      updatedOrder,
      warnings,
    };
  } catch (error) {
    console.error("Error processing shipping download:", error);
    return {
      success: false,
      error: error.message || "Failed to process shipping download",
    };
  }
}