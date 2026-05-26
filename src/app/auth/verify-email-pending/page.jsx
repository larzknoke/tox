"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, LogOut } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";

export default function VerifyEmailPendingPage() {
  const { t } = useLocale();
  const [userEmail, setUserEmail] = useState("");
  const searchParams = useSearchParams();
  const approvalPending = searchParams.get("approval") === "pending";

  useEffect(() => {
    const getSession = async () => {
      const session = await authClient.getSession();
      if (session?.data?.user?.email) {
        setUserEmail(session.data.user.email);
      }
    };
    getSession();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center">
            <Mail className="h-12 w-12 text-gray-800" />
          </div>
          <CardTitle className="text-2xl text-center">
            {approvalPending
              ? t("verifyEmailPending.titleApprovalPending")
              : t("verifyEmailPending.titleVerificationRequired")}
          </CardTitle>
          <CardDescription className="text-center">
            {approvalPending
              ? t("verifyEmailPending.subtitleApprovalPending")
              : t("verifyEmailPending.subtitleVerificationRequired")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900 text-center text-balance">
              {approvalPending
                ? t("verifyEmailPending.infoApprovalPending")
                : t("verifyEmailPending.infoVerificationRequired")}
            </p>
            {!approvalPending && userEmail && (
              <p className="text-sm text-blue-900 text-center mt-2">
                {t("verifyEmailPending.sentPrefix")}{" "}
                <strong>{userEmail}</strong>.
              </p>
            )}
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            {approvalPending ? (
              <>
                <p>{t("verifyEmailPending.nextStepsTitle")}</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>{t("verifyEmailPending.approvalSteps.step1")}</li>
                  <li>{t("verifyEmailPending.approvalSteps.step2")}</li>
                  <li>{t("verifyEmailPending.approvalSteps.step3")}</li>
                </ol>
              </>
            ) : (
              <>
                <p>{t("verifyEmailPending.activationStepsTitle")}</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>{t("verifyEmailPending.verificationSteps.step1")}</li>
                  <li>{t("verifyEmailPending.verificationSteps.step2")}</li>
                  <li>{t("verifyEmailPending.verificationSteps.step3")}</li>
                </ol>
                <p className="text-xs mt-4">
                  {t("verifyEmailPending.spamHint")}
                </p>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/signin" className="w-full">
            <Button variant="outline" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              {t("verifyEmailPending.buttons.login")}
            </Button>
          </Link>
          <p className="text-xs text-center text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">
              {t("verifyEmailPending.buttons.backToHome")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
