"use server";

import prisma from "@/lib/prisma";

export async function getTeamDetailsAction(teamId) {
  try {
    if (!teamId) {
      throw new Error("Team ID ist erforderlich");
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
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
          orderBy: {
            player: {
              name: "asc",
            },
          },
        },
      },
    });

    if (!team) {
      throw new Error("Team nicht gefunden");
    }

    return { success: true, team };
  } catch (error) {
    console.error("Error fetching team details:", error);
    return { success: false, error: error.message };
  }
}
