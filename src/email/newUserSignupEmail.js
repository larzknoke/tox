export const newUserSignupEmail = (user) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return {
    subject: `Neue Benutzerregistrierung - ${user.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Neue Benutzerregistrierung</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px;">
              <h1 style="margin: 0; color: #1f2937; font-size: 24px;">Neue Benutzerregistrierung</h1>
            </div>

            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af; font-weight: 500;">
                Ein neuer Benutzer hat sich in tox registriert.
              </p>
            </div>

            <div style="margin-bottom: 24px;">
              <h3 style="color: #1f2937; margin-top: 0; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Benutzerinformationen</h3>
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
                  <td style="padding: 12px 0; font-weight: 500; color: #4b5563;">Registrierungsdatum:</td>
                  <td style="padding: 12px 0; color: #1f2937;">${formatDate(user.createdAt)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-weight: 500; color: #4b5563;">E-Mail verifiziert:</td>
                  <td style="padding: 12px 0; color: #1f2937;">${user.emailVerified ? "Ja" : "Nein"}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Diese Benutzer hat automatisch die Rolle "<strong>trainer</strong>" erhalten. Sie können diese in der Benutzerverwaltung ändern.
              </p>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; color: #6b7280; font-size: 12px;">
              <p style="margin: 0;">Diese E-Mail wurde automatisch von der tox-Anwendung gesendet.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
};
