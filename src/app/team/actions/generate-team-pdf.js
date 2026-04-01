"use server";

import { pdf } from "@react-pdf/renderer";
import TeamPDF from "@/pdf/team-pdf";
import prisma from "@/lib/prisma";

export async function generateTeamPDFAction(teamId, showLicense = false) {
  try {
    // Fetch team details from database
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
        },
      },
    });

    if (!team) {
      return { success: false, error: "Team nicht gefunden" };
    }

    // Generate PDF blob and convert to array buffer
    const blob = await pdf(TeamPDF({ team, showLicense })).toBlob();

    const buffer = await blob.arrayBuffer();

    // Generate filename
    const filename = `Team_${team.name.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;

    return {
      success: true,
      pdfBuffer: Array.from(new Uint8Array(buffer)),
      filename,
    };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      success: false,
      error: error.message || "Fehler beim Erstellen des PDFs",
    };
  }
}
