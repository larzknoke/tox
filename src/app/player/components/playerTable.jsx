"use client";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import PlayerListDropdown from "./playerListDropdown";
import PlayerDeleteDialog from "./playerDeleteDialog";
import PlayerNewDialog from "./playerNewDialog";
import PlayerEditDialog from "./playerEditDialog";

function PlayerTable({ players, teams }) {
  const router = useRouter();
  const [deleteDialogState, setDeleteDialogState] = useState({
    open: false,
    player: null,
  });
  const [editDialogState, setEditDialogState] = useState({
    open: false,
    player: null,
  });
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupBy, setGroupBy] = useState("team");
  const [teamFilter, setTeamFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("");

  const openDeleteDialog = (player) =>
    setDeleteDialogState({ open: true, player });
  const closeDeleteDialog = () =>
    setDeleteDialogState({ open: false, player: null });

  const openEditDialog = (player) => setEditDialogState({ open: true, player });
  const closeEditDialog = () =>
    setEditDialogState({ open: false, player: null });

  const filteredPlayers = players
    .filter((player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((player) => {
      if (teamFilter === "all") return true;
      if (!player.playerTeams || player.playerTeams.length === 0) return false;
      return player.playerTeams.some(
        (pt) => String(pt.teamId) === String(teamFilter),
      );
    });

  // Group players based on selected grouping method
  const groupedPlayers = filteredPlayers.reduce((acc, player) => {
    let groupKeys = [];

    if (groupBy === "team") {
      // Handle players with no teams
      if (!player.playerTeams || player.playerTeams.length === 0) {
        groupKeys = ["Kein Team"];
      } else {
        // Add player to each of their teams
        groupKeys = player.playerTeams.map((pt) => pt.team.name);
      }
    } else if (groupBy === "year") {
      const year = new Date(player.birthday).getFullYear();
      const gender = player.gender || "Unbekannt";
      groupKeys = [`${year} - ${gender}`];
    } else if (groupBy === "stammverein") {
      const stammverein = player.stammverein || "Kein Stammverein";
      groupKeys = [stammverein];
    }

    groupKeys.forEach((key) => {
      if (!acc[key]) acc[key] = [];
      acc[key].push(player);
    });

    return acc;
  }, {});

  // Sort groups and sort players within each group
  const sortedGroups = Object.keys(groupedPlayers).sort((a, b) => {
    // For year grouping, sort numerically by year, then by gender
    if (groupBy === "year") {
      const [yearA, genderA] = a.split(" - ");
      const [yearB, genderB] = b.split(" - ");
      const yearDiff = parseInt(yearA) - parseInt(yearB);
      if (yearDiff !== 0) return yearDiff;
      return (genderA || "").localeCompare(genderB || "");
    }
    // For others, sort alphabetically
    return a.localeCompare(b);
  });

  sortedGroups.forEach((groupName) => {
    groupedPlayers[groupName].sort((a, b) => {
      const yearA = new Date(a.birthday).getFullYear();
      const yearB = new Date(b.birthday).getFullYear();
      if (yearA !== yearB) return yearA - yearB;
      return a.name.localeCompare(b.name);
    });
  });

  // Reset to first tab when filters change
  useEffect(() => {
    if (sortedGroups.length > 0) {
      setActiveTab(sortedGroups[0]);
    }
  }, [groupBy, teamFilter, searchTerm]);

  return (
    <>
      <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <InputGroup className="w-full sm:max-w-sm md:w-80">
            <InputGroupInput
              placeholder="Suche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="secondary"
                onClick={() => setSearchTerm("")}
              >
                {searchTerm ? "Zurücksetzen" : "Suche"}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-full sm:w-55">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="team">Gruppieren nach Team</SelectItem>
              <SelectItem value="year">Gruppieren nach Jahrgang</SelectItem>
              <SelectItem value="stammverein">
                Gruppieren nach Stammverein
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-full sm:w-55">
              <SelectValue placeholder="Alle Teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Teams</SelectItem>
              {[...teams]
                .sort((a, b) => a.name.localeCompare(b.name, "de"))
                .map((team) => (
                  <SelectItem key={team.id} value={String(team.id)}>
                    {team.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="success"
          onClick={() => setNewDialogOpen(true)}
          className="w-full md:w-auto"
        >
          <PlusIcon /> Neuer Spieler
        </Button>
      </div>
      <Tabs
        orientation="vertical"
        value={activeTab}
        onValueChange={setActiveTab}
        className="py-10 gap-10"
        // className="w-full"
      >
        <TabsList
        // variant="line"
        // className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-auto overflow-x-auto"
        >
          {sortedGroups.map((groupName) => (
            <TabsTrigger
              key={groupName}
              value={groupName}
              className="text-sm gap-8 py-1.25 px-3 whitespace-nowrap"
            >
              {groupName}
              <span className="text-gray-400 ml-auto">
                ({groupedPlayers[groupName].length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {sortedGroups.map((groupName) => (
          <TabsContent key={groupName} value={groupName}>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32 sm:w-48">Name</TableHead>
                    <TableHead className="w-20 sm:w-28">Jahrgang</TableHead>
                    <TableHead className="hidden lg:table-cell w-32">
                      Geschlecht
                    </TableHead>
                    <TableHead className="hidden md:table-cell w-40 sm:w-48">
                      Stammverein
                    </TableHead>
                    <TableHead className="w-40 sm:w-64">Teams</TableHead>
                    <TableHead className="w-12 sm:w-16 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedPlayers[groupName].map((player) => (
                    <TableRow key={`${groupName}-${player.id}`}>
                      <TableCell className="w-32 sm:w-48 font-medium">
                        {player.name}
                      </TableCell>
                      <TableCell className="w-20 sm:w-28">
                        {new Date(player.birthday).getFullYear()}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell w-32">
                        {player.gender || "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell w-40 sm:w-48">
                        {player.stammverein || "-"}
                      </TableCell>
                      <TableCell className="w-40 sm:w-64">
                        {player.playerTeams
                          .map((pt) => pt.team.name)
                          .join(", ")}
                      </TableCell>
                      <TableCell className="w-12 sm:w-16 text-right">
                        <PlayerListDropdown
                          onDeleteClick={() => openDeleteDialog(player)}
                          onEditClick={() => openEditDialog(player)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <PlayerDeleteDialog
        open={deleteDialogState.open}
        player={deleteDialogState.player}
        onClose={() => {
          setDeleteDialogState({ open: false, player: null });
          router.refresh();
        }}
      />
      <PlayerEditDialog
        open={editDialogState.open}
        player={editDialogState.player}
        teams={teams}
        onClose={() => {
          setEditDialogState({ open: false, player: null });
          router.refresh();
        }}
      />
      <PlayerNewDialog
        open={newDialogOpen}
        teams={teams}
        onClose={() => {
          setNewDialogOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}

export default PlayerTable;
