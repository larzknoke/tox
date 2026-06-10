function getEmailMessages(locale = "en", messages = {}) {
  const defaults =
    locale === "fr"
      ? {
          subject: "Votre commande a ete expediee",
          title: "Commande expediee",
          greeting: "Bonjour",
          intro:
            "Votre commande a ete expediee. Vous trouverez ci-dessous les informations principales.",
          orderName: "Nom de commande",
          orderNumber: "Numero de commande",
          items: "Articles",
          product: "Produit",
          packs: "Packs",
          ticketsPerPack: "billets/pack",
          ticketsTotal: "billets au total",
          customer: "Client",
          email: "E-Mail",
          shippedDate: "Date d'expedition",
          status: "Statut",
          closing:
            "Cette notification a ete generee automatiquement par le systeme tox shop.",
        }
      : {
          subject: "Your order has been shipped",
          title: "Order shipped",
          greeting: "Hello",
          intro:
            "Your order has been shipped. The key order details are listed below.",
          orderName: "Order name",
          orderNumber: "Order number",
          items: "Items",
          product: "Product",
          packs: "Packs",
          ticketsPerPack: "tickets/pack",
          ticketsTotal: "tickets total",
          customer: "Customer",
          email: "E-Mail",
          shippedDate: "Shipped date",
          status: "Status",
          closing:
            "This notification was generated automatically by the tox shop system.",
        };

  return {
    ...defaults,
    ...messages,
    statusLabels: {
      ...(defaults.statusLabels ?? {}),
      ...(messages.statusLabels ?? {}),
    },
  };
}

export function orderShippedEmail(order, locale = "en", messages = {}) {
  const m = getEmailMessages(locale, messages);
  const shippedDate = order.shippedDate ?? new Date().toISOString();
  const formattedShippedDate = new Date(shippedDate).toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-GB",
  );
  const statusLabel = m.statusLabels?.[order.status] ?? order.status;
  const itemRows = (order.items ?? [])
    .map((item) => {
      const totalTickets =
        Number(item.quantityPerPack || 0) * Number(item.numberOfPacks || 0);

      return `
              <tr>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb;">${item.reference ?? "-"}</td>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb;">${item.designation ?? item.name ?? "-"}</td>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.numberOfPacks ?? 0}</td>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.quantityPerPack ?? 0}</td>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${totalTickets}</td>
              </tr>
            `;
    })
    .join("");

  const textItems = (order.items ?? [])
    .map((item) => {
      const totalTickets =
        Number(item.quantityPerPack || 0) * Number(item.numberOfPacks || 0);
      return `${item.reference ?? "-"} | ${item.designation ?? item.name ?? "-"} | ${m.packs}: ${item.numberOfPacks ?? 0} | ${m.ticketsPerPack}: ${item.quantityPerPack ?? 0} | ${m.ticketsTotal}: ${totalTickets}`;
    })
    .join("\n");

  return {
    subject: `${m.subject} - ${order.name} - ${order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${m.title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 680px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
            <h2 style="color: #1f2937; margin-bottom: 16px; border-bottom: 3px solid #16a34a; padding-bottom: 12px;">
              ${m.title}
            </h2>
            <p style="margin: 0 0 20px 0; color: #4b5563;">
              ${m.greeting} ${order.user?.name || ""},
            </p>
            <p style="margin: 0 0 24px 0; color: #4b5563;">
              ${m.intro}
            </p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; width: 40%;"><strong>${m.orderName}:</strong></td>
                <td style="padding: 6px 0;">${order.name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>${m.orderNumber}:</strong></td>
                <td style="padding: 6px 0;">${order.id}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>${m.customer}:</strong></td>
                <td style="padding: 6px 0;">${order.user?.name || "-"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>${m.email}:</strong></td>
                <td style="padding: 6px 0;">${order.user?.email || "-"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>${m.shippedDate}:</strong></td>
                <td style="padding: 6px 0;">${formattedShippedDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>${m.status}:</strong></td>
                <td style="padding: 6px 0;">${statusLabel}</td>
              </tr>
            </table>
            <h3 style="color: #1f2937; margin: 20px 0 10px 0; font-size: 16px;">${m.items}</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; font-size: 14px;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 8px 10px; text-align: left; border-bottom: 2px solid #d1d5db;">Reference</th>
                  <th style="padding: 8px 10px; text-align: left; border-bottom: 2px solid #d1d5db;">${m.product}</th>
                  <th style="padding: 8px 10px; text-align: right; border-bottom: 2px solid #d1d5db;">${m.packs}</th>
                  <th style="padding: 8px 10px; text-align: right; border-bottom: 2px solid #d1d5db;">${m.ticketsPerPack}</th>
                  <th style="padding: 8px 10px; text-align: right; border-bottom: 2px solid #d1d5db;">${m.ticketsTotal}</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>
            <p style="margin: 28px 0 0 0; color: #6b7280; font-size: 14px;">
              ${m.closing}
            </p>
          </div>
        </body>
      </html>
    `,
    text: `${m.title}\n\n${m.greeting} ${order.user?.name || ""},\n\n${m.intro}\n\n${m.orderName}: ${order.name}\n${m.orderNumber}: ${order.id}\n${m.customer}: ${order.user?.name || "-"}\n${m.email}: ${order.user?.email || "-"}\n${m.shippedDate}: ${formattedShippedDate}\n${m.status}: ${statusLabel}\n\n${m.items}:\n${textItems || "-"}\n\n${m.closing}`,
  };
}
