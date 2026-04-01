import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import TrainingSlotFormComp from "@/app/(bill)/abrechnung/neu/components/trainings-slot-form";
import { getWeekdayName } from "@/lib/weekdayHelper";

export default function TrainingSlots({
  trainingSlots,
  trainingSlotForm,
  addTrainingSlot,
  removeTrainingSlot,
  dialogOpen,
  setDialogOpen,
}) {
  // Define the custom order for weekdays
  const weekdayOrder = [
    "montag",
    "dienstag",
    "mittwoch",
    "donnerstag",
    "freitag",
    "samstag",
    "sonntag",
  ];

  // Sort the trainingSlots array based on the weekday order
  const sortedTrainingSlots = [...trainingSlots].sort(
    (a, b) =>
      weekdayOrder.indexOf(a.weekday.toLowerCase()) -
      weekdayOrder.indexOf(b.weekday.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className={"flex justify-between"}>
          Trainingszeiten
          <TrainingSlotFormComp
            trainingSlotForm={trainingSlotForm}
            addTrainingSlot={addTrainingSlot}
            open={dialogOpen}
            setOpen={setDialogOpen}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Table for listing Trainingszeiten */}
        {sortedTrainingSlots.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-b border-gray-300 px-4 py-2 text-left">
                    Wochentag
                  </th>
                  <th className="border-b border-gray-300 px-4 py-2 text-left">
                    Ort
                  </th>
                  <th className="border-b border-gray-300 px-4 py-2 text-left">
                    Startzeit
                  </th>
                  <th className="border-b border-gray-300 px-4 py-2 text-left">
                    Endzeit
                  </th>
                  <th className="border-b border-gray-300 px-4 py-2 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {sortedTrainingSlots.map((slot, index) => (
                  <tr key={index}>
                    <td className="border-b border-gray-300 px-4 py-2">
                      {getWeekdayName(slot.weekday)}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-2">
                      {slot.location.toUpperCase()}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-2">
                      {slot.start}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-2">
                      {slot.end}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-2">
                      <Button
                        className={
                          "text-red-600 hover:text-red-400 hover:cursor-pointer "
                        }
                        variant="link"
                        size="sm"
                        onClick={() => removeTrainingSlot(index)}
                      >
                        <Trash2Icon />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
