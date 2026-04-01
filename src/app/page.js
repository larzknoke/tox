"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Ticket className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center gap-20  sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <SidebarTrigger className="absolute top-6 right-6 md:hidden" />
        <div className="flex items-center justify-center">
          <Ticket className="h-16 w-16 text-primary" />
        </div>
        Ticket Order Extranet | France Billet ©2026
        {!session && (
          <div className="flex gap-4 mt-4">
            <Button asChild size="lg">
              <Link href="/signin">Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/signup">Registrieren</Link>
            </Button>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.francebillet.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          France Billet
        </a>
      </footer>
    </div>
  );
}
