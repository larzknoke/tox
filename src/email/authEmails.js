export const emailVerificationTemplate = (user, url) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="margin: 0; color: #1f2937; font-size: 24px;">Email Verification</h1>
          </div>

          <p style="font-size: 16px; color: #1f2937; margin-bottom: 24px;">
            Hello ${user.name},
          </p>

          <p style="font-size: 14px; color: #4b5563; margin-bottom: 24px;">
            Thank you for registering with tox. Please verify your email address to activate your account.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 500; font-size: 16px;">
              Verify Email
            </a>
          </div>

          <p style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">
            If the button doesn't work, please copy this link into your browser:
          </p>
          <p style="font-size: 12px; color: #3b82f6; word-break: break-all; margin-bottom: 24px;">
            ${url}
          </p>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">If you did not register, you can ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const passwordResetTemplate = (user, url) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="margin: 0; color: #1f2937; font-size: 24px;">Reset Password</h1>
          </div>

          <p style="font-size: 16px; color: #1f2937; margin-bottom: 24px;">
            Hello ${user.name},
          </p>

          <p style="font-size: 14px; color: #4b5563; margin-bottom: 24px;">
            You requested to reset your password. Click the button below to set a new password.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 500; font-size: 16px;">
              Reset Password
            </a>
          </div>

          <p style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">
            If the button doesn't work, please copy this link into your browser:
          </p>
          <p style="font-size: 12px; color: #3b82f6; word-break: break-all; margin-bottom: 24px;">
            ${url}
          </p>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">If you did not make this request, you can ignore this email.</p>
            <p style="margin: 8px 0 0 0;">This link expires after 15 minutes.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
