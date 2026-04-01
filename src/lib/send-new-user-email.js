import { sendEmail } from "./email.js";
import { newUserSignupEmail } from "../email/newUserSignupEmail.js";

/**
 * Send notification email to admin about a new user signup
 * @param {Object} user - The newly registered user object
 */
export async function sendAdminNewUserNotification(user) {
  try {
    // Get admin email from environment variable
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.log("ADMIN_EMAIL environment variable not set");
      return;
    }

    // Generate email content
    const emailContent = newUserSignupEmail(user);

    // Send email to admin
    await sendEmail({
      to: adminEmail,
      ...emailContent,
    });

    console.log(`New user signup notification sent to ${adminEmail}`);
  } catch (error) {
    console.error("Error sending admin new user notification:", error);
    throw error;
  }
}
