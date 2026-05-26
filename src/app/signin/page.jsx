"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Ticket } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";

export default function SignInPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.email(
        {
          email: formData.email,
          password: formData.password,
          callbackURL: "/",
          rememberMe: formData.rememberMe,
        },
        {
          onRequest: () => {
            setLoading(true);
          },
          onSuccess: () => {
            router.push("/");
          },
          onError: (ctx) => {
            console.log(ctx?.error);
            const code = ctx?.error?.code;
            if (code === "EMAIL_NOT_VERIFIED") {
              setLoading(false);
              router.push("/auth/verify-email-pending");
              return;
            }
            if (code === "INVALID_EMAIL_OR_PASSWORD") {
              const message = t("signin.errors.invalidCredentials");
              setError(message);
              toast.error(message);
              setLoading(false);
              return;
            }
            if (code === "BANNED_USER") {
              const message = t("signin.errors.blocked");
              setError(message);
              toast.error(message);
              setLoading(false);
              return;
            }
            const message = ctx?.error?.message || t("signin.errors.generic");
            setError(message);
            toast.error(message);
            setLoading(false);
          },
        },
      );
    } catch (err) {
      const message = err?.message || t("signin.errors.unexpected");
      setError(message);
      toast.error(message);
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
            {t("signin.title")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("signin.subtitle")}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )} */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("signin.fields.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("signin.placeholders.email")}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("signin.fields.password")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  {t("signin.forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>
            <div className="flex items-center space-x-2 mb-5">
              <input
                id="remember"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) =>
                  setFormData({ ...formData, rememberMe: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="remember" className="text-sm cursor-pointer">
                {t("signin.rememberMe")}
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? t("signin.buttons.loggingIn")
                : t("signin.buttons.login")}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {t("signin.noAccount")}{" "}
              <Link href="/signup" className="text-primary hover:underline">
                {t("signin.buttons.signUp")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
