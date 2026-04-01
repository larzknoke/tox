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

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      const message = "Passwörter stimmen nicht überein";
      setError(message);
      toast.error(message);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await authClient.signUp.email(
        {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          callbackURL: "/",
        },
        {
          onRequest: () => {
            setLoading(true);
          },
          onSuccess: () => {
            setVerificationSent(true);
            setLoading(false);
            toast.success(
              "Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mails.",
            );
          },
          onError: (ctx) => {
            console.log("Sign-up error context:", ctx);
            const message = ctx?.error?.message || "Ein Fehler ist aufgetreten";
            setError(message);
            toast.error(message);
            setLoading(false);
          },
        },
      );
    } catch (err) {
      const message = err?.message || "Ein unerwarteter Fehler ist aufgetreten";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center">
              <Ticket className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">
              E-Mail-Verifizierung
            </CardTitle>
            <CardDescription className="text-center">
              Überprüfen Sie Ihr Postfach
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-900 text-center">
                Wir haben Ihnen eine E-Mail mit einem Bestätigungslink an{" "}
                <strong>{formData.email}</strong> gesendet.
              </p>
              <p className="text-sm text-blue-900 text-center mt-2">
                Bitte klicken Sie auf den Link in der E-Mail, um Ihr Konto zu
                aktivieren.
              </p>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Haben Sie die E-Mail nicht erhalten? Überprüfen Sie bitte auch
              Ihren Spam-Ordner.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/signin" className="w-full">
              <Button variant="outline" className="w-full">
                Zurück zur Anmeldung
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center">
            <Ticket className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">
            Konto erstellen
          </CardTitle>
          <CardDescription className="text-center">
            Geben Sie Ihre Daten ein, um Ihr tox-Konto zu erstellen
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )} */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Max Mustermann"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="mustermann@domain.de"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={8}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mb-4">
                Passwort muss mindestens 8 Zeichen lang sein
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                minLength={8}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-5">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Konto wird erstellt..." : "Registrieren"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Bereits ein Konto?{" "}
              <Link href="/signin" className="text-primary hover:underline">
                Anmelden
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
