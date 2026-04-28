"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { changePasswordAction } from "../actions/change-password";
import { useLocale } from "@/lib/locale-context";

export function ChangePasswordDialog({ open, onOpenChange }) {
  const { t } = useLocale();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.currentPassword) {
      setError(t("account.password.errors.currentRequired"));
      return;
    }
    if (!form.newPassword) {
      setError(t("account.password.errors.newRequired"));
      return;
    }
    if (form.newPassword.length < 8) {
      setError(t("account.password.errors.minLength"));
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError(t("account.password.errors.noMatch"));
      return;
    }

    startTransition(async () => {
      const result = await changePasswordAction(
        form.currentPassword,
        form.newPassword,
      );
      if (result.success) {
        toast.success(t("account.password.success"));
        onOpenChange(false);
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(t("account.password.errors.generic"));
        toast.error(t("account.password.errors.generic"));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t("account.password.change")}</DialogTitle>
          <DialogDescription>
            {t("account.password.description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                {t("account.password.current")}
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={(e) =>
                  setForm({ ...form, currentPassword: e.target.value })
                }
                disabled={isPending}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("account.password.new")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                disabled={isPending}
                placeholder="••••••••"
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                {t("account.password.minimum")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t("account.password.confirm")}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                disabled={isPending}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t("account.password.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? t("account.password.saving")
                : t("account.password.change")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
