import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { admin } from "better-auth/plugins";
import { sendEmail } from "./email.js";
import {
  emailVerificationTemplate,
  passwordResetTemplate,
} from "../email/authEmails.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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
        subject: "Reset Password",
        html: passwordResetTemplate(user, url),
      });

      // Prevents timing attacks
      // Ensures email delivery on Vercel
      if (request?.waitUntil) {
        request.waitUntil(promise);
      } else {
        await promise;
      }
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      const promise = sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: emailVerificationTemplate(user, url),
      });

      // Prevents timing attacks
      // Ensures email delivery on Vercel
      if (request?.waitUntil) {
        request.waitUntil(promise);
      } else {
        await promise;
      }
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
