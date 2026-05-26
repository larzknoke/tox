export const userApprovedEmail = (user) => {
  const appUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  return {
    subject: "Your tox account has been approved",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Approved</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="border-bottom: 3px solid #16a34a; padding-bottom: 16px; margin-bottom: 24px;">
              <h1 style="margin: 0; color: #1f2937; font-size: 24px;">Account Approved</h1>
            </div>

            <p style="font-size: 16px; color: #1f2937; margin-bottom: 24px;">
              Hello ${user.name || "there"},
            </p>

            <p style="font-size: 14px; color: #4b5563; margin-bottom: 24px;">
              Your account has been approved by an administrator. You can now sign in to tox.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${appUrl}/signin" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 500; font-size: 16px;">
                Sign In
              </a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; color: #6b7280; font-size: 12px;">
              <p style="margin: 0;">This email was sent automatically by the tox application.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
};
