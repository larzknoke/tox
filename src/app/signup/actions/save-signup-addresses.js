"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { USER_ADDRESS_TYPES } from "@/lib/user-addresses";

const addressSchema = z.object({
  label: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().min(1),
  vat: z.string().optional(),
  address1: z.string().min(1),
  address2: z.string().optional(),
  postalCode: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().min(1),
});

const payloadSchema = z.object({
  email: z.string().email(),
  deliveryAddress: addressSchema,
  billingAddress: addressSchema,
});

function trimAddressFields(address, type) {
  return {
    label: address.label.trim(),
    firstName: address.firstName.trim(),
    lastName: address.lastName.trim(),
    company: address.company.trim(),
    vat:
      type === USER_ADDRESS_TYPES.billing ? address.vat?.trim() || null : null,
    address1: address.address1.trim(),
    address2: address.address2?.trim() || null,
    postalCode: address.postalCode.trim(),
    city: address.city.trim(),
    country: address.country.trim(),
    phone: address.phone.trim(),
  };
}

export async function saveSignupAddressesAction(payload) {
  const parsed = payloadSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid address payload",
    };
  }

  const { email, deliveryAddress, billingAddress } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.userAddress.deleteMany({
        where: {
          userId: user.id,
          type: {
            in: [USER_ADDRESS_TYPES.delivery, USER_ADDRESS_TYPES.billing],
          },
        },
      });

      const createdDeliveryAddress = await tx.userAddress.create({
        data: {
          userId: user.id,
          type: USER_ADDRESS_TYPES.delivery,
          ...trimAddressFields(deliveryAddress, USER_ADDRESS_TYPES.delivery),
        },
      });

      const createdBillingAddress = await tx.userAddress.create({
        data: {
          userId: user.id,
          type: USER_ADDRESS_TYPES.billing,
          ...trimAddressFields(billingAddress, USER_ADDRESS_TYPES.billing),
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          defaultDeliveryAddressId: createdDeliveryAddress.id,
          defaultBillingAddressId: createdBillingAddress.id,
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to save signup addresses:", error);
    return { success: false, error: "Failed to save addresses" };
  }
}
