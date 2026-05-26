"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Ticket, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    const errorFromUrl = searchParams.get("error");

    if (errorFromUrl) {
      setError(t("resetPassword.errors.invalidOrExpired"));
      toast.error(t("resetPassword.errors.invalidOrExpiredShort"));
    }

    if (!tokenFromUrl && !errorFromUrl) {
      setError(t("resetPassword.errors.noToken"));
    }

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(t("resetPassword.errors.noToken"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("resetPassword.errors.passwordsMismatch"));
      toast.error(t("resetPassword.errors.passwordsMismatch"));
      return;
    }

    if (password.length < 8) {
      setError(t("resetPassword.errors.passwordTooShort"));
      toast.error(t("resetPassword.errors.passwordTooShort"));
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });

      if (error) {
        setError(error.message || t("resetPassword.errors.generic"));
        toast.error(error.message || t("resetPassword.errors.generic"));
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success(t("resetPassword.feedback.success"));

      // Redirect to signin after 2 seconds
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (err) {
      const message = err?.message || t("resetPassword.errors.unexpected");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center">
            <Ticket className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">
            {success
              ? t("resetPassword.titleSuccess")
              : t("resetPassword.title")}
          </CardTitle>
          <CardDescription className="text-center">
            {success
              ? t("resetPassword.subtitleSuccess")
              : t("resetPassword.subtitle")}
          </CardDescription>
        </CardHeader>

        {success ? (
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t("resetPassword.success.line1")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("resetPassword.success.line2")}
                </p>
              </div>
            </div>
          </CardContent>
        ) : error ? (
          <CardContent className="space-y-4">
            <div className="p-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
            <Link href="/forgot-password">
              <Button className="w-full" variant="outline">
                {t("resetPassword.buttons.requestNewLink")}
              </Button>
            </Link>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  {t("resetPassword.fields.newPassword")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("resetPassword.placeholders.newPassword")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("resetPassword.fields.confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("resetPassword.placeholders.confirmPassword")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? t("resetPassword.buttons.saving")
                  : t("resetPassword.buttons.resetPassword")}
              </Button>
              <Link
                href="/signin"
                className="text-sm text-center text-muted-foreground hover:text-primary"
              >
                {t("resetPassword.buttons.backToSignIn")}
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          {t("resetPassword.loading")}
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
