import TravelReportForm from "./components/travel-report-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { PageHeader } from "@/components/page-header";

async function getTeams() {
  const teams = await prisma.team.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return teams;
}

async function NewTravelReport() {
  const session = await requireSession();
  const teams = await getTeams();
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { trainerId: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Neue Fahrtkosten" />
      <TravelReportForm teams={teams} currentUser={currentUser} />
    </div>
  );
}

export default NewTravelReport;
