"use server";

import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";
import { buildOrderShipmentPayload, createDpdLabel } from "@/lib/dpd";

function getFaultMessage(faults = []) {
  if (!faults.length) {
    return null;
  }

  return faults
    .map((fault) => [fault.faultCode, fault.message].filter(Boolean).join(": "))
    .join("; ");
}

export async function generateLabelPDFAction(orderId) {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) throw new Error("Unauthorized");

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        deliveryAddress: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    const shipment = buildOrderShipmentPayload(order);
    const { label } = await createDpdLabel({ shipment });

    if (!label.content) {
      return {
        success: false,
        error: getFaultMessage(label.faults) || "DPD did not return label PDF",
      };
    }

    const pdfBuffer = Array.from(Buffer.from(label.content, "base64"));
    const safeName = order.name.replace(/\s+/g, "_");

    return {
      success: true,
      pdfBuffer,
      filename: `DPD_Label_${order.id}_${safeName}.pdf`,
      parcelLabelNumber: label.parcelLabelNumber,
    };
  } catch (error) {
    console.error("Error generating DPD label:", error);
    return {
      success: false,
      error: error.message || "Failed to generate DPD label",
    };
  }
}
