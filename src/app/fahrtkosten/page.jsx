import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import TravelReportTable from "./components/travelReportTable";
import prisma from "@/lib/prisma";
import { hasRole } from "@/lib/roles";
import { requireSession } from "@/lib/auth-helper";
import { PageHeader } from "@/components/page-header";

async function getTravelReports(session) {
  const isAdminOrKassenwart =
    hasRole(session, "admin") || hasRole(session, "kassenwart");

  const travelReports = await prisma.travelReport.findMany({
    where: isAdminOrKassenwart ? {} : { userId: session.user.id },
    include: {
      team: true,
      user: true,
      vehicles: true,
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return travelReports;
}

async function Fahrtkosten() {
  const session = await requireSession();
  const travelReports = await getTravelReports(session);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Fahrtkosten" />
      <Suspense fallback={<Skeleton />}>
        <TravelReportTable travelReports={travelReports} session={session} />
      </Suspense>
    </div>
  );
}

export default Fahrtkosten;
