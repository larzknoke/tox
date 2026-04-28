"use client";

import { useState, useTransition } from "react";
import { MessageCircleQuestionMark } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useLocale } from "@/lib/locale-context";
import { SUPPORT_TICKET_TYPES } from "@/lib/support-ticket";
import { createSupportTicketAction } from "@/app/support/actions/create-ticket";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  type: SUPPORT_TICKET_TYPES[0],
  description: "",
};

export function SupportTicketButton() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const canRender = !isSessionPending && Boolean(session?.user);

  if (!canRender) {
    return null;
  }

  function handleOpenChange(nextOpen) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError("");
    }
  }

  function onSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.subject.trim() ||
      !form.description.trim() ||
      !form.type
    ) {
      setError(t("support.validation.required"));
      return;
    }

    startTransition(async () => {
      const result = await createSupportTicketAction({
        ...form,
        locale,
      });

      if (result.success) {
        toast.success(t("support.feedback.received"));
        setForm({
          ...EMPTY_FORM,
          name: session.user.name ?? "",
          email: session.user.email ?? "",
        });
        setOpen(false);
        return;
      }

      const message =
        result.error === "Not authenticated"
          ? t("support.feedback.notAuthenticated")
          : t("support.feedback.failed");
      setError(message);
      toast.error(message);
    });
  }

  return (
    <>
      <Button
        type="button"
        className="fixed bottom-4 right-4 z-50 bg-red-600 text-white hover:bg-red-700 shadow-lg md:bottom-6 md:right-6"
        onClick={() => {
          setForm((prev) => ({
            ...prev,
            name: prev.name || session.user.name || "",
            email: prev.email || session.user.email || "",
          }));
          setOpen(true);
        }}
      >
        <MessageCircleQuestionMark className="h-4 w-4 mr-2" />
        {t("support.button")}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("support.dialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("support.dialogDescription")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="support-name">{t("support.fields.name")}</Label>
                <Input
                  id="support-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">
                  {t("support.fields.email")}
                </Label>
                <Input
                  id="support-email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="support-phone">
                  {t("support.fields.phone")}
                </Label>
                <Input
                  id="support-phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-type">{t("support.fields.type")}</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, type: value }))
                  }
                  disabled={isPending}
                >
                  <SelectTrigger id="support-type">
                    <SelectValue placeholder={t("support.fields.type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORT_TICKET_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`support.types.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="support-subject">
                {t("support.fields.subject")}
              </Label>
              <Input
                id="support-subject"
                value={form.subject}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, subject: event.target.value }))
                }
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="support-description">
                {t("support.fields.description")}
              </Label>
              <Textarea
                id="support-description"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={6}
                disabled={isPending}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                {t("support.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("support.submitting") : t("support.submit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
