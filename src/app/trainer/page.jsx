import { Suspense } from "react";
import TrainerTable from "./components/trainerTable";
import prisma from "@/lib/prisma";
import { Skeleton } from "@/components/ui/skeleton";
import { requireSession } from "@/lib/auth-helper";
import { PageHeader } from "@/components/page-header";

async function getTrainers() {
  const trainers = await prisma.trainer.findMany({
    include: {
      trainerTeams: {
        include: {
          team: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
  console.log("Fetched trainers:", trainers);
  return trainers;
}

async function getCurrentUserTrainerId(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trainerId: true },
  });

  return user?.trainerId ?? null;
}

async function Trainer() {
  const session = await requireSession();

  const trainers = await getTrainers();
  const currentUserTrainerId = await getCurrentUserTrainerId(session.user.id);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Trainer" />
      <Suspense fallback={<Skeleton />}>
        <TrainerTable
          trainers={trainers}
          session={session}
          currentUserTrainerId={currentUserTrainerId}
        />
      </Suspense>
    </div>
  );
}

export default Trainer;
