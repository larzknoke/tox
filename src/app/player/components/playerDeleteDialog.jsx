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
import { deletePlayerAction } from "@/app/player/actions/delete-player";

export default function PlayerDeleteDialog({ open, onClose, player }) {
  const [isPending, startTransition] = useTransition();

  if (!player) return null;

  function onDelete() {
    startTransition(async () => {
      try {
        await deletePlayerAction(player.id);
        toast.success(`Spieler ${player.name} gelöscht`);
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
          Möchtest du den Spieler <strong>{player.name}</strong> wirklich
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
