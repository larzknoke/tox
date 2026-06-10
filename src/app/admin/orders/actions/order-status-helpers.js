import prisma from "@/lib/prisma";

export async function persistOrderStatus(orderId, status) {
  const validStatuses = ["IN_PROGRESS", "SHIPPED"];

  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      shippedDate: status === "SHIPPED" ? new Date() : null,
    },
    select: {
      id: true,
      status: true,
      shippedDate: true,
    },
  });

  return {
    id: updatedOrder.id,
    status: updatedOrder.status,
    shippedDate: updatedOrder.shippedDate?.toISOString() ?? null,
  };
}
