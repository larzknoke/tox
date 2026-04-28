"use client";

import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocale } from "@/lib/locale-context";

export default function Home() {
  const { t } = useLocale();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Ticket className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex flex-col min-h-screen">
        <SidebarTrigger className="absolute top-6 right-6 md:hidden z-10" />
        <section className="relative w-full md:w-[70vw] h-[50vh] overflow-hidden self-center my-10 rounded">
          <Image
            src="/hero.jpg"
            alt={t("home.heroAlt")}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight drop-shadow-lg">
              {t("home.welcomeBack", { name: session.user.name })}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-xl drop-shadow">
              {t("home.tagline")}
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/shop">{t("home.browseShop")}</Link>
            </Button>
          </div>
        </section>
        <footer className="py-6 flex gap-6 flex-wrap items-center justify-center text-sm text-muted-foreground">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://www.francebillet.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt={t("home.globeAlt")}
              width={16}
              height={16}
            />
            {t("home.franceBilletCopyright")}
          </a>
        </footer>
      </div>
    );
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center gap-20 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <SidebarTrigger className="absolute top-6 right-6 md:hidden" />
        <div className="flex items-center justify-center">
          <Ticket className="h-16 w-16 text-primary" />
        </div>
        {t("home.guestHeadline")}
        <div className="flex gap-4 mt-4">
          <Button asChild size="lg">
            <Link href="/signin">{t("home.login")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signup">{t("home.signUp")}</Link>
          </Button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.francebillet.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt={t("home.globeAlt")}
            width={16}
            height={16}
          />
          {t("home.franceBillet")}
        </a>
      </footer>
    </div>
  );
}
