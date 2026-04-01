"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteUserAction } from "@/app/user/actions/delete-user";

export default function UserDeleteDialog({ open, onClose, user }) {
  const [isPending, startTransition] = useTransition();

  if (!user) return null;

  function onDelete() {
    startTransition(async () => {
      try {
        await deleteUserAction(user.id);
        toast.success(`Benutzer ${user.name} gelöscht`);
        onClose();
      } catch (err) {
        toast.error(err.message || "Fehler beim Löschen");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Löschen bestätigen</DialogTitle>
        </DialogHeader>
        <p>
          Möchtest du den Benutzer <strong>{user.name}</strong> ({user.email})
          wirklich löschen?
        </p>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={isPending}>
            {isPending ? "Löschen..." : "Löschen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
