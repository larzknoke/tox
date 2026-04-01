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
import { deleteTeamAction } from "@/app/team/actions/delete-team";

export default function TeamDeleteDialog({ open, onClose, team }) {
  const [isPending, startTransition] = useTransition();

  if (!team) return null;

  function onDelete() {
    startTransition(async () => {
      try {
        await deleteTeamAction(team.id);
        toast.success(`Team ${team.name} gelöscht`);
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
          Möchtest du das Team <strong>{team.name}</strong> wirklich löschen?
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
