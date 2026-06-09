import { sendEmail } from "./email.js";
import { newUserSignupEmail } from "../email/newUserSignupEmail.js";

function parseAdminEmailsFromEnv(rawValue) {
  if (!rawValue || !rawValue.trim()) {
    return [];
  }

  // Preferred: JSON array, e.g. ["a@x.com","b@y.com"]
  try {
    const parsed = JSON.parse(rawValue);
    const list = Array.isArray(parsed) ? parsed : [parsed];
    return list
      .filter((value) => typeof value === "string")
      .map((email) => email.trim())
      .filter(Boolean);
  } catch {
    // Fallback: comma-separated string
    return rawValue
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
  }
}

/**
 * Send notification email to admin about a new user signup
 * @param {Object} user - The newly registered user object
 */
export async function sendAdminNewUserNotification(user) {
  try {
    const developmentAdminEmails = parseAdminEmailsFromEnv(
      process.env.NEW_USER_REGISTRATION_EMAIL,
    );

    if (developmentAdminEmails.length === 0) {
      console.log(
        "NEW_USER_REGISTRATION_EMAIL is missing/invalid. Skipping new user notification.",
      );
      return;
    }

    const emailContent = newUserSignupEmail(user);

    await sendEmail({
      to: developmentAdminEmails,
      ...emailContent,
    });

    console.log(
      `New user signup notification sent to configured admins (${developmentAdminEmails.join(", ")})`,
    );
  } catch (error) {
    console.error("Error sending admin new user notification:", error);
    throw error;
  }
}
