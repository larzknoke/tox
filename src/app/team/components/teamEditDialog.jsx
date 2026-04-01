"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useTransition } from "react";
import { updateTeamAction } from "@/app/team/actions/update-team";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TeamEditDialog({ open, onClose, trainers, team }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTrainers, setSelectedTrainers] = useState([]);

  const formSchema = z.object({
    name: z.string().min(1, { message: "Bitte einen Namen eingeben" }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // Update form when team changes
  useEffect(() => {
    if (team) {
      form.reset({
        name: team.name || "",
      });
      setSelectedTrainers(
        team.trainerTeams?.map((tt) => tt.trainerId || tt.trainer?.id) || []
      );
    }
  }, [team, form]);

  function toggleTrainer(trainerId) {
    setSelectedTrainers((prev) =>
      prev.includes(trainerId)
        ? prev.filter((id) => id !== trainerId)
        : [...prev, trainerId]
    );
  }

  function onSubmit(data) {
    if (!team) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", team.id.toString());
      formData.append("name", data.name);
      formData.append("trainerIds", JSON.stringify(selectedTrainers));

      try {
        await updateTeamAction(formData);
        toast.success("Team erfolgreich aktualisiert");
        onClose();
      } catch (error) {
        toast.error("Fehler beim Aktualisieren des Teams: " + error.message);
      }
    });
  }

  function onReset() {
    if (team) {
      form.reset({
        name: team.name || "",
      });
      setSelectedTrainers(
        team.trainerTeams?.map((tt) => tt.trainerId || tt.trainer?.id) || []
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team bearbeiten</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onReset={onReset}
            className="space-y-8 @container"
          >
            <div className="grid grid-cols-12 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                    <FormLabel className="flex shrink-0">Name</FormLabel>

                    <div className="w-full">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            key="text-input-0"
                            type="text"
                            id="name"
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

              <div className="col-span-12">
                <FormLabel>Trainer</FormLabel>
                <div className="mt-2 space-y-2">
                  {trainers.map((trainer) => (
                    <div
                      key={trainer.id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`trainer-${trainer.id}`}
                        checked={selectedTrainers.includes(trainer.id)}
                        onChange={() => toggleTrainer(trainer.id)}
                        className="h-4 w-4"
                      />
                      <label
                        htmlFor={`trainer-${trainer.id}`}
                        className="text-sm"
                      >
                        {trainer.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            variant="success"
            onClick={() => {
              form.handleSubmit(onSubmit)();
            }}
            disabled={isPending}
          >
            {isPending ? "Speichern..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
