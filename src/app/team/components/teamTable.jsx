"use client";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import TeamListDropdown from "./teamListDropdown";
import TeamDeleteDialog from "./teamDeleteDialog";
import TeamNewDialog from "./teamNewDialog";
import TeamEditDialog from "./teamEditDialog";
import TeamDetailsDialog from "./teamDetailsDialog";
import { hasRole } from "@/lib/roles";

function TeamTable({ teams, trainers, session }) {
  const router = useRouter();
  const [deleteDialogState, setDeleteDialogState] = useState({
    open: false,
    team: null,
  });
  const [editDialogState, setEditDialogState] = useState({
    open: false,
    team: null,
  });
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const isAdminOrKassenwart =
    hasRole(session, "admin") || hasRole(session, "kassenwart");

  const handleRowClick = (teamId, event) => {
    // Don't open details dialog if clicking on dropdown menu
    if (event.target.closest('[role="button"]')) {
      return;
    }
    setSelectedTeamId(teamId);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedTeamId(null);
  };

  const openDeleteDialog = (team) => setDeleteDialogState({ open: true, team });
  const closeDeleteDialog = () =>
    setDeleteDialogState({ open: false, team: null });

  const openEditDialog = (team) => setEditDialogState({ open: true, team });
  const closeEditDialog = () => setEditDialogState({ open: false, team: null });

  return (
    <>
      <div className="w-full flex flex-row gap-6 justify-between">
        <InputGroup className="max-w-sm">
          <InputGroupInput placeholder="Suche..." />
          <InputGroupAddon align="inline-end">
            <InputGroupButton variant="secondary">Suche</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <Button
          disabled={!isAdminOrKassenwart}
          variant="success"
          onClick={() => setNewDialogOpen(true)}
        >
          <PlusIcon /> Neues Team
        </Button>
      </div>
      <Table>
        <TableCaption>Alle Teams</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead>Trainer</TableHead>
            <TableHead>Spieler</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow
              key={team.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={(e) => handleRowClick(team.id, e)}
            >
              <TableCell className="font-medium">{team.name}</TableCell>
              <TableCell>
                {team.trainerTeams.map((tt) => tt.trainer.name).join(", ")}
              </TableCell>
              <TableCell>{team.playerTeams?.length || 0}</TableCell>
              <TableCell className="text-right">
                {isAdminOrKassenwart && (
                  <TeamListDropdown
                    onDeleteClick={() => openDeleteDialog(team)}
                    onEditClick={() => openEditDialog(team)}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Team Details Dialog */}
      <TeamDetailsDialog
        isOpen={detailsDialogOpen}
        onClose={handleCloseDetailsDialog}
        teamId={selectedTeamId}
        session={session}
      />

      <TeamDeleteDialog
        open={deleteDialogState.open}
        team={deleteDialogState.team}
        onClose={() => {
          setDeleteDialogState({ open: false, team: null });
          router.refresh();
        }}
      />
      <TeamEditDialog
        open={editDialogState.open}
        team={editDialogState.team}
        trainers={trainers}
        onClose={() => {
          setEditDialogState({ open: false, team: null });
          router.refresh();
        }}
      />
      <TeamNewDialog
        open={newDialogOpen}
        trainers={trainers}
        onClose={() => {
          setNewDialogOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}

export default TeamTable;
