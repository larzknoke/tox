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
import { Pencil, Plus } from "lucide-react";
import { saveAddressAction } from "../actions/save-address";
import { useLocale } from "@/lib/locale-context";

const emptyAddress = {
  firstName: "",
  lastName: "",
  company: "",
  vat: "",
  address1: "",
  address2: "",
  postalCode: "",
  city: "",
  country: "",
  phone: "",
};

export function AddressCard({ type, address, onSave }) {
  const { t } = useLocale();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyAddress);
  const [error, setError] = useState("");
  const [isSaving, startTransition] = useTransition();

  const isBilling = type === "billing";
  const label = isBilling
    ? t("account.address.billingTitle")
    : t("account.address.deliveryTitle");

  const handleOpen = () => {
    setForm(
      address
        ? {
            firstName: address.firstName || "",
            lastName: address.lastName || "",
            company: address.company || "",
            vat: address.vat || "",
            address1: address.address1 || "",
            address2: address.address2 || "",
            postalCode: address.postalCode || "",
            city: address.city || "",
            country: address.country || "",
            phone: address.phone || "",
          }
        : emptyAddress,
    );
    setError("");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const required = [
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
      const result = await saveAddressAction(type, form);
      if (result.success) {
        toast.success(t("account.address.saved", { label }));
        onSave(result.address);
        setIsDialogOpen(false);
      } else {
        setError(t("account.address.errors.saveFailed"));
        toast.error(t("account.address.errors.saveFailed"));
      }
    });
  };

  return (
    <>
      <div>
        {address ? (
          <div className="text-sm space-y-0.5 text-muted-foreground">
            <p className="text-foreground font-medium">
              {address.firstName} {address.lastName}
            </p>
            {address.company && <p>{address.company}</p>}
            {type === "billing" && address.vat && (
              <p>Tax identification number: {address.vat}</p>
            )}
            <p>{address.address1}</p>
            {address.address2 && <p>{address.address2}</p>}
            <p>
              {address.postalCode} {address.city}
            </p>
            <p>{address.country}</p>
            <p>{address.phone}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isBilling
              ? t("account.address.noBilling")
              : t("account.address.noDelivery")}
          </p>
        )}
        <div className="flex items-center justify-between mt-4">
          {/* <h4 className="text-sm font-medium">{label}</h4> */}
          <Button variant="outline" size="sm" onClick={handleOpen}>
            {address ? (
              <>
                <Pencil className="h-3.5 w-3.5 mr-1" />{" "}
                {t("account.address.edit")}
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 mr-1" /> {t("account.address.add")}
              </>
            )}
          </Button>
        </div>
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                  disabled={isSaving}
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
                    disabled={isSaving}
                    required
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
                  disabled={isSaving}
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
                  disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                  disabled={isSaving}
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
                  disabled={isSaving}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                {t("account.address.cancel")}
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? t("account.address.saving")
                  : t("account.address.saveAddress")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
