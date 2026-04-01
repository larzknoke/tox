import { Suspense } from "react";
import TeamTable from "./components/teamTable";
import prisma from "@/lib/prisma";
import { Skeleton } from "@/components/ui/skeleton";
import { requireSession } from "@/lib/auth-helper";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";

async function getTeams() {
  const teams = await prisma.team.findMany({
    include: {
      trainerTeams: {
        include: {
          trainer: true,
        },
      },
      playerTeams: {
        include: {
          player: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
  console.log("Fetched teams:", teams);
  return teams;
}

async function getTrainers() {
  const trainers = await prisma.trainer.findMany();
  return trainers;
}

async function Team() {
  const session = await requireSession();

  const teams = await getTeams();
  const trainers = await getTrainers();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Teams" />
      <Suspense fallback={<Skeleton />}>
        <TeamTable teams={teams} trainers={trainers} session={session} />
      </Suspense>
    </div>
  );
}

export default Team;
