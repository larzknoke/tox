"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { fromUserAddressType, getUserDefaultField } from "@/lib/user-addresses";

export async function setDefaultAddressAction(addressId) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const address = await prisma.userAddress.findFirst({
      where: {
        id: Number(addressId),
        userId: session.user.id,
      },
    });

    if (!address) {
      return { success: false, error: "Address not found" };
    }

    const defaultField = getUserDefaultField(address.type);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        [defaultField]: address.id,
      },
    });

    return {
      success: true,
      type: fromUserAddressType(address.type),
      defaultAddressId: address.id,
    };
  } catch (error) {
    console.error("Error setting default address:", error);
    return { success: false, error: "Failed to set default address" };
  }
}
