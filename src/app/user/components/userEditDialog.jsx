"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { updateUserAction } from "@/app/user/actions/update-user";
import { setUserRoleAction } from "@/app/user/actions/set-user-role";
import { toast } from "sonner";

export default function UserEditDialog({ open, onClose, user, trainers = [] }) {
  const [isPending, startTransition] = useTransition();

  const formSchema = z.object({
    name: z.string().min(1, { message: "Bitte einen Namen eingeben" }),
    email: z.string().email({ message: "Ungültige E-Mail-Adresse" }),
    role: z.string().optional(),
    banned: z.boolean().default(false),
    banReason: z.string().optional(),
    trainerId: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      banned: false,
      banReason: "",
      trainerId: "",
    },
  });

  // Update form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        banned: user.banned || false,
        banReason: user.banReason || "",
        trainerId: user.trainerId ? String(user.trainerId) : "",
      });
    }
  }, [user, form]);

  function onSubmit(data) {
    if (!user) return;

    startTransition(async () => {
      try {
        // Update user role using Better Auth admin API if role has changed
        if (data.role && data.role !== user.role) {
          const roleFormData = new FormData();
          roleFormData.append("userId", user.id);
          roleFormData.append("role", data.role);
          await setUserRoleAction(roleFormData);
        }

        // Update other user data
        const formData = new FormData();
        formData.append("id", user.id);
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("banned", data.banned.toString());
        if (data.banReason) formData.append("banReason", data.banReason);
        if (data.trainerId && data.trainerId !== "none") {
          formData.append("trainerId", data.trainerId);
        }

        await updateUserAction(formData);
        toast.success("Benutzer erfolgreich aktualisiert");
        onClose();
      } catch (error) {
        toast.error("Fehler beim Aktualisieren: " + error.message);
      }
    });
  }

  function onReset() {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        banned: user.banned || false,
        banReason: user.banReason || "",
        trainerId: user.trainerId ? String(user.trainerId) : "",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Benutzer bearbeiten</DialogTitle>
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
                          <Input type="text" id="name" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                    <FormLabel className="flex shrink-0">E-Mail</FormLabel>
                    <div className="w-full">
                      <FormControl>
                        <div className="relative w-full">
                          <Input type="email" id="email" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                    <FormLabel className="flex shrink-0">Rolle</FormLabel>
                    <div className="w-full">
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Rolle auswählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="trainer">Trainer</SelectItem>
                            <SelectItem value="kassenwart">
                              Kassenwart
                            </SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
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
                name="trainerId"
                render={({ field }) => (
                  <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                    <FormLabel className="flex shrink-0">
                      Zugeordneter Trainer
                    </FormLabel>
                    <div className="w-full">
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Trainer auswählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            {trainers.map((t) => (
                              <SelectItem key={t.id} value={String(t.id)}>
                                {t.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="none">Kein Trainer</SelectItem>
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
                name="banned"
                render={({ field }) => (
                  <FormItem className="col-span-12 col-start-auto flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel className="flex shrink-0">
                      Benutzer sperren
                    </FormLabel>
                  </FormItem>
                )}
              />

              {form.watch("banned") && (
                <FormField
                  control={form.control}
                  name="banReason"
                  render={({ field }) => (
                    <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                      <FormLabel className="flex shrink-0">
                        Sperrgrund
                      </FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <div className="relative w-full">
                            <Input
                              type="text"
                              id="banReason"
                              placeholder="Optional"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              )}
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
