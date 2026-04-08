"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function saveAddressAction(type, addressData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        billingAddressId: true,
        deliveryAddressId: true,
      },
    });

    const existingAddressId =
      type === "billing" ? user?.billingAddressId : user?.deliveryAddressId;

    const addressFields = {
      firstName: addressData.firstName,
      lastName: addressData.lastName,
      company: addressData.company,
      address1: addressData.address1,
      address2: addressData.address2 || null,
      postalCode: addressData.postalCode,
      city: addressData.city,
      country: addressData.country,
      phone: addressData.phone,
    };

    let address;

    if (existingAddressId) {
      address = await prisma.address.update({
        where: { id: existingAddressId },
        data: addressFields,
      });
    } else {
      address = await prisma.address.create({ data: addressFields });

      const linkField =
        type === "billing"
          ? { billingAddressId: address.id }
          : { deliveryAddressId: address.id };

      await prisma.user.update({
        where: { id: userId },
        data: linkField,
      });
    }

    return { success: true, address };
  } catch (error) {
    console.error("Error saving address:", error);
    return { success: false, error: "Failed to save address" };
  }
}
