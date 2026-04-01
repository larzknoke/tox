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

export default function ForgotPasswordPage() {
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
        toast.error(error.message || "Ein Fehler ist aufgetreten");
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success("E-Mail gesendet! Überprüfen Sie Ihr Postfach.");
    } catch (err) {
      toast.error(err?.message || "Ein unerwarteter Fehler ist aufgetreten");
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
            Passwort vergessen?
          </CardTitle>
          <CardDescription className="text-center">
            {success
              ? "Wir haben Ihnen eine E-Mail gesendet"
              : "Geben Sie Ihre E-Mail-Adresse ein, um Ihr Passwort zurückzusetzen"}
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
                  Wir haben einen Link zum Zurücksetzen des Passworts an
                </p>
                <p className="font-medium">{email}</p>
                <p className="text-sm text-muted-foreground">
                  gesendet. Überprüfen Sie Ihr Postfach und folgen Sie den
                  Anweisungen.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Haben Sie keine E-Mail erhalten? Überprüfen Sie Ihren
                Spam-Ordner oder versuchen Sie es erneut.
              </p>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mustermann@domain.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Wird gesendet..." : "Link zum Zurücksetzen senden"}
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
            Zurück zur Anmeldung
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
