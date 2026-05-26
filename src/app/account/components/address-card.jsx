"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { saveAddressAction } from "../actions/save-address";
import { deleteAddressAction } from "../actions/delete-address";
import { setDefaultAddressAction } from "../actions/set-default-address";
import { useLocale } from "@/lib/locale-context";
import { EMPTY_ADDRESS_FORM, mapAddressToForm } from "@/lib/user-addresses";

export function AddressCard({
  type,
  addresses,
  defaultAddressId,
  onSave,
  onDelete,
  onSetDefault,
}) {
  const { t } = useLocale();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [form, setForm] = useState({
    ...EMPTY_ADDRESS_FORM,
    makeDefault: false,
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isBilling = type === "billing";
  const label = isBilling
    ? t("account.address.billingTitle")
    : t("account.address.deliveryTitle");

  const handleOpen = (address = null) => {
    setEditingAddressId(address?.id ?? null);
    setForm({
      ...mapAddressToForm(address),
      makeDefault: address
        ? address.id === defaultAddressId
        : addresses.length === 0,
    });
    setError("");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const required = [
      "label",
      "firstName",
      "lastName",
      "company",
      "address1",
      "postalCode",
      "city",
      "country",
      "phone",
    ];
    for (const field of required) {
      if (!form[field]?.trim()) {
        setError(t("account.address.errors.requiredFields"));
        return;
      }
    }

    startTransition(async () => {
      const result = await saveAddressAction({
        id: editingAddressId,
        type,
        ...form,
      });

      if (result.success) {
        toast.success(t("account.address.saved", { label }));
        onSave({
          type,
          address: result.address,
          defaultAddressId: result.defaultAddressId,
        });
        setIsDialogOpen(false);
      } else {
        setError(t("account.address.errors.saveFailed"));
        toast.error(t("account.address.errors.saveFailed"));
      }
    });
  };

  const handleSetDefault = (addressId) => {
    startTransition(async () => {
      const result = await setDefaultAddressAction(addressId);

      if (result.success) {
        onSetDefault({
          type: result.type,
          defaultAddressId: result.defaultAddressId,
        });
        toast.success(t("account.address.defaultUpdated", { label }));
      } else {
        toast.error(t("account.address.errors.defaultFailed"));
      }
    });
  };

  const handleDelete = () => {
    if (!addressToDelete) {
      return;
    }

    startTransition(async () => {
      const result = await deleteAddressAction(addressToDelete.id);

      if (result.success) {
        onDelete({
          type: result.type,
          addressId: result.addressId,
          defaultAddressId: result.defaultAddressId,
        });
        setAddressToDelete(null);
        toast.success(t("account.address.deleted", { label }));
      } else {
        toast.error(t("account.address.errors.deleteFailed"));
      }
    });
  };

  const noAddressText = isBilling
    ? t("account.address.noBilling")
    : t("account.address.noDelivery");

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {t("account.address.addressBookDescription")}
          </p>
          <Button variant="outline" size="sm" onClick={() => handleOpen()}>
            <Plus className="h-3.5 w-3.5 mr-1" /> {t("account.address.add")}
          </Button>
        </div>

        {addresses.length ? (
          <div className="space-y-3">
            {addresses.map((address) => {
              const isDefault = address.id === defaultAddressId;

              return (
                <div
                  key={address.id}
                  className="rounded-lg border p-4 space-y-3 bg-background"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">
                          {address.label}
                        </p>
                        {isDefault && (
                          <Badge variant="secondary">
                            {t("account.address.defaultBadge")}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm space-y-0.5 text-muted-foreground">
                        <p className="text-foreground font-medium">
                          {address.firstName} {address.lastName}
                        </p>
                        {address.company && <p>{address.company}</p>}
                        {type === "billing" && address.vat && (
                          <p>
                            {t("checkout.taxId")}: {address.vat}
                          </p>
                        )}
                        <p>{address.address1}</p>
                        {address.address2 && <p>{address.address2}</p>}
                        <p>
                          {address.postalCode} {address.city}
                        </p>
                        <p>{address.country}</p>
                        <p>{address.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!isDefault && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                        disabled={isPending}
                      >
                        <Star className="h-3.5 w-3.5 mr-1" />
                        {t("account.address.setDefault")}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpen(address)}
                      disabled={isPending}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      {t("account.address.edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddressToDelete(address)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      {t("account.address.delete")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{noAddressText}</p>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              {isBilling
                ? t("account.address.editBillingDescription")
                : t("account.address.editDeliveryDescription")}
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
                <Label htmlFor="addr-label">
                  {t("account.address.fields.label")}
                </Label>
                <Input
                  id="addr-label"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  disabled={isPending}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addr-firstName">
                    {t("account.address.fields.firstName")}
                  </Label>
                  <Input
                    id="addr-firstName"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                    disabled={isPending}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-lastName">
                    {t("account.address.fields.lastName")}
                  </Label>
                  <Input
                    id="addr-lastName"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                    disabled={isPending}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-company">
                  {t("account.address.fields.company")}
                </Label>
                <Input
                  id="addr-company"
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  disabled={isPending}
                  required
                />
              </div>
              {isBilling && (
                <div className="space-y-2">
                  <Label htmlFor="addr-vat">
                    {t("account.address.fields.vat")}
                  </Label>
                  <Input
                    id="addr-vat"
                    value={form.vat}
                    onChange={(e) => setForm({ ...form, vat: e.target.value })}
                    disabled={isPending}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="addr-address1">
                  {t("account.address.fields.address1")}
                </Label>
                <Input
                  id="addr-address1"
                  value={form.address1}
                  onChange={(e) =>
                    setForm({ ...form, address1: e.target.value })
                  }
                  disabled={isPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-address2">
                  {t("account.address.fields.address2")}
                </Label>
                <Input
                  id="addr-address2"
                  value={form.address2}
                  onChange={(e) =>
                    setForm({ ...form, address2: e.target.value })
                  }
                  disabled={isPending}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addr-postalCode">
                    {t("account.address.fields.postalCode")}
                  </Label>
                  <Input
                    id="addr-postalCode"
                    value={form.postalCode}
                    onChange={(e) =>
                      setForm({ ...form, postalCode: e.target.value })
                    }
                    disabled={isPending}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-city">
                    {t("account.address.fields.city")}
                  </Label>
                  <Input
                    id="addr-city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    disabled={isPending}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-country">
                  {t("account.address.fields.country")}
                </Label>
                <Input
                  id="addr-country"
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  disabled={isPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-phone">
                  {t("account.address.fields.phone")}
                </Label>
                <Input
                  id="addr-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  disabled={isPending}
                  required
                />
              </div>
              <div className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                  id={`addr-default-${type}`}
                  checked={form.makeDefault}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, makeDefault: checked === true })
                  }
                  disabled={isPending}
                />
                <Label htmlFor={`addr-default-${type}`}>
                  {t("account.address.fields.makeDefault")}
                </Label>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
              >
                {t("account.address.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? t("account.address.saving")
                  : t("account.address.saveAddress")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(addressToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setAddressToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("account.address.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("account.address.deleteDescription", {
                label: addressToDelete?.label ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {t("account.address.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {t("account.address.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
