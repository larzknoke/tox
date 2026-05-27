import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | tox",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">
        Last updated: May 26, 2026
      </p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Overview</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          This is a placeholder privacy policy page. It explains in general
          terms how this application may process personal data and use cookies.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. Cookies</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          We use essential cookies to keep you signed in, protect your session,
          and maintain basic preferences such as language. Additional cookies
          may be added in future versions of the service.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Data We Process</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Depending on your usage, we may process account details, order-related
          information, support inquiries, and technical logs for security and
          troubleshooting.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Contact</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          For privacy questions, please contact the platform administrator.
        </p>
      </section>

      <p className="text-sm">
        <Link href="/" className="underline underline-offset-4">
          Back to home
        </Link>
      </p>
    </div>
  );
}
