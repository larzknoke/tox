"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { formatCurrency, formatQuarter } from "@/lib/utils";
import { getBillDetailsAction } from "../actions/get-bill-details";
import { updateBillStatusAction } from "../actions/update-bill-status";
import { generateBillPDFAction } from "../actions/generate-bill-pdf";
import { getTrainerLicenseLabel } from "@/lib/trainerentgelte";
import { getLocationLabel } from "@/lib/training-locations";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Download, Euro } from "lucide-react";
import { hasRole } from "@/lib/roles";

export default function BillDetailsDialog({
  isOpen,
  onClose,
  billId,
  session,
}) {
  const [bill, setBill] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const isAdminOrKassenwart =
    hasRole(session, "admin") || hasRole(session, "kassenwart");

  useEffect(() => {
    if (isOpen && billId) {
      loadBillDetails();
    }
  }, [isOpen, billId]);

  const loadBillDetails = async () => {
    setIsLoading(true);
    try {
      const result = await getBillDetailsAction(billId);
      if (result.success) {
        setBill(result.bill);
      } else {
        toast.error("Fehler beim Laden der Abrechnung: " + result.error);

        onClose();
      }
    } catch (error) {
      console.error("Error loading bill:", error);
      toast.error("Fehler beim Laden der Abrechnung");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!bill) return;

    const confirmed = confirm(
      "Möchten Sie diese Abrechnung als bezahlt markieren?",
    );
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      const result = await updateBillStatusAction(bill.id, "paid");
      if (result.success) {
        setBill(result.bill);
        toast.success(`Abrechnung als bezahlt markiert!`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error updating bill status:", error);
      toast.error("Fehler beim Aktualisieren des Status: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAsUnpaid = async () => {
    if (!bill) return;

    const confirmed = confirm(
      "Möchten Sie diese Abrechnung als unbezahlt markieren?",
    );
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      const result = await updateBillStatusAction(bill.id, "unpaid");
      if (result.success) {
        setBill(result.bill);
        toast.success("Status zurückgesetzt!");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error updating bill status:", error);
      toast.error("Fehler beim Aktualisieren des Status: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!bill) return;

    setIsGeneratingPDF(true);
    try {
      // Generate PDF on server
      const result = await generateBillPDFAction(bill.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Convert array buffer to blob
      const blob = new Blob([new Uint8Array(result.pdfBuffer)], {
        type: "application/pdf",
      });

      // Create download link
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
      console.error("Error generating PDF:", error);
      toast.error("Fehler beim Erstellen des PDFs: " + error.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Group events by location
  const groupedEvents = bill?.events.reduce((acc, event) => {
    const location = event.location;
    if (!acc[location]) {
      acc[location] = { count: 0, totalHours: 0, totalCost: 0 };
    }

    acc[location].count += 1;
    acc[location].totalHours += event.durationHours;
    acc[location].totalCost += event.cost;

    return acc;
  }, {});

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full lg:max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Abrechnung Details {bill && `#${bill.id}`}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : bill ? (
          <div className="space-y-6">
            {/* Bill Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <ul className="list-none space-y-2">
                <li>
                  <strong className="inline-block w-32">Trainer</strong>{" "}
                  {bill.trainer.name}
                </li>
                <li>
                  <strong className="inline-block w-32">Stammverein</strong>{" "}
                  {bill.trainer.stammverein || "-"}
                </li>
                <li>
                  <strong className="inline-block w-32">Lizenz</strong>{" "}
                  {bill.trainer.licenseType
                    ? getTrainerLicenseLabel(bill.trainer.licenseType)
                    : "-"}
                </li>
                <li>
                  <strong className="inline-block w-32">Mannschaft</strong>{" "}
                  {bill.team.name}
                </li>
                <li>
                  <strong className="inline-block w-32">Zeitraum</strong>{" "}
                  {formatQuarter(bill.quarter, bill.year)}
                </li>
              </ul>
              <ul className="list-none space-y-2">
                <li>
                  <strong className="inline-block w-32">Erstellt von</strong>{" "}
                  {bill.user?.name || "-"}
                </li>
                <li>
                  <strong className="inline-block w-32">Erstellt am</strong>{" "}
                  {bill.createdAt
                    ? new Date(bill.createdAt).toLocaleDateString("de-DE") +
                      " " +
                      new Date(bill.createdAt).toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </li>
                <li>
                  <strong className="inline-block w-32">IBAN</strong>{" "}
                  {bill.iban || "-"}
                </li>
                <li>
                  <strong className="inline-block w-32">Stundensatz</strong>{" "}
                  {bill.hourlyRate ? formatCurrency(bill.hourlyRate) : "-"}
                </li>
                <li>
                  <strong className="inline-block w-32">Status</strong>{" "}
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm ${
                      bill.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : bill.status === "submitted"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {getStatusLabel(bill.status)}
                  </span>
                </li>
              </ul>
            </div>
            <Separator />

            {/* Training Sessions Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Trainingszeiten</h3>
              <table className="w-full border-collapse border-b border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-b border-gray-300 px-4 py-2 text-left">
                      Ort
                    </th>
                    <th className="border-b border-gray-300 px-4 py-2 text-left">
                      Anzahl
                    </th>
                    <th className="border-b border-gray-300 px-4 py-2 text-left">
                      Stunden
                    </th>
                    <th className="border-b border-gray-300 px-4 py-2 text-right">
                      Kosten
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedEvents).map(
                    ([location, group], index) => (
                      <tr key={index}>
                        <td className="border-b border-gray-300 px-4 py-2">
                          {getLocationLabel(location.toLowerCase())}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-2">
                          {group.count}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-2">
                          {group.totalHours.toFixed(2)}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-2 text-right">
                          {formatCurrency(group.totalCost)}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Cost */}
            <div className="text-right font-bold text-lg">
              Gesamtkosten: {formatCurrency(bill.totalCost)}
            </div>

            {/* Event Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Einzelne Termine ({bill.events.length})
              </h3>
              <div className="max-h-64 overflow-y-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Datum</th>
                      <th className="px-3 py-2 text-left">Zeit</th>
                      <th className="px-3 py-2 text-left">Ort</th>
                      <th className="px-3 py-2 text-right">Stunden</th>
                      <th className="px-3 py-2 text-right">Kosten</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.events.map((event) => (
                      <tr
                        key={event.id}
                        className={
                          event.canceled ? "line-through opacity-50" : ""
                        }
                      >
                        <td className="px-3 py-2 border-t">
                          {new Date(event.startDate).toLocaleDateString(
                            "de-DE",
                          )}
                        </td>
                        <td className="px-3 py-2 border-t">
                          {new Date(event.startDate).toLocaleTimeString(
                            "de-DE",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}{" "}
                          -{" "}
                          {new Date(event.endDate).toLocaleTimeString("de-DE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-3 py-2 border-t">
                          {getLocationLabel(event.location.toLowerCase())}
                        </td>
                        <td className="px-3 py-2 border-t text-right">
                          {event.durationHours.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 border-t text-right">
                          {formatCurrency(event.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          {bill && (
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              disabled={isUpdating || isGeneratingPDF}
              className="w-full sm:w-auto"
            >
              <Download size={16} />
              {isGeneratingPDF ? "Erstelle PDF..." : "Abrechnung PDF"}
            </Button>
          )}
          {bill && isAdminOrKassenwart && bill.status !== "paid" && (
            <Button
              onClick={handleMarkAsPaid}
              variant="success"
              disabled={isUpdating || isGeneratingPDF}
              className="w-full sm:w-auto"
            >
              <Euro size={16} />
              {isUpdating ? "Aktualisieren..." : "Als bezahlt markieren"}
            </Button>
          )}
          {bill && isAdminOrKassenwart && bill.status === "paid" && (
            <Button
              onClick={handleMarkAsUnpaid}
              variant="warning"
              disabled={isUpdating || isGeneratingPDF}
              className="w-full sm:w-auto"
            >
              {isUpdating ? "Aktualisieren..." : "Als nicht bezahlt markieren"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
