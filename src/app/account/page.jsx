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
import { useLocale } from "@/lib/locale-context";

export default function AccountPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { data: session, isPending } = authClient.useSession();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [billingAddress, setBillingAddress] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  useEffect(() => {
    if (session?.user) {
      getAddressesAction().then((result) => {
        if (result.success) {
          setBillingAddress(result.billingAddress);
          setDeliveryAddress(result.deliveryAddress);
        }
      });
    }
  }, [session]);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
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
        <Card>
          <CardHeader>
            <CardTitle>{t("account.address.billingTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressCard
              type="billing"
              address={billingAddress}
              onSave={setBillingAddress}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("account.address.deliveryTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressCard
              type="delivery"
              address={deliveryAddress}
              onSave={setDeliveryAddress}
            />
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
