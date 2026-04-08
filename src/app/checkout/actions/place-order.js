"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function placeOrderAction({
  name,
  billingAddress,
  deliveryAddress,
  items,
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  if (!name?.trim()) {
    return { success: false, error: "Order name is required" };
  }

  if (!items?.length) {
    return { success: false, error: "Cart is empty" };
  }

  const requiredFields = [
    "firstName",
    "lastName",
    "company",
    "address1",
    "postalCode",
    "city",
    "country",
    "phone",
  ];

  for (const field of requiredFields) {
    if (!billingAddress?.[field]?.trim()) {
      return { success: false, error: `Billing address: ${field} is required` };
    }
    if (!deliveryAddress?.[field]?.trim()) {
      return {
        success: false,
        error: `Delivery address: ${field} is required`,
      };
    }
  }

  try {
    // Verify all products exist and are active
    const productIds = items.map((i) => i.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== items.length) {
      return {
        success: false,
        error: "Some products are no longer available",
      };
    }

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const order = await prisma.$transaction(async (tx) => {
      // Create snapshot addresses for the order
      const billingSnap = await tx.address.create({
        data: {
          firstName: billingAddress.firstName,
          lastName: billingAddress.lastName,
          company: billingAddress.company,
          address1: billingAddress.address1,
          address2: billingAddress.address2 || null,
          postalCode: billingAddress.postalCode,
          city: billingAddress.city,
          country: billingAddress.country,
          phone: billingAddress.phone,
        },
      });

      const deliverySnap = await tx.address.create({
        data: {
          firstName: deliveryAddress.firstName,
          lastName: deliveryAddress.lastName,
          company: deliveryAddress.company,
          address1: deliveryAddress.address1,
          address2: deliveryAddress.address2 || null,
          postalCode: deliveryAddress.postalCode,
          city: deliveryAddress.city,
          country: deliveryAddress.country,
          phone: deliveryAddress.phone,
        },
      });

      // Build order items with verified prices from DB
      const orderItems = items.map((item) => {
        const product = productMap[item.id];
        const pricePerPack = Number(product.pricePerPack);
        const totalPrice = pricePerPack * item.quantity;

        return {
          productId: product.id,
          reference: product.reference,
          designation: product.name,
          quantityPerPack: product.quantityPerPack,
          numberOfPacks: item.quantity,
          pricePerPack,
          totalPrice,
        };
      });

      const created = await tx.order.create({
        data: {
          name: name.trim(),
          userId: session.user.id,
          billingAddressId: billingSnap.id,
          deliveryAddressId: deliverySnap.id,
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });

      return created;
    });

    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (error) {
    console.error("Error placing order:", error);
    return { success: false, error: "Failed to place order" };
  }
}
