import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../../generated/prisma/client";
import { admin } from "better-auth/plugins";
import { sendEmail } from "./email.js";
import {
  emailVerificationTemplate,
  passwordResetTemplate,
} from "../email/authEmails.js";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      const promise = sendEmail({
        to: user.email,
        subject: "Passwort zurücksetzen",
        html: passwordResetTemplate(user, url),
      });

      // 🔐 verhindert Timing Attacks
      // 📨 garantiert Mail-Versand auf Vercel
      request?.waitUntil?.(promise);
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      const promise = sendEmail({
        to: user.email,
        subject: "Verifizieren Sie Ihre E-Mail-Adresse",
        html: emailVerificationTemplate(user, url),
      });

      // 🔐 verhindert Timing Attacks
      // 📨 garantiert Mail-Versand auf Vercel
      request?.waitUntil?.(promise);
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  appUrl: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  plugins: [
    admin({
      roles: ["ADMIN", "CUSTOMER"],
      defaultRole: "CUSTOMER",
      adminRole: "ADMIN",
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Send notification email to admin when a new user signs up
          try {
            const { sendAdminNewUserNotification } =
              await import("./send-new-user-email.js");
            await sendAdminNewUserNotification(user);
          } catch (error) {
            console.error(
              "Error sending admin notification for new signup:",
              error,
            );
            // Don't throw - we don't want to fail the signup if email fails
          }
        },
      },
    },
  },
});
