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

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      setError(
        "Der Link zum Zurücksetzen ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.",
      );
      toast.error("Ungültiger oder abgelaufener Link");
    }

    if (!tokenFromUrl && !errorFromUrl) {
      setError("Kein Token gefunden. Bitte fordern Sie einen neuen Link an.");
    }

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Kein Token gefunden. Bitte fordern Sie einen neuen Link an.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein");
      toast.error("Die Passwörter stimmen nicht überein");
      return;
    }

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein");
      toast.error("Das Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });

      if (error) {
        setError(error.message || "Ein Fehler ist aufgetreten");
        toast.error(error.message || "Ein Fehler ist aufgetreten");
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success("Passwort erfolgreich zurückgesetzt!");

      // Redirect to signin after 2 seconds
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (err) {
      const message = err?.message || "Ein unerwarteter Fehler ist aufgetreten";
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
            {success ? "Passwort zurückgesetzt" : "Neues Passwort festlegen"}
          </CardTitle>
          <CardDescription className="text-center">
            {success
              ? "Ihr Passwort wurde erfolgreich zurückgesetzt"
              : "Geben Sie Ihr neues Passwort ein"}
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
                  Ihr Passwort wurde erfolgreich zurückgesetzt.
                </p>
                <p className="text-sm text-muted-foreground">
                  Sie werden in Kürze zur Anmeldeseite weitergeleitet...
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
                Neuen Link anfordern
              </Button>
            </Link>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Neues Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mindestens 8 Zeichen"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Passwort wiederholen"
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
                {loading ? "Wird gespeichert..." : "Passwort zurücksetzen"}
              </Button>
              <Link
                href="/signin"
                className="text-sm text-center text-muted-foreground hover:text-primary"
              >
                Zurück zur Anmeldung
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
          Lädt...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
