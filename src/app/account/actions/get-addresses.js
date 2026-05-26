"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import {
  getUserAddressCollectionKey,
  serializeUserAddress,
  USER_ADDRESS_TYPES,
} from "@/lib/user-addresses";

export async function getAddressesAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        defaultBillingAddressId: true,
        defaultDeliveryAddressId: true,
        addresses: {
          orderBy: [{ createdAt: "desc" }],
        },
      },
    });

    const billingAddresses = [];
    const deliveryAddresses = [];

    for (const address of user?.addresses ?? []) {
      const collectionKey = getUserAddressCollectionKey(address.type);
      const serializedAddress = serializeUserAddress(address);

      if (collectionKey === "billingAddresses") {
        billingAddresses.push(serializedAddress);
      } else {
        deliveryAddresses.push(serializedAddress);
      }
    }

    const defaultBillingAddress =
      billingAddresses.find(
        (address) => address.id === user?.defaultBillingAddressId,
      ) ??
      billingAddresses[0] ??
      null;
    const defaultDeliveryAddress =
      deliveryAddresses.find(
        (address) => address.id === user?.defaultDeliveryAddressId,
      ) ??
      deliveryAddresses[0] ??
      null;

    return {
      success: true,
      billingAddresses,
      deliveryAddresses,
      defaultBillingAddressId: defaultBillingAddress?.id ?? null,
      defaultDeliveryAddressId: defaultDeliveryAddress?.id ?? null,
      defaultBillingAddress,
      defaultDeliveryAddress,
    };
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return { success: false, error: "Failed to fetch addresses" };
  }
}
