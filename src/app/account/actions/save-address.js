"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import {
  getAddressFields,
  getUserDefaultField,
  serializeUserAddress,
  toUserAddressType,
} from "@/lib/user-addresses";

export async function saveAddressAction(addressData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = session.user.id;
    const type = toUserAddressType(addressData.type);
    const defaultField = getUserDefaultField(type);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        defaultBillingAddressId: true,
        defaultDeliveryAddressId: true,
      },
    });

    const addressFields = getAddressFields(type, addressData);

    const result = await prisma.$transaction(async (tx) => {
      let address;

      if (addressData.id) {
        const existingAddress = await tx.userAddress.findFirst({
          where: {
            id: Number(addressData.id),
            userId,
            type,
          },
        });

        if (!existingAddress) {
          throw new Error("Address not found");
        }

        address = await tx.userAddress.update({
          where: { id: existingAddress.id },
          data: addressFields,
        });
      } else {
        address = await tx.userAddress.create({
          data: {
            userId,
            type,
            ...addressFields,
          },
        });
      }

      const currentDefaultAddressId = user?.[defaultField] ?? null;
      const shouldSetDefault =
        Boolean(addressData.makeDefault) || currentDefaultAddressId === null;

      if (shouldSetDefault && currentDefaultAddressId !== address.id) {
        await tx.user.update({
          where: { id: userId },
          data: {
            [defaultField]: address.id,
          },
        });
      }

      return {
        address,
        defaultAddressId: shouldSetDefault
          ? address.id
          : currentDefaultAddressId,
      };
    });

    return {
      success: true,
      address: serializeUserAddress(result.address),
      defaultAddressId: result.defaultAddressId,
    };
  } catch (error) {
    console.error("Error saving address:", error);
    return { success: false, error: "Failed to save address" };
  }
}
