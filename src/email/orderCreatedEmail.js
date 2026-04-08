export const orderCreatedEmail = (order) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "VALIDATED":
        return "Confirmed";
      case "PROCESSING":
        return "Processing";
      case "SHIPPED":
        return "Shipped";
      default:
        return status;
    }
  };

  const formatAddress = (addr) =>
    [
      addr.company ? addr.company : null,
      `${addr.firstName} ${addr.lastName}`,
      addr.address1,
      addr.address2 || null,
      `${addr.postalCode} ${addr.city}`,
      addr.country,
      addr.phone,
    ]
      .filter(Boolean)
      .join("<br>");

  const formatAddressText = (addr) =>
    [
      addr.company ? addr.company : null,
      `${addr.firstName} ${addr.lastName}`,
      addr.address1,
      addr.address2 || null,
      `${addr.postalCode} ${addr.city}`,
      addr.country,
      addr.phone,
    ]
      .filter(Boolean)
      .join("\n");

  const totalOrderPrice = order.items.reduce(
    (sum, item) => sum + Number(item.totalPrice),
    0,
  );

  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${item.reference}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${item.designation}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.quantityPerPack}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.numberOfPacks}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.pricePerPack)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.totalPrice)}</td>
        </tr>
      `,
    )
    .join("");

  const statusColor = "#dbeafe";
  const statusTextColor = "#1e40af";

  return {
    subject: `Order Confirmation - ${order.name} - ${order.id} - TOX - France Billet`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-bottom: 24px; border-bottom: 3px solid #3b82f6; padding-bottom: 12px;">
              Order Confirmation #${order.id}
            </h2>

            <div style="margin-bottom: 24px;">
              <p style="font-size: 16px; color: #4b5563;">
                Thank you for your order! Here are your order details:
              </p>
            </div>

            <!-- Order Information -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Order Information
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; width: 40%;"><strong>Order Name:</strong></td>
                  <td style="padding: 4px 0;">${order.name}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Order Number:</strong></td>
                  <td style="padding: 4px 0;">${order.id}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Ordered by:</strong></td>
                  <td style="padding: 4px 0;">${order.user?.name || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Email:</strong></td>
                  <td style="padding: 4px 0;">${order.user?.email || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Ordered on:</strong></td>
                  <td style="padding: 4px 0;">
                    ${order.createdAt ? new Date(order.createdAt).toLocaleDateString("de-DE") + " " + new Date(order.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "-"}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Status:</strong></td>
                  <td style="padding: 4px 0;">
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 4px; background-color: ${statusColor}; color: ${statusTextColor}; font-size: 14px;">
                      ${getStatusLabel(order.status)}
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Addresses -->
            <div style="margin-bottom: 32px; display: flex; gap: 24px;">
              <div style="flex: 1; margin-right: 16px;">
                <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                  Billing Address
                </h2>
                <p style="margin: 0; color: #4b5563; line-height: 1.8;">
                  ${formatAddress(order.billingAddress)}
                </p>
              </div>
              <div style="flex: 1;">
                <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                  Delivery Address
                </h2>
                <p style="margin: 0; color: #4b5563; line-height: 1.8;">
                  ${formatAddress(order.deliveryAddress)}
                </p>
              </div>
            </div>

            <!-- Order Items -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Order Items (${order.items.length})
              </h2>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; font-size: 14px;">
                  <thead>
                    <tr style="background-color: #f3f4f6;">
                      <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid #d1d5db;">Reference</th>
                      <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid #d1d5db;">Description</th>
                      <th style="padding: 10px 12px; text-align: right; border-bottom: 2px solid #d1d5db;">Qty/Pack</th>
                      <th style="padding: 10px 12px; text-align: right; border-bottom: 2px solid #d1d5db;">Packs</th>
                      <th style="padding: 10px 12px; text-align: right; border-bottom: 2px solid #d1d5db;">Price/Pack</th>
                      <th style="padding: 10px 12px; text-align: right; border-bottom: 2px solid #d1d5db;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemRows}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Total -->
            <div style="margin-bottom: 32px; text-align: right;">
              <p style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 0;">
                Total: ${formatCurrency(totalOrderPrice)}
              </p>
            </div>

            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p style="margin: 0;">
                This email was automatically generated by the tox shop system.
              </p>
              <p style="margin: 8px 0 0 0;">
                © ${new Date().getFullYear()} TOX - France Billet
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Order Confirmation #${order.id}

Thank you for your order!

Order Information:
- Order Name: ${order.name}
- Order Number: ${order.id}
- Ordered by: ${order.user?.name || "-"}
- Email: ${order.user?.email || "-"}
- Ordered on: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString("de-DE") + " " + new Date(order.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "-"}
- Status: ${getStatusLabel(order.status)}

Billing Address:
${formatAddressText(order.billingAddress)}

Delivery Address:
${formatAddressText(order.deliveryAddress)}

Order Items (${order.items.length}):
${order.items
  .map(
    (item) =>
      `${item.reference} | ${item.designation} | ${item.numberOfPacks}x Pack (${item.quantityPerPack} pcs.) | ${new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(item.pricePerPack)}/Pack | Total: ${new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(item.totalPrice)}`,
  )
  .join("\n")}

Total: ${formatCurrency(totalOrderPrice)}

---
This email was automatically generated by the tox shop system.
© ${new Date().getFullYear()} TOX - France Billet
    `,
  };
};
