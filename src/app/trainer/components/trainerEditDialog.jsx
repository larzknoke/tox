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
import { useEffect } from "react";
import { useTransition } from "react";
import { updateTrainerAction } from "@/app/trainer/actions/update-trainer";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TRAINER_LICENSE_TYPES } from "@/lib/trainerentgelte";

export default function TrainerEditDialog({ open, onClose, trainer }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const formSchema = z.object({
    name: z.string().min(1, { message: "Bitte einen Namen eingeben" }),
    stammverein: z.string().optional(),
    licenseType: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      stammverein: "",
      licenseType: "",
    },
  });

  // Update form when trainer changes
  useEffect(() => {
    if (trainer) {
      form.reset({
        name: trainer.name || "",
        stammverein: trainer.stammverein || "",
        licenseType: trainer.licenseType || "",
      });
    }
  }, [trainer, form]);

  function onSubmit(data) {
    if (!trainer) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", trainer.id.toString());
      formData.append("name", data.name);
      if (data.stammverein) formData.append("stammverein", data.stammverein);
      if (data.licenseType) formData.append("licenseType", data.licenseType);

      try {
        await updateTrainerAction(formData);
        toast.success("Trainer erfolgreich aktualisiert");
        onClose();
      } catch (error) {
        toast.error("Fehler beim Aktualisieren des Trainers: " + error.message);
      }
    });
  }

  function onReset() {
    if (trainer) {
      form.reset({
        name: trainer.name || "",
        stammverein: trainer.stammverein || "",
        licenseType: trainer.licenseType || "",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trainer bearbeiten</DialogTitle>
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

              <FormField
                control={form.control}
                name="licenseType"
                render={({ field }) => (
                  <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                    <FormLabel className="flex shrink-0">
                      Lizenz / Rolle
                    </FormLabel>

                    <div className="w-full">
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Lizenz auswählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TRAINER_LICENSE_TYPES).map(
                              ([key, value]) => (
                                <SelectItem key={key} value={key}>
                                  {value.label} ({value.hourlyRate.toFixed(2)}{" "}
                                  €/h)
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
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
