import BillForm from "./components/bill-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { PageHeader } from "@/components/page-header";

async function getTrainers() {
  const trainers = await prisma.trainer.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return trainers;
}

async function getTeams() {
  const teams = await prisma.team.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return teams;
}

async function NewBill() {
  const session = await requireSession();
  const trainers = await getTrainers();
  const teams = await getTeams();
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { trainerId: true },
  });

  let preselectedTeamId = null;
  if (currentUser?.trainerId) {
    const trainerWithTeams = await prisma.trainer.findUnique({
      where: { id: currentUser.trainerId },
      select: {
        trainerTeams: {
          select: { teamId: true },
        },
      },
    });
    const teamIds =
      trainerWithTeams?.trainerTeams?.map((tt) => tt.teamId) || [];
    if (teamIds.length === 1) {
      preselectedTeamId = teamIds[0];
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Neue Abrechnung" />
      <BillForm
        trainers={trainers}
        teams={teams}
        currentUser={currentUser}
        preselectedTeamId={preselectedTeamId}
      />
    </div>
  );
}

export default NewBill;
