"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function changePasswordAction(currentPassword, newPassword) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Benutzer nicht authentifiziert",
      };
    }

    // Use the changePassword API with current password verification
    const data = await auth.api.changePassword({
      body: {
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: false,
      },
      headers: await headers(),
    });

    if (data.error) {
      return {
        success: false,
        error: data.error.message || "Fehler beim Ändern des Passworts",
      };
    }

    return {
      success: true,
      message: "Passwort erfolgreich geändert",
    };
  } catch (error) {
    console.error("Password change error:", error);
    return {
      success: false,
      error:
        error.message || "Ein Fehler beim Ändern des Passworts ist aufgetreten",
    };
  }
}
