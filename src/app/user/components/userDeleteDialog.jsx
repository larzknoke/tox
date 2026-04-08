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
        toast.success(`User ${user.name} deleted`);
        onClose();
      } catch (err) {
        toast.error(err.message || "Error deleting user");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to delete user <strong>{user.name}</strong> (
          {user.email})?
        </p>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
