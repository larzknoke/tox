import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getLocale } from "@/lib/i18n-server";
import { getMessages } from "@/lib/i18n";
import SupportTable from "./components/SupportTable";

async function getSupportTickets() {
  return prisma.supportTicket.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function SupportContent() {
  const session = await requireSession();
  if (!hasRole(session, "ADMIN")) redirect("/");
  const locale = await getLocale();
  const messages = getMessages(locale);

  const raw = await getSupportTickets();
  const tickets = raw.map((ticket) => ({
    ...ticket,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={messages.support?.admin?.pageTitle ?? "Support Tickets"} />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <SupportTable tickets={tickets} />
      </Suspense>
    </div>
  );
}

export default SupportContent;
