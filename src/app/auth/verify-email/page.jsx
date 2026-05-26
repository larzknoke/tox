"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Ticket, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setErrorMessage(t("verifyEmail.errors.noToken"));
        return;
      }

      try {
        const response = await authClient.emailVerification.verify({
          query: {
            token,
          },
        });

        if (response.error) {
          setStatus("error");
          setErrorMessage(
            response.error.message || t("verifyEmail.errors.failed"),
          );
        } else {
          setStatus("success");
          // Redirect to sign in after 3 seconds
          setTimeout(() => {
            router.push("/signin");
          }, 3000);
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage(error.message || t("verifyEmail.errors.unexpected"));
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center">
            {status === "verifying" && (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            )}
            {status === "error" && (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl text-center">
            {status === "verifying" && t("verifyEmail.titleVerifying")}
            {status === "success" && t("verifyEmail.titleSuccess")}
            {status === "error" && t("verifyEmail.titleError")}
          </CardTitle>
          <CardDescription className="text-center">
            {status === "verifying" && t("verifyEmail.subtitleVerifying")}
            {status === "success" && t("verifyEmail.subtitleSuccess")}
            {status === "error" && t("verifyEmail.subtitleError")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-900 text-center">
                {t("verifyEmail.successMessage")}
              </p>
            </div>
          )}
          {status === "error" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-900 text-center">{errorMessage}</p>
              <p className="text-sm text-red-900 text-center mt-2">
                {t("verifyEmail.errorHelp")}
              </p>
            </div>
          )}
        </CardContent>
        {status !== "verifying" && (
          <CardFooter>
            <Link href="/signin" className="w-full">
              <Button className="w-full">
                {t("verifyEmail.buttons.goToSignIn")}
              </Button>
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
