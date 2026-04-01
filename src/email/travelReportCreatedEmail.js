import { formatCurrency } from "@/lib/utils";

export const travelReportCreatedEmail = (travelReport) => {
  const getStatusLabel = (status) => {
    switch (status) {
      case "unpaid":
        return "Nicht bezahlt";
      case "paid":
        return "Bezahlt";
      case "submitted":
        return "Eingereicht";
      default:
        return status;
    }
  };

  const vehicleRows = travelReport.vehicles
    .map(
      (vehicle) => `
        <tr>
          <td style="padding: 8px; border-top: 1px solid #e5e7eb;">${vehicle.driver || "-"}</td>
          <td style="padding: 8px; border-top: 1px solid #e5e7eb; text-align: right;">${vehicle.distance.toFixed(2)} km</td>
          <td style="padding: 8px; border-top: 1px solid #e5e7eb; text-align: right;">${vehicle.noCharge ? "Kostenlos" : formatCurrency(vehicle.cost)}</td>
        </tr>
      `
    )
    .join("");

  const statusColor =
    travelReport.status === "paid"
      ? "#dcfce7"
      : travelReport.status === "submitted"
        ? "#dbeafe"
        : "#f3f4f6";
  const statusTextColor =
    travelReport.status === "paid"
      ? "#166534"
      : travelReport.status === "submitted"
        ? "#1e40af"
        : "#374151";

  return {
    subject: `Neue Fahrtkosten-Abrechnung erstellt - ${travelReport.team?.name || ""}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Neue Fahrtkosten-Abrechnung erstellt</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #1f2937; margin-bottom: 24px; border-bottom: 3px solid #3b82f6; padding-bottom: 12px;">
              Neue Fahrtkosten-Abrechnung erstellt #${travelReport.id}
            </h1>
            
            <div style="margin-bottom: 24px;">
              <p style="font-size: 16px; color: #4b5563;">
                Eine neue Fahrtkosten-Abrechnung wurde im System erstellt. Hier sind die Details:
              </p>
            </div>

            <!-- Travel Report Information -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Abrechnungsinformationen
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; width: 40%;"><strong>Mannschaft:</strong></td>
                  <td style="padding: 4px 0;">${travelReport.team?.name || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Reisedatum:</strong></td>
                  <td style="padding: 4px 0;">
                    ${new Date(travelReport.travelDate).toLocaleDateString("de-DE")}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Ziel:</strong></td>
                  <td style="padding: 4px 0;">${travelReport.destination}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Grund:</strong></td>
                  <td style="padding: 4px 0;">${travelReport.reason || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Gesamtstrecke:</strong></td>
                  <td style="padding: 4px 0;">${travelReport.distance.toFixed(2)} km</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Erstellt von:</strong></td>
                  <td style="padding: 4px 0;">${travelReport.user?.name || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Erstellt am:</strong></td>
                  <td style="padding: 4px 0;">
                    ${travelReport.createdAt ? new Date(travelReport.createdAt).toLocaleDateString("de-DE") + " " + new Date(travelReport.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "-"}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; background-color: ${statusColor};"><strong>Status:</strong></td>
                  <td style="padding: 4px 0; background-color: ${statusColor}; color: ${statusTextColor};">${getStatusLabel(travelReport.status)}</td>
                </tr>
              </table>
            </div>

            <!-- Vehicles Table -->
            ${
              vehicleRows
                ? `
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Fahrzeuge
              </h2>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold;">Fahrer</th>
                    <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: bold;">Strecke</th>
                    <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: bold;">Kosten</th>
                  </tr>
                </thead>
                <tbody>
                  ${vehicleRows}
                </tbody>
              </table>
            </div>
            `
                : ""
            }

            <!-- Cost Summary -->
            <div style="margin-bottom: 32px; background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
              <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 16px;">
                Kostenzusammenfassung
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Gesamtkosten:</strong></td>
                  <td style="padding: 8px 0; text-align: right; font-size: 18px; font-weight: bold; color: #1f2937;">
                    ${formatCurrency(travelReport.totalCost)}
                  </td>
                </tr>
              </table>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
              <p>
                Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht auf diese Nachricht.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Neue Fahrtkosten-Abrechnung erstellt #${travelReport.id}

Abrechnungsinformationen:
Mannschaft: ${travelReport.team?.name || "-"}
Reisedatum: ${new Date(travelReport.travelDate).toLocaleDateString("de-DE")}
Ziel: ${travelReport.destination}
Grund: ${travelReport.reason || "-"}
Gesamtstrecke: ${travelReport.distance.toFixed(2)} km
Erstellt von: ${travelReport.user?.name || "-"}
Status: ${getStatusLabel(travelReport.status)}

Gesamtkosten: ${formatCurrency(travelReport.totalCost)}

Dies ist eine automatisch generierte E-Mail.
    `,
  };
};
