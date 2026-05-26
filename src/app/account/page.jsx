"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAddressesAction } from "./actions/get-addresses";
import { PageHeader } from "@/components/page-header";
import { AccountInfo } from "./components/account-info";
import { AddressCard } from "./components/address-card";
import { ChangePasswordDialog } from "./components/change-password-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocale } from "@/lib/locale-context";

const emptyAddressBook = {
  billingAddresses: [],
  deliveryAddresses: [],
  defaultBillingAddressId: null,
  defaultDeliveryAddressId: null,
};

export default function AccountPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { data: session, isPending } = authClient.useSession();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [addressBook, setAddressBook] = useState(emptyAddressBook);

  useEffect(() => {
    if (session?.user) {
      getAddressesAction().then((result) => {
        if (result.success) {
          setAddressBook({
            billingAddresses: result.billingAddresses,
            deliveryAddresses: result.deliveryAddresses,
            defaultBillingAddressId: result.defaultBillingAddressId,
            defaultDeliveryAddressId: result.defaultDeliveryAddressId,
          });
        }
      });
    }
  }, [session]);

  const handleAddressSaved = ({ type, address, defaultAddressId }) => {
    const listKey =
      type === "billing" ? "billingAddresses" : "deliveryAddresses";
    const defaultKey =
      type === "billing"
        ? "defaultBillingAddressId"
        : "defaultDeliveryAddressId";

    setAddressBook((current) => {
      const nextAddresses = current[listKey].some(
        (entry) => entry.id === address.id,
      )
        ? current[listKey].map((entry) =>
            entry.id === address.id ? address : entry,
          )
        : [address, ...current[listKey]];

      return {
        ...current,
        [listKey]: nextAddresses,
        [defaultKey]: defaultAddressId ?? current[defaultKey],
      };
    });
  };

  const handleAddressDeleted = ({ type, addressId, defaultAddressId }) => {
    const listKey =
      type === "billing" ? "billingAddresses" : "deliveryAddresses";
    const defaultKey =
      type === "billing"
        ? "defaultBillingAddressId"
        : "defaultDeliveryAddressId";

    setAddressBook((current) => ({
      ...current,
      [listKey]: current[listKey].filter((entry) => entry.id !== addressId),
      [defaultKey]: defaultAddressId,
    }));
  };

  const handleDefaultChanged = ({ type, defaultAddressId }) => {
    const defaultKey =
      type === "billing"
        ? "defaultBillingAddressId"
        : "defaultDeliveryAddressId";

    setAddressBook((current) => ({
      ...current,
      [defaultKey]: defaultAddressId,
    }));
  };

  if (!isPending && !session) {
    router.push("/signin");
    return null;
  }

  if (isPending) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    router.push("/signin");
    return null;
  }

  return (
    <div className="container mx-auto">
      <PageHeader title={t("account.pageTitle")} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5 items-start">
        <Card>
          <CardHeader>
            <CardTitle>{t("account.info.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountInfo
              user={session.user}
              session={session.session}
              onChangePassword={() => setIsPasswordDialogOpen(true)}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("account.address.addressBookTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="billing" className="w-full">
              <TabsList className="w-full sm:w-fit">
                <TabsTrigger value="billing" className="sm:min-w-44">
                  {t("account.address.billingTitle")} (
                  {addressBook.billingAddresses.length})
                </TabsTrigger>
                <TabsTrigger value="delivery" className="sm:min-w-44">
                  {t("account.address.deliveryTitle")} (
                  {addressBook.deliveryAddresses.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="billing" className="mt-4">
                <AddressCard
                  type="billing"
                  addresses={addressBook.billingAddresses}
                  defaultAddressId={addressBook.defaultBillingAddressId}
                  onSave={handleAddressSaved}
                  onDelete={handleAddressDeleted}
                  onSetDefault={handleDefaultChanged}
                />
              </TabsContent>

              <TabsContent value="delivery" className="mt-4">
                <AddressCard
                  type="delivery"
                  addresses={addressBook.deliveryAddresses}
                  defaultAddressId={addressBook.defaultDeliveryAddressId}
                  onSave={handleAddressSaved}
                  onDelete={handleAddressDeleted}
                  onSetDefault={handleDefaultChanged}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </div>
  );
}
