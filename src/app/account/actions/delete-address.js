"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { fromUserAddressType, getUserDefaultField } from "@/lib/user-addresses";

export async function deleteAddressAction(addressId) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = session.user.id;

    const result = await prisma.$transaction(async (tx) => {
      const address = await tx.userAddress.findFirst({
        where: {
          id: Number(addressId),
          userId,
        },
      });

      if (!address) {
        throw new Error("Address not found");
      }

      const defaultField = getUserDefaultField(address.type);
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          defaultBillingAddressId: true,
          defaultDeliveryAddressId: true,
        },
      });

      await tx.userAddress.delete({
        where: { id: address.id },
      });

      let nextDefaultAddressId = user?.[defaultField] ?? null;

      if (nextDefaultAddressId === address.id) {
        const replacement = await tx.userAddress.findFirst({
          where: {
            userId,
            type: address.type,
          },
          orderBy: [{ createdAt: "desc" }],
        });

        nextDefaultAddressId = replacement?.id ?? null;

        await tx.user.update({
          where: { id: userId },
          data: {
            [defaultField]: nextDefaultAddressId,
          },
        });
      }

      return {
        type: fromUserAddressType(address.type),
        addressId: address.id,
        defaultAddressId: nextDefaultAddressId,
      };
    });

    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error("Error deleting address:", error);
    return { success: false, error: "Failed to delete address" };
  }
}
