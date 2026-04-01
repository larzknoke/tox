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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useTransition } from "react";
import { createPlayerAction } from "@/app/player/actions/create-player";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PlayerNewDialog({ open, onClose, teams }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTeams, setSelectedTeams] = useState([]);

  const formSchema = z.object({
    name: z.string().min(1, { message: "Bitte einen Namen eingeben" }),
    birthday: z.string().optional(),
    gender: z.string().optional(),
    stammverein: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      birthday: "",
      gender: "",
      stammverein: "",
    },
  });

  function toggleTeam(teamId) {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  }

  function onSubmit(data) {
    console.log("onSubmit", form.getValues());
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.birthday) formData.append("birthday", data.birthday);
      if (data.gender) formData.append("gender", data.gender);
      if (data.stammverein) formData.append("stammverein", data.stammverein);
      formData.append("teamIds", JSON.stringify(selectedTeams));

      try {
        await createPlayerAction(formData);
        toast.success("Spieler erfolgreich erstellt");
        form.reset();
        setSelectedTeams([]);
        onClose();
      } catch (error) {
        toast.error("Fehler beim Erstellen des Spielers: " + error.message);
      }
    });
  }

  function onReset() {
    form.reset();
    form.clearErrors();
    setSelectedTeams([]);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Spieler erstellen</DialogTitle>
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

              <FormField
                control={form.control}
                name="birthday"
                render={({ field }) => (
                  <FormItem className="col-span-6 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                    <FormLabel className="flex shrink-0">Geburtstag</FormLabel>

                    <div className="w-full">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            key="date-input-0"
                            type="date"
                            id="birthday"
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

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="col-span-6 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                    <FormLabel className="flex shrink-0">Geschlecht</FormLabel>

                    <div className="w-full">
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Auswählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="männlich">Männlich</SelectItem>
                            <SelectItem value="weiblich">Weiblich</SelectItem>
                            <SelectItem value="divers">Divers</SelectItem>
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
                name="stammverein"
                render={({ field }) => (
                  <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                    <FormLabel className="flex shrink-0">Stammverein</FormLabel>

                    <div className="w-full">
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Stammverein auswählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MTV Holzminden">
                              MTV Holzminden
                            </SelectItem>
                            <SelectItem value="TV Stadtoldendorf">
                              TV Stadtoldendorf
                            </SelectItem>
                            <SelectItem value="MTV Bevern">
                              MTV Bevern
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className="col-span-12">
                <FormLabel>Teams</FormLabel>
                <div className="mt-2 space-y-2">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`team-${team.id}`}
                        checked={selectedTeams.includes(team.id)}
                        onChange={() => toggleTeam(team.id)}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`team-${team.id}`} className="text-sm">
                        {team.name}
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
          >
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
