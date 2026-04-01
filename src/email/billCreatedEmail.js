export const billCreatedEmail = (bill) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatQuarter = (quarter, year) => {
    return `Q${quarter}/${year}`;
  };

  const getTrainerLicenseLabel = (licenseType) => {
    const labels = {
      A: "A-Lizenz",
      B: "B-Lizenz",
      C: "C-Lizenz",
    };
    return labels[licenseType] || licenseType;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "unpaid":
        return "Nicht bezahlt";
      case "paid":
        return "Bezahlt";
      default:
        return status;
    }
  };

  // Group events by location
  const groupedEvents = bill.events.reduce((acc, event) => {
    const location = event.location;
    if (!acc[location]) {
      acc[location] = { count: 0, totalHours: 0, totalCost: 0 };
    }

    acc[location].count += 1;
    acc[location].totalHours += event.durationHours;
    acc[location].totalCost += event.cost;

    return acc;
  }, {});

  const groupedEventsRows = Object.entries(groupedEvents)
    .map(
      ([location, group]) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${location}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${group.count}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${group.totalHours.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(group.totalCost)}</td>
        </tr>
      `,
    )
    .join("");

  const eventDetailsRows = bill.events
    .map(
      (event) => `
        <tr${event.canceled ? ' style="opacity: 0.5; text-decoration: line-through;"' : ""}>
          <td style="padding: 8px; border-top: 1px solid #e5e7eb;">${new Date(event.startDate).toLocaleDateString("de-DE")}</td>
          <td style="padding: 8px; border-top: 1px solid #e5e7eb;">
            ${new Date(event.startDate).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} - 
            ${new Date(event.endDate).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
          </td>
          <td style="padding: 8px; border-top: 1px solid #e5e7eb;">${event.location}</td>
          <td style="padding: 8px; border-top: 1px solid #e5e7eb; text-align: right;">${event.durationHours.toFixed(2)}</td>
          <td style="padding: 8px; border-top: 1px solid #e5e7eb; text-align: right;">${formatCurrency(event.cost)}</td>
        </tr>
      `,
    )
    .join("");

  const statusColor =
    bill.status === "paid"
      ? "#dcfce7"
      : bill.status === "submitted"
        ? "#dbeafe"
        : "#f3f4f6";
  const statusTextColor =
    bill.status === "paid"
      ? "#166534"
      : bill.status === "submitted"
        ? "#1e40af"
        : "#374151";

  return {
    subject: `Neue Abrechnung erstellt - ${bill.trainer.name} - ${formatQuarter(bill.quarter, bill.year)}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Neue Abrechnung erstellt</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #1f2937; margin-bottom: 24px; border-bottom: 3px solid #3b82f6; padding-bottom: 12px;">
              Neue Abrechnung erstellt #${bill.id}
            </h1>
            
            <div style="margin-bottom: 24px;">
              <p style="font-size: 16px; color: #4b5563;">
                Eine neue Abrechnung wurde im System erstellt. Hier sind die Details:
              </p>
            </div>

            <!-- Bill Information -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Abrechnungsinformationen
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; width: 40%;"><strong>Trainer:</strong></td>
                  <td style="padding: 4px 0;">${bill.trainer.name}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Stammverein:</strong></td>
                  <td style="padding: 4px 0;">${bill.trainer.stammverein || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Lizenz:</strong></td>
                  <td style="padding: 4px 0;">${bill.trainer.licenseType ? getTrainerLicenseLabel(bill.trainer.licenseType) : "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Mannschaft:</strong></td>
                  <td style="padding: 4px 0;">${bill.team.name}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Zeitraum:</strong></td>
                  <td style="padding: 4px 0;">${formatQuarter(bill.quarter, bill.year)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Erstellt von:</strong></td>
                  <td style="padding: 4px 0;">${bill.user?.name || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Erstellt am:</strong></td>
                  <td style="padding: 4px 0;">
                    ${bill.createdAt ? new Date(bill.createdAt).toLocaleDateString("de-DE") + " " + new Date(bill.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "-"}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>IBAN:</strong></td>
                  <td style="padding: 4px 0;">${bill.iban || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Stundensatz:</strong></td>
                  <td style="padding: 4px 0;">${formatCurrency(bill.hourlyRate)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Status:</strong></td>
                  <td style="padding: 4px 0;">
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 4px; background-color: ${statusColor}; color: ${statusTextColor}; font-size: 14px;">
                      ${getStatusLabel(bill.status)}
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Training Sessions Summary -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Trainingszeiten
              </h2>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #d1d5db;">Ort</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #d1d5db;">Anzahl</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #d1d5db;">Stunden</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #d1d5db;">Kosten</th>
                  </tr>
                </thead>
                <tbody>
                  ${groupedEventsRows}
                </tbody>
              </table>
            </div>

            <!-- Total Cost -->
            <div style="margin-bottom: 32px; text-align: right;">
              <p style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 0;">
                Gesamtkosten: ${formatCurrency(bill.totalCost)}
              </p>
            </div>

            <!-- Event Details -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Einzelne Termine (${bill.events.length})
              </h2>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; font-size: 14px;">
                  <thead>
                    <tr style="background-color: #f9fafb;">
                      <th style="padding: 8px; text-align: left; border-bottom: 1px solid #d1d5db;">Datum</th>
                      <th style="padding: 8px; text-align: left; border-bottom: 1px solid #d1d5db;">Zeit</th>
                      <th style="padding: 8px; text-align: left; border-bottom: 1px solid #d1d5db;">Ort</th>
                      <th style="padding: 8px; text-align: right; border-bottom: 1px solid #d1d5db;">Stunden</th>
                      <th style="padding: 8px; text-align: right; border-bottom: 1px solid #d1d5db;">Kosten</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${eventDetailsRows}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p style="margin: 0;">
                Diese E-Mail wurde automatisch vom tox Abrechnungssystem generiert.
              </p>
              <p style="margin: 8px 0 0 0;">
                © ${new Date().getFullYear()} HSG Solling
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Neue Abrechnung erstellt #${bill.id}

Eine neue Abrechnung wurde im System erstellt.

Abrechnungsinformationen:
- Trainer: ${bill.trainer.name}
- Stammverein: ${bill.trainer.stammverein || "-"}
- Lizenz: ${bill.trainer.licenseType ? getTrainerLicenseLabel(bill.trainer.licenseType) : "-"}
- Mannschaft: ${bill.team.name}
- Zeitraum: ${formatQuarter(bill.quarter, bill.year)}
- Erstellt von: ${bill.user?.name || "-"}
- Erstellt am: ${bill.createdAt ? new Date(bill.createdAt).toLocaleDateString("de-DE") + " " + new Date(bill.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "-"}
- IBAN: ${bill.iban || "-"}
- Stundensatz: ${formatCurrency(bill.hourlyRate)}
- Status: ${getStatusLabel(bill.status)}

Trainingszeiten:
${Object.entries(groupedEvents)
  .map(
    ([location, group]) =>
      `${location}: ${group.count} Termine, ${group.totalHours.toFixed(2)} Stunden, ${formatCurrency(group.totalCost)}`,
  )
  .join("\n")}

Gesamtkosten: ${formatCurrency(bill.totalCost)}

Einzelne Termine (${bill.events.length}):
${bill.events
  .map(
    (event) =>
      `${new Date(event.startDate).toLocaleDateString("de-DE")} ${new Date(event.startDate).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} - ${new Date(event.endDate).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} | ${event.location} | ${event.durationHours.toFixed(2)}h | ${formatCurrency(event.cost)}`,
  )
  .join("\n")}

---
Diese E-Mail wurde automatisch vom tox Abrechnungssystem generiert.
© ${new Date().getFullYear()} HSG Solling
    `,
  };
};
