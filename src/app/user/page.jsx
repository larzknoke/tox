import { Suspense } from "react";
import UserTable from "./components/userTable";
import prisma from "@/lib/prisma";
import { Skeleton } from "@/components/ui/skeleton";
import { requireSession } from "@/lib/auth-helper";
import { hasRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";

async function getUsers() {
  const users = await prisma.user.findMany({
    include: {
      sessions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
      accounts: true,
      trainer: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  return users;
}

async function getTrainers() {
  const trainers = await prisma.trainer.findMany({
    orderBy: { name: "asc" },
  });
  return trainers;
}

async function UserManagement() {
  const session = await requireSession();

  // Only allow admin users
  if (!hasRole(session, "admin")) {
    redirect("/home");
  }

  const users = await getUsers();
  const trainers = await getTrainers();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Benutzerverwaltung" />
      <Suspense fallback={<Skeleton />}>
        <UserTable users={users} trainers={trainers} session={session} />
      </Suspense>
    </div>
  );
}

export default UserManagement;
