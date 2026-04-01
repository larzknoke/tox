"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, z } from "zod";
import { get, useForm } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import TrainingSlots from "@/app/(bill)/abrechnung/neu/components/training-slots";
import BillCalendar from "./bill-calendar";
import { Button } from "@/components/ui/button";
import SummaryDialog from "./summary-dialog";
import {
  getTrainerLicenseLabel,
  getTrainerHourlyRate,
} from "@/lib/trainerentgelte";
import { formatCurrency } from "@/lib/utils";

export default function BillForm({
  trainers,
  teams,
  currentUser,
  preselectedTeamId,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState(false);
  const [trainingSlots, setTrainingSlots] = useState([]);
  const [finalEvents, setFinalEvents] = useState([]); // State to store final events

  const formSchema = z.object({
    // trainer: z.string().min(1, { message: "This field is required" }),
    // mannschaft: z.string().min(1, { message: "This field is required" }),
    // iban: z.string(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainer: currentUser?.trainerId ? String(currentUser.trainerId) : "",
      mannschaft: preselectedTeamId ? String(preselectedTeamId) : "",
      iban: "",
    },
  });

  const trainingSlotForm = useForm({
    defaultValues: {
      weekday: "",
      location: "",
      start: "",
      end: "",
    },
  });

  function onSubmit() {
    console.log("onSubmit", form.getValues());
    // Open the summary dialog instead of submitting
    setDialogData(true);
  }

  function onReset() {
    form.reset();
    form.clearErrors();
  }

  function addTrainingSlot(values) {
    console.log("values", values);
    const newSlot = trainingSlotForm.getValues();
    setTrainingSlots([...trainingSlots, newSlot]);
    setDialogOpen(false);
    trainingSlotForm.reset();
  }

  function removeTrainingSlot(index) {
    setTrainingSlots(trainingSlots.filter((_, i) => i !== index));
  }

  return (
    <>
      <div className="flex  md:flex-row gap-6 flex-col-reverse">
        <div className="w-full md:w-1/2 ">
          <Card>
            <CardHeader>
              <CardTitle>Stammdaten</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  onReset={onReset}
                  className="space-y-8 @container"
                >
                  <div className="grid grid-cols-12 gap-4">
                    <FormField
                      control={form.control}
                      name="trainer"
                      render={({ field }) => (
                        <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                          <FormLabel className="flex shrink-0">
                            Übungsleiter/in
                          </FormLabel>

                          <div className="w-full">
                            <FormControl>
                              <Select
                                key="select-0"
                                id="trainer"
                                className=""
                                {...field}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="w-full ">
                                  <SelectValue placeholder="Überungsleiter auswählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {trainers.map((trainer) => (
                                    <SelectItem
                                      key={trainer.id}
                                      value={trainer.id.toString()}
                                    >
                                      {trainer.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>

                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mannschaft"
                      render={({ field }) => (
                        <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                          <FormLabel className="flex shrink-0">
                            Mannschaft
                          </FormLabel>

                          <div className="w-full">
                            <FormControl>
                              <Select
                                key="select-0-1-2"
                                id="mannschaft"
                                className=""
                                {...field}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="w-full ">
                                  <SelectValue placeholder="Mannschaft auswählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {teams.map((team) => (
                                    <SelectItem
                                      key={team.id}
                                      value={team.id.toString()}
                                    >
                                      {team.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>

                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="iban"
                      render={({ field }) => (
                        <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                          <FormLabel className="flex shrink-0">IBAN</FormLabel>

                          <div className="w-full">
                            <FormControl>
                              <div className="relative w-full">
                                <Input
                                  key="text-input-0"
                                  placeholder="z.b. DE89 3704 00440 5320 13000"
                                  type="text"
                                  id="iban"
                                  className=" "
                                  {...field}
                                />
                              </div>
                            </FormControl>

                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            className="mt-4"
            variant="success"
          >
            Abrechnung speichern
          </Button>
          {/* <div>
            <h2>Final Events</h2>
            <pre>{JSON.stringify(finalEvents, null, 2)}</pre>
          </div> */}
        </div>
        <div className="w-full md:w-1/2 gap-4 flex flex-col">
          <TrainingSlots
            trainingSlots={trainingSlots}
            trainingSlotForm={trainingSlotForm}
            addTrainingSlot={addTrainingSlot}
            removeTrainingSlot={removeTrainingSlot}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
          />
          <BillCalendar
            trainingSlots={trainingSlots}
            setFinalEvents={setFinalEvents} // Pass the callback to BillCalendar
            selectedTrainerId={form.watch("trainer")}
            trainers={trainers}
          />
        </div>
      </div>

      <SummaryDialog
        isOpen={dialogData}
        onClose={() => setDialogData(false)}
        formData={form.getValues()} // Pass form data
        finalEvents={finalEvents} // Pass final events
        trainers={trainers} // Pass trainers
        teams={teams} // Pass teams
      />
    </>
  );
}
