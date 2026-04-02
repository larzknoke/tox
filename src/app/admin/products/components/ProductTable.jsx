"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createProductAction } from "../actions/create-product";
import { updateProductAction } from "../actions/update-product";
import { deleteProductAction } from "../actions/delete-product";

const EMPTY_FORM = {
  reference: "",
  name: "",
  description: "",
  pricePerPack: "",
  quantityPerPack: "1000",
  isActive: true,
};

function ProductFormDialog({ open, onOpenChange, initial, onSave, isPending }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const isEdit = !!initial?.id;

  // Reset form when dialog opens with new initial value
  useState(() => {
    setForm(initial ?? EMPTY_FORM);
  }, [initial]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...(isEdit ? { id: initial.id } : {}),
      reference: form.reference,
      name: form.name,
      description: form.description,
      pricePerPack: parseFloat(form.pricePerPack),
      quantityPerPack: parseInt(form.quantityPerPack, 10),
      isActive: form.isActive,
    };
    await onSave(payload);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reference">Reference *</Label>
              <Input
                id="reference"
                placeholder="BOFBSM"
                value={form.reference}
                onChange={(e) => set("reference", e.target.value)}
                required
                disabled={isPending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quantityPerPack">Qty per Pack *</Label>
              <Input
                id="quantityPerPack"
                type="number"
                min={1}
                placeholder="1000"
                value={form.quantityPerPack}
                onChange={(e) => set("quantityPerPack", e.target.value)}
                required
                disabled={isPending}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="BOCA WITHOUT CUTTER PRE-PERFORATED"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              disabled={isPending}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Short product description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pricePerPack">
                Price per Pack (€, excl. VAT) *
              </Label>
              <Input
                id="pricePerPack"
                type="number"
                step="0.01"
                min={0}
                placeholder="42.50"
                value={form.pricePerPack}
                onChange={(e) => set("pricePerPack", e.target.value)}
                required
                disabled={isPending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="isActive">Active</Label>
              <div className="flex items-center gap-2 h-9">
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(v) => set("isActive", v)}
                  disabled={isPending}
                />
                <span className="text-sm text-muted-foreground">
                  {form.isActive ? "In Stock" : "Unavailable"}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductTable({ products }) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [isPending, startTransition] = useTransition();

  const filtered = products.filter(
    (p) =>
      p.reference.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  );

  function handleCreate(payload) {
    startTransition(async () => {
      try {
        await createProductAction(payload);
        setCreateOpen(false);
        toast.success("Product created successfully.");
      } catch (err) {
        toast.error(err.message ?? "Failed to create product.");
      }
    });
  }

  function handleUpdate(payload) {
    startTransition(async () => {
      try {
        await updateProductAction(payload);
        setEditProduct(null);
        toast.success("Product updated successfully.");
      } catch (err) {
        toast.error(err.message ?? "Failed to update product.");
      }
    });
  }

  function handleDelete() {
    if (!deleteProduct) return;
    startTransition(async () => {
      try {
        await deleteProductAction(deleteProduct.id);
        setDeleteProduct(null);
        toast.success("Product deleted.");
      } catch (err) {
        toast.error(err.message ?? "Failed to delete product.");
      }
    });
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search by reference or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Product
        </Button>
      </div>

      <div className="rounded-md border mt-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Price / Pack</TableHead>
              <TableHead className="text-right">Qty / Pack</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-25" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-10"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-mono text-xs font-medium">
                  {product.reference}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {product.description ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  €{Number(product.pricePerPack).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {product.quantityPerPack.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setEditProduct({
                          id: product.id,
                          reference: product.reference,
                          name: product.name,
                          description: product.description ?? "",
                          pricePerPack: String(Number(product.pricePerPack)),
                          quantityPerPack: String(product.quantityPerPack),
                          isActive: product.isActive,
                        })
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteProduct(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create dialog */}
      <ProductFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initial={null}
        onSave={handleCreate}
        isPending={isPending}
      />

      {/* Edit dialog */}
      <ProductFormDialog
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
        initial={editProduct}
        onSave={handleUpdate}
        isPending={isPending}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteProduct}
        onOpenChange={(open) => !open && setDeleteProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteProduct?.reference}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
