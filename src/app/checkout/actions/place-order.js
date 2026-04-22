"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { orderCreatedEmail } from "@/email/orderCreatedEmail";
import { getShippingByTicketCount } from "@/lib/shipping";

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

    const totalTickets = items.reduce((sum, item) => {
      const product = productMap[item.id];
      return sum + product.quantityPerPack * item.quantity;
    }, 0);

    const shipping = getShippingByTicketCount(totalTickets);
    if (shipping.isQuoteRequired) {
      return {
        success: false,
        error:
          "Shipping for this quantity is upon request. Please contact support.",
      };
    }

    const order = await prisma.$transaction(async (tx) => {
      // Create snapshot addresses for the order
      const billingSnap = await tx.address.create({
        data: {
          firstName: billingAddress.firstName,
          lastName: billingAddress.lastName,
          company: billingAddress.company,
          vat: billingAddress.vat || null,
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
          vat: null,
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
        include: {
          items: true,
          user: true,
          billingAddress: true,
          deliveryAddress: true,
        },
      });

      return created;
    });

    // Send confirmation email to customer
    try {
      const emailContent = orderCreatedEmail(order);
      await sendEmail({
        to: session.user.email,
        bcc: process.env.ADMIN_EMAIL,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
      console.log("Order confirmation email sent successfully");
    } catch (emailError) {
      console.error("Error sending order confirmation email:", emailError);
      // Don't fail the entire operation if email fails
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Error placing order:", error);
    return { success: false, error: "Failed to place order" };
  }
}
