"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { hasRole } from "@/lib/roles";
import { toast } from "sonner";
import { Download, Euro } from "lucide-react";
import {
  generateFahrtkostenPDFAction,
  updateTravelReportStatus,
} from "../actions";

function getStatusLabel(status) {
  switch (status) {
    case "paid":
      return "Bezahlt";
    case "unpaid":
      return "Nicht bezahlt";
    default:
      return status;
  }
}

export default function TravelReportDetailsDialog({
  isOpen,
  onClose,
  travelReport,
  session,
  onStatusUpdated,
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const isAdminOrKassenwart =
    hasRole(session, "admin") || hasRole(session, "kassenwart");

  const handleUpdateStatus = async (status) => {
    if (!travelReport) return;

    const isPaid = status === "paid";
    const confirmed = confirm(
      isPaid
        ? "Möchten Sie diese Fahrtkosten-Abrechnung als bezahlt markieren?"
        : "Möchten Sie diese Fahrtkosten-Abrechnung als unbezahlt markieren?",
    );

    if (!confirmed) return;

    setIsUpdating(true);
    try {
      const result = await updateTravelReportStatus(travelReport.id, status);

      if (!result.success) {
        throw new Error(result.message);
      }

      onStatusUpdated(result.data);
      toast.success(
        isPaid
          ? "Fahrtkosten-Abrechnung als bezahlt markiert"
          : "Status zurückgesetzt",
      );
    } catch (error) {
      console.error("Error updating travel report status:", error);
      toast.error(
        "Fehler beim Aktualisieren des Status: " +
          (error.message || "Unbekannter Fehler"),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!travelReport) return;

    setIsGeneratingPDF(true);
    try {
      const result = await generateFahrtkostenPDFAction(travelReport.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      const blob = new Blob([new Uint8Array(result.pdfBuffer)], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF erfolgreich heruntergeladen!");
    } catch (error) {
      console.error("Error generating Fahrtkosten PDF:", error);
      toast.error("Fehler beim Erstellen des PDFs: " + error.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full lg:max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Fahrtkosten Details {travelReport && `#${travelReport.id}`}
          </DialogTitle>
        </DialogHeader>

        {travelReport ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <ul className="list-none space-y-2">
                <li>
                  <strong className="inline-block w-32">Benutzer</strong>{" "}
                  {travelReport.user?.name || "-"}
                </li>
                <li>
                  <strong className="inline-block w-32">Mannschaft</strong>{" "}
                  {travelReport.team?.name || "-"}
                </li>
                <li>
                  <strong className="inline-block w-32">Ziel</strong>{" "}
                  {travelReport.destination || "-"}
                </li>
                <li>
                  <strong className="inline-block w-32">Grund</strong>{" "}
                  {travelReport.reason || "-"}
                </li>
              </ul>
              <ul className="list-none space-y-2">
                <li>
                  <strong className="inline-block w-32">Fahrtdatum</strong>{" "}
                  {travelReport.travelDate
                    ? new Date(travelReport.travelDate).toLocaleDateString(
                        "de-DE",
                      )
                    : "-"}
                </li>
                <li>
                  <strong className="inline-block w-32">Erstellt am</strong>{" "}
                  {travelReport.createdAt
                    ? new Date(travelReport.createdAt).toLocaleDateString(
                        "de-DE",
                      ) +
                      " " +
                      new Date(travelReport.createdAt).toLocaleTimeString(
                        "de-DE",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "-"}
                </li>
                <li>
                  <strong className="inline-block w-32">Status</strong>{" "}
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm ${
                      travelReport.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {getStatusLabel(travelReport.status)}
                  </span>
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Fahrzeuge ({travelReport.vehicles?.length || 0})
              </h3>
              <div className="max-h-64 overflow-y-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Fahrer</th>
                      <th className="px-3 py-2 text-right">Distanz (km)</th>
                      <th className="px-3 py-2 text-right">Keine Kosten</th>
                      <th className="px-3 py-2 text-right">Kosten</th>
                    </tr>
                  </thead>
                  <tbody>
                    {travelReport.vehicles?.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td className="px-3 py-2 border-t">
                          {vehicle.driver || "-"}
                        </td>
                        <td className="px-3 py-2 border-t text-right">
                          {vehicle.distance.toFixed(1)}
                        </td>
                        <td className="px-3 py-2 border-t text-right">
                          {vehicle.noCharge ? "Ja" : "Nein"}
                        </td>
                        <td className="px-3 py-2 border-t text-right">
                          {formatCurrency(vehicle.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-right font-bold text-lg space-y-1">
              <div>Gesamtdistanz: {travelReport.distance.toFixed(1)} km</div>
              <div>Gesamtkosten: {formatCurrency(travelReport.totalCost)}</div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUpdating || isGeneratingPDF}
            className="w-full sm:w-auto"
          >
            Schließen
          </Button>
          {travelReport && (
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              disabled={isUpdating || isGeneratingPDF}
              className="w-full sm:w-auto"
            >
              <Download size={16} />
              {isGeneratingPDF ? "Erstelle PDF..." : "Fahrtkosten PDF"}
            </Button>
          )}
          {travelReport &&
            isAdminOrKassenwart &&
            travelReport.status !== "paid" && (
              <Button
                onClick={() => handleUpdateStatus("paid")}
                variant="success"
                disabled={isUpdating || isGeneratingPDF}
                className="w-full sm:w-auto"
              >
                <Euro size={16} />
                {isUpdating ? "Aktualisieren..." : "Als bezahlt markieren"}
              </Button>
            )}
          {travelReport &&
            isAdminOrKassenwart &&
            travelReport.status === "paid" && (
              <Button
                onClick={() => handleUpdateStatus("unpaid")}
                variant="warning"
                disabled={isUpdating || isGeneratingPDF}
                className="w-full sm:w-auto"
              >
                {isUpdating
                  ? "Aktualisieren..."
                  : "Als nicht bezahlt markieren"}
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
