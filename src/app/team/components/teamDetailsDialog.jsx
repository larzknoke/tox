"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { formatDate, getGenderLabel } from "@/lib/utils";
import { getTeamDetailsAction } from "../actions/get-team-details";
import { generateTeamPDFAction } from "../actions/generate-team-pdf";
import { getTrainerLicenseLabel } from "@/lib/trainerentgelte";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { hasRole } from "@/lib/roles";

export default function TeamDetailsDialog({
  isOpen,
  onClose,
  teamId,
  session,
}) {
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const groupedPlayers = team
    ? team.playerTeams.reduce((acc, playerTeam) => {
        const year = new Date(playerTeam.player.birthday).getFullYear();
        const key = year.toString();
        if (!acc[key]) acc[key] = [];
        acc[key].push(playerTeam);
        return acc;
      }, {})
    : {};

  const sortedPlayerYears = Object.keys(groupedPlayers).sort(
    (a, b) => parseInt(a) - parseInt(b),
  );

  const isAdminOrKassenwart =
    hasRole(session, "admin") || hasRole(session, "kassenwart");

  useEffect(() => {
    if (isOpen && teamId) {
      loadTeamDetails();
    }
  }, [isOpen, teamId]);

  const loadTeamDetails = async () => {
    setIsLoading(true);
    try {
      const result = await getTeamDetailsAction(teamId);
      if (result.success) {
        setTeam(result.team);
      } else {
        toast.error("Fehler beim Laden des Teams: " + result.error);
        onClose();
      }
    } catch (error) {
      console.error("Error loading team:", error);
      toast.error("Fehler beim Laden des Teams");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!team) return;

    setIsGeneratingPDF(true);
    try {
      // Generate PDF on server
      const result = await generateTeamPDFAction(team.id, isAdminOrKassenwart);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Convert array buffer to blob
      const blob = new Blob([new Uint8Array(result.pdfBuffer)], {
        type: "application/pdf",
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF erfolgreich heruntergeladen!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Fehler beim Erstellen des PDFs: " + error.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full lg:max-w-4xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Team Details {team && `- ${team.name}`}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : team ? (
          <div className="space-y-6">
            {/* Team Information */}
            <div>
              <ul className="list-none space-y-2">
                <li>
                  <strong className="inline-block w-32">Team Name</strong>{" "}
                  {team.name}
                </li>
                <li>
                  <strong className="inline-block w-32">Erstellt am</strong>{" "}
                  {formatDate(team.createdAt)}
                </li>
                <li>
                  <strong className="inline-block w-32">Anzahl Trainer</strong>{" "}
                  {team.trainerTeams.length}
                </li>
                <li>
                  <strong className="inline-block w-32">Anzahl Spieler</strong>{" "}
                  {team.playerTeams.length}
                </li>
              </ul>
            </div>
            <Separator />

            {/* Trainers Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Trainer ({team.trainerTeams.length})
              </h3>
              {team.trainerTeams.length === 0 ? (
                <p className="text-muted-foreground">
                  Keine Trainer zugeordnet
                </p>
              ) : (
                <div className="border rounded overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          Stammverein
                        </th>
                        {isAdminOrKassenwart && (
                          <th className="px-4 py-3 text-left font-medium">
                            Lizenz
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {team.trainerTeams.map((trainerTeam) => (
                        <tr
                          key={trainerTeam.id}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            {trainerTeam.trainer.name}
                          </td>
                          <td className="px-4 py-3">
                            {trainerTeam.trainer.stammverein || "-"}
                          </td>
                          {isAdminOrKassenwart && (
                            <td className="px-4 py-3">
                              {trainerTeam.trainer.licenseType
                                ? getTrainerLicenseLabel(
                                    trainerTeam.trainer.licenseType,
                                  )
                                : "-"}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <Separator />

            {/* Players Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Spieler ({team.playerTeams.length})
              </h3>
              {team.playerTeams.length === 0 ? (
                <p className="text-muted-foreground">
                  Keine Spieler zugeordnet
                </p>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {sortedPlayerYears.map((year) => (
                    <div key={year} className="border rounded overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 font-medium">
                        Jahrgang {year}
                      </div>
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Geburtstag
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Geschlecht
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...groupedPlayers[year]]
                            .sort((a, b) =>
                              a.player.name.localeCompare(b.player.name, "de"),
                            )
                            .map((playerTeam) => (
                              <tr
                                key={playerTeam.id}
                                className="border-t hover:bg-gray-50"
                              >
                                <td className="px-4 py-3">
                                  {playerTeam.player.name}
                                </td>
                                <td className="px-4 py-3">
                                  {formatDate(playerTeam.player.birthday)}
                                </td>
                                <td className="px-4 py-3">
                                  {getGenderLabel(playerTeam.player.gender)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isGeneratingPDF}
            className="w-full sm:w-auto"
          >
            Schließen
          </Button>
          {team && (
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              disabled={isLoading || isGeneratingPDF}
              className="w-full sm:w-auto"
            >
              <Download size={16} />
              {isGeneratingPDF ? "Erstelle PDF..." : "Team PDF"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
