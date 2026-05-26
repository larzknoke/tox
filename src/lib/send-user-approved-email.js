import { sendEmail } from "./email.js";
import { userApprovedEmail } from "../email/userApprovedEmail.js";

export async function sendUserApprovedNotification(user) {
  if (!user?.email) {
    return;
  }

  const emailContent = userApprovedEmail(user);

  await sendEmail({
    to: user.email,
    ...emailContent,
  });
}
