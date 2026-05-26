"use client";

import { useState } from "react";
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
import { Ticket, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await authClient.requestPasswordReset({
        email: email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message || t("forgotPassword.errors.generic"));
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success(t("forgotPassword.feedback.emailSent"));
    } catch (err) {
      toast.error(err?.message || t("forgotPassword.errors.unexpected"));
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
            {t("forgotPassword.title")}
          </CardTitle>
          <CardDescription className="text-center">
            {success
              ? t("forgotPassword.subtitleSuccess")
              : t("forgotPassword.subtitle")}
          </CardDescription>
        </CardHeader>

        {success ? (
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t("forgotPassword.sent.line1")}
                </p>
                <p className="font-medium">{email}</p>
                <p className="text-sm text-muted-foreground">
                  {t("forgotPassword.sent.line2")}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("forgotPassword.sent.line3")}
              </p>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t("forgotPassword.fields.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("forgotPassword.placeholders.email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? t("forgotPassword.buttons.sending")
                  : t("forgotPassword.buttons.sendLink")}
              </Button>
            </CardFooter>
          </form>
        )}

        <CardFooter className="flex justify-center border-t pt-4">
          <Link
            href="/signin"
            className="text-sm text-primary hover:underline flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("forgotPassword.buttons.backToSignIn")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
