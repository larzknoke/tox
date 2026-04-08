export const newUserSignupEmail = (user) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return {
    subject: `New User Registration - ${user.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New User Registration</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px;">
              <h1 style="margin: 0; color: #1f2937; font-size: 24px;">New User Registration</h1>
            </div>

            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af; font-weight: 500;">
                A new user has registered in tox.
              </p>
            </div>

            <div style="margin-bottom: 24px;">
              <h3 style="color: #1f2937; margin-top: 0; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">User Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; font-weight: 500; color: #4b5563; width: 30%;">Name:</td>
                  <td style="padding: 12px 0; color: #1f2937;">${user.name || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-weight: 500; color: #4b5563;">E-Mail:</td>
                  <td style="padding: 12px 0; color: #1f2937;">
                    <a href="mailto:${user.email}" style="color: #3b82f6; text-decoration: none;">${user.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-weight: 500; color: #4b5563;">Registration Date:</td>
                  <td style="padding: 12px 0; color: #1f2937;">${formatDate(user.createdAt)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-weight: 500; color: #4b5563;">Email Verified:</td>
                  <td style="padding: 12px 0; color: #1f2937;">${user.emailVerified ? "Yes" : "No"}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                This user was automatically assigned the role "<strong>CUSTOMER</strong>". You can change this in User Management.
              </p>
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
