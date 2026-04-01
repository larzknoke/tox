import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { TRAINING_LOCATIONS, getLocationColor } from "@/lib/training-locations";
import listPlugin from "@fullcalendar/list"; // Import the list plugin
import deLocale from "@fullcalendar/core/locales/de"; // Import German locale
import { Button } from "@/components/ui/button"; // Import shadcn Button
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonGroup } from "@/components/ui/button-group";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { getTrainerHourlyRate } from "@/lib/trainerentgelte";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BillCalendar({
  trainingSlots,
  setFinalEvents,
  selectedTrainerId,
  trainers,
}) {
  const currentYear = new Date().getFullYear();

  // Define the quarters with their start and end dates
  const quarters = [
    {
      label: "Quartal 1",
      start: `${currentYear}-01-01`,
      end: `${currentYear}-03-31`,
    },
    {
      label: "Quartal 2",
      start: `${currentYear}-04-01`,
      end: `${currentYear}-06-30`,
    },
    {
      label: "Quartal 3",
      start: `${currentYear}-07-01`,
      end: `${currentYear}-09-30`,
    },
    {
      label: "Quartal 4",
      start: `${currentYear}-10-01`,
      end: `${currentYear}-12-31`,
    },
  ];

  // State to track the selected quarter
  const [selectedQuarter, setSelectedQuarter] = useState(quarters[0]);

  // State to store the dynamically calculated events
  const [events, setEvents] = useState([]);

  // State to store grouped events and total cost
  const [groupedEvents, setGroupedEvents] = useState({});
  const [totalCost, setTotalCost] = useState(0);

  // Get the selected trainer's hourly rate
  const selectedTrainer = trainers?.find(
    (t) => t.id.toString() === selectedTrainerId,
  );
  const hourlyRate = selectedTrainer?.licenseType
    ? getTrainerHourlyRate(selectedTrainer.licenseType)
    : 0;

  // State for the new event dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEventData, setNewEventData] = useState({
    location: "",
    startTime: "",
    endTime: "",
  });

  // Helper to add one day to the end date
  const addOneDay = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  // Helper function to get all dates for a specific weekday in a date range
  const getDatesForWeekday = (weekdayNumber, startDate, endDate) => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Convert weekdayNumber to an integer
    const weekday = parseInt(weekdayNumber, 10);

    // Find the first occurrence of the weekday in the range
    while (start.getDay() !== weekday) {
      start.setDate(start.getDate() + 1);
    }

    // Add all occurrences of the weekday in the range
    while (
      start.getFullYear() < end.getFullYear() || // Check year
      (start.getFullYear() === end.getFullYear() &&
        start.getMonth() <= end.getMonth()) // Check month
    ) {
      dates.push(new Date(start));
      start.setDate(start.getDate() + 7); // Move to the next week
    }

    return dates;
  };

  // Recalculate events whenever the selectedQuarter or trainingSlots change
  useEffect(() => {
    const newEvents = trainingSlots.flatMap((slot) => {
      const dates = getDatesForWeekday(
        slot.weekday,
        selectedQuarter.start,
        selectedQuarter.end,
      );
      return dates.map((date) => ({
        id: crypto.randomUUID(), // Unique ID for each event
        location: `${slot.location.toUpperCase()}`,
        start: `${date.toISOString().split("T")[0]}T${slot.start}`, // Combine date with start time
        end: `${date.toISOString().split("T")[0]}T${slot.end}`, // Combine date with end time
        backgroundColor: getLocationColor(slot.location.toLowerCase()),
        borderColor: getLocationColor(slot.location.toLowerCase()),
      }));
    });
    console.log("newEvents:", newEvents);

    setEvents(newEvents);
  }, [selectedQuarter, trainingSlots, setFinalEvents]);

  // Recalculate grouped events and total cost whenever events change
  useEffect(() => {
    const grouped = events.reduce((acc, event) => {
      if (!acc[event.location]) {
        acc[event.location] = { count: 0, totalCost: 0 };
      }

      // Calculate the duration of the event in hours
      const start = new Date(event.start);
      const end = new Date(event.end);
      const durationInHours = (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours

      acc[event.location].count += 1;
      acc[event.location].totalCost += durationInHours * hourlyRate;
      return acc;
    }, {});

    const total = Object.values(grouped).reduce(
      (sum, group) => sum + group.totalCost,
      0,
    );

    setGroupedEvents(grouped);
    setTotalCost(total);
  }, [events, hourlyRate]); // Dependencies: recalculate when events or hourlyRate change

  // Handle event deletion
  const handleEventClick = (clickInfo) => {
    if (
      confirm(
        `Möchten Sie das Event "${clickInfo.event.title}" wirklich löschen?`,
      )
    ) {
      // Remove the event from the state
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== clickInfo.event.id),
      );
    }
  };

  // Handle date click to add new event
  const handleDateClick = (dateClickInfo) => {
    setSelectedDate(dateClickInfo.dateStr);
    setNewEventData({
      location: "",
      startTime: "",
      endTime: "",
    });
    setIsDialogOpen(true);
  };

  // Handle adding new event
  const handleAddEvent = () => {
    if (
      !newEventData.location ||
      !newEventData.startTime ||
      !newEventData.endTime
    ) {
      alert("Bitte füllen Sie alle Felder aus");
      return;
    }

    const newEvent = {
      id: crypto.randomUUID(),
      location: newEventData.location.toUpperCase(),
      start: `${selectedDate}T${newEventData.startTime}`,
      end: `${selectedDate}T${newEventData.endTime}`,
      backgroundColor: getLocationColor(newEventData.location.toLowerCase()),
      borderColor: getLocationColor(newEventData.location.toLowerCase()),
    };

    setEvents((prevEvents) => [...prevEvents, newEvent]);
    setIsDialogOpen(false);
  };

  // Keep parent summary in sync whenever events array changes for any reason
  useEffect(() => {
    setFinalEvents(events);
  }, [events, setFinalEvents]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle
            className={
              "flex flex-col md:flex-row gap-4 md:gap-0 justify-between"
            }
          >
            Trainingsplan
            <ButtonGroup>
              {quarters.map((quarter) => (
                <Button
                  size={"sm"}
                  key={quarter.label}
                  variant={
                    selectedQuarter.label === quarter.label
                      ? "default"
                      : "outline"
                  }
                  onClick={() => setSelectedQuarter(quarter)}
                  className="capitalize w-1/5 md:w-auto px-4 md:px-3"
                >
                  {quarter.label}
                </Button>
              ))}
            </ButtonGroup>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              {Object.entries(groupedEvents).map(([location, data]) => (
                <div key={location} className="flex justify-between">
                  <span>
                    {data.count}x {location}
                  </span>
                  <span>{formatCurrency(data.totalCost)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Gesamtkosten:</span>
                <span>{formatCurrency(totalCost)}</span>
              </div>
            </div>
            <Separator className={"my-8"} />

            <FullCalendar
              plugins={[dayGridPlugin, listPlugin, interactionPlugin]} // Include the list plugin
              initialView="dayGridMonth"
              locale={deLocale} // Set the locale to German
              validRange={{
                start: selectedQuarter.start,
                end: addOneDay(selectedQuarter.end),
              }}
              events={events} // Use the dynamically generated events
              eventClick={handleEventClick} // Handle event click
              dateClick={handleDateClick} // Handle date click to add event
              height={"auto"}
              headerToolbar={{
                left: "prev,next today", // Navigation buttons
                center: "title", // Calendar title
                right: "dayGridMonth,listMonth", // Add listMonth view
              }}
            />
            <small>Mit Klick auf das Event kann dieses gelöscht werden</small>
          </div>
        </CardContent>
      </Card>

      {/* Dialog for adding new event */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neues Training hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-date">Datum</Label>
              <Input
                id="event-date"
                type="text"
                value={selectedDate || ""}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="event-location">Standort</Label>
              <Select
                value={newEventData.location}
                onValueChange={(value) =>
                  setNewEventData({ ...newEventData, location: value })
                }
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Standort auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_LOCATIONS.map((location) => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.shortLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="event-start-time">Startzeit</Label>
              <Input
                id="event-start-time"
                type="time"
                value={newEventData.startTime}
                onChange={(e) =>
                  setNewEventData({
                    ...newEventData,
                    startTime: e.target.value,
                  })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="event-end-time">Endzeit</Label>
              <Input
                id="event-end-time"
                type="time"
                value={newEventData.endTime}
                onChange={(e) =>
                  setNewEventData({ ...newEventData, endTime: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="success" onClick={handleAddEvent}>
              Hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
