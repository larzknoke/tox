import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import BillTable from "./components/billTable";
import prisma from "@/lib/prisma";
import { hasRole } from "@/lib/roles";
import { requireSession } from "@/lib/auth-helper";
import { PageHeader } from "@/components/page-header";

async function getBills(session) {
  const isAdminOrKassenwart =
    hasRole(session, "admin") || hasRole(session, "kassenwart");

  const bills = await prisma.bill.findMany({
    where: isAdminOrKassenwart ? {} : { userId: session.user.id },
    include: {
      trainer: true,
      team: true,
      user: true,
    },
    orderBy: [{ createdAt: "desc" }],
  });

  console.log("Fetched bills:", bills);
  return bills;
}

async function Abrechnung() {
  const session = await requireSession();

  const bills = await getBills(session);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Abrechnungen" />
      <Suspense fallback={<Skeleton />}>
        <BillTable bills={bills} session={session} />
      </Suspense>
    </div>
  );
}

export default Abrechnung;
