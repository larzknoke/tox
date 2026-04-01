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
import { deleteTrainerAction } from "@/app/trainer/actions/delete-trainer";

export default function TrainerDeleteDialog({ open, onClose, trainer }) {
  const [isPending, startTransition] = useTransition();

  if (!trainer) return null; // Sicherheit: kein Trainer ausgewählt

  function onDelete() {
    startTransition(async () => {
      try {
        await deleteTrainerAction(trainer.id);
        toast.success(`Trainer ${trainer.name} gelöscht`);
        onClose(); // Parent übernimmt refresh
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
          Möchtest du den Trainer <strong>{trainer.name}</strong> wirklich
          löschen?
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
