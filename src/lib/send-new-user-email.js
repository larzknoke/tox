import { sendEmail } from "./email.js";
import { newUserSignupEmail } from "../email/newUserSignupEmail.js";
import prisma from "./prisma.js";

/**
 * Send notification email to admin about a new user signup
 * @param {Object} user - The newly registered user object
 */
export async function sendAdminNewUserNotification(user) {
  try {
    if (process.env.NODE_ENV !== "production") {
      const developmentAdminEmail = process.env.ADMIN_EMAIL;

      if (!developmentAdminEmail) {
        console.log(
          "ADMIN_EMAIL is not set in development. Skipping new user notification.",
        );
        return;
      }

      const emailContent = newUserSignupEmail(user);

      await sendEmail({
        to: developmentAdminEmail,
        ...emailContent,
      });

      console.log(
        `New user signup notification sent to development admin (${developmentAdminEmail})`,
      );
      return;
    }

    const adminUsers = await prisma.user.findMany({
      where: {
        role: "ADMIN",
        email: {
          not: null,
        },
      },
      select: {
        email: true,
      },
    });

    const adminEmails = adminUsers
      .map((adminUser) => adminUser.email)
      .filter(Boolean);

    if (adminEmails.length === 0) {
      console.log("No admin users found for new user notification");
      return;
    }

    const emailContent = newUserSignupEmail(user);

    await Promise.all(
      adminEmails.map((adminEmail) =>
        sendEmail({
          to: adminEmail,
          ...emailContent,
        }),
      ),
    );

    console.log(
      `New user signup notification sent to ${adminEmails.length} admin(s)`,
    );
  } catch (error) {
    console.error("Error sending admin new user notification:", error);
    throw error;
  }
}
