import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { createBillAction } from "../actions/create-bill";
import {
  getTrainerHourlyRate,
  getTrainerLicenseLabel,
} from "@/lib/trainerentgelte";
import { formatCurrency } from "@/lib/utils";
import { getLocationLabel } from "@/lib/training-locations";

export default function SummaryDialog({
  isOpen,
  onClose,
  formData,
  finalEvents,
  trainers,
  teams,
}) {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Find trainer and team by ID
  const selectedTrainer = trainers?.find(
    (t) => t.id.toString() === formData.trainer,
  );
  const selectedTeam = teams?.find(
    (t) => t.id.toString() === formData.mannschaft,
  );

  // Map formData to use label values
  const mappedFormData = {
    trainer: selectedTrainer
      ? `${selectedTrainer.name} (${getTrainerLicenseLabel(selectedTrainer.licenseType)} - ${formatCurrency(getTrainerHourlyRate(selectedTrainer.licenseType))})`
      : formData.trainer || "-",
    stammverein: selectedTrainer?.stammverein || "-",
    mannschaft: selectedTeam?.name || formData.mannschaft || "-",
    iban: formData.iban || "-",
  };

  // Group events by location
  const hourlyRate = selectedTrainer?.licenseType
    ? getTrainerHourlyRate(selectedTrainer.licenseType)
    : 0;

  const groupedEvents = finalEvents.reduce((acc, event) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const durationInHours = (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours
    const cost = durationInHours * hourlyRate;

    if (!acc[event.location]) {
      acc[event.location] = { count: 0, totalHours: 0, totalCost: 0 };
    }

    acc[event.location].count += 1; // Increment event count
    acc[event.location].totalHours += durationInHours; // Add event duration
    acc[event.location].totalCost += cost; // Add event cost

    return acc;
  }, {});

  // Calculate overall total cost
  const totalCost = Object.values(groupedEvents).reduce(
    (sum, group) => sum + group.totalCost,
    0,
  );

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Extract quarter and year from first event
      const firstEventDate = new Date(finalEvents[0].start);
      const quarter = Math.floor(firstEventDate.getMonth() / 3) + 1; // 1-4
      const year = firstEventDate.getFullYear();

      // Parse trainer and team IDs
      const trainerId = parseInt(formData.trainer);
      const teamId = parseInt(formData.mannschaft);

      // Map finalEvents to BillEvent structure
      const events = finalEvents.map((event) => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const durationInHours = (end - start) / (1000 * 60 * 60);
        const eventCost = durationInHours * hourlyRate;

        return {
          location: event.location,
          startDate: start,
          endDate: end,
          durationHours: durationInHours,
          hourlyRate: hourlyRate,
          cost: eventCost,
          canceled: false,
        };
      });

      // Prepare bill data
      const billData = {
        trainerId,
        teamId,
        iban: formData.iban || null,
        quarter,
        year,
        hourlyRate,
        totalCost,
        events,
      };

      // Call server action
      const result = await createBillAction(billData);

      if (result.success) {
        toast.success("Abrechnung erfolgreich gespeichert!");
        onClose();
        router.push("/abrechnung");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error saving bill:", error);
      toast.error("Fehler beim Speichern der Abrechnung: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full lg:max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={"text-xl"}>Zusammenfassung</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Form Data Summary */}
          <div>
            {/* <h3 className="text-lg font-semibold mb-1">Stammdaten</h3> */}
            <ul className="list-none">
              {Object.entries(mappedFormData).map(([key, value]) => (
                <li key={key}>
                  <strong className="capitalize inline-block w-32">
                    {key}
                  </strong>{" "}
                  {value || "-"}
                </li>
              ))}
            </ul>
          </div>
          <Separator />

          {/* Grouped Events Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-1">Trainingszeiten</h3>
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

          {/* Total Costs */}
          <div className="text-right font-bold">
            Gesamtkosten: {formatCurrency(totalCost)}
          </div>
        </div>
        <DialogFooter>
          <Button variant={"outline"} onClick={onClose} disabled={isSaving}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} variant={"success"} disabled={isSaving}>
            {isSaving ? (
              <>
                <Spinner className=" size-4" />
                Speichern...
              </>
            ) : (
              "Abrechnung speichern"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
