"use client";
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
import { CheckCircle2, PlusIcon, Trash2, CircleAlert } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { hasRole } from "@/lib/roles";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteTravelReport } from "../actions";
import { toast } from "sonner";
import TravelReportDetailsDialog from "./travelReportDetailsDialog";

function TravelReportTable({ travelReports, session }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [reports, setReports] = useState(travelReports);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isAdminOrKassenwart =
    hasRole(session, "admin") || hasRole(session, "kassenwart");

  const handleDelete = async (id) => {
    if (
      !confirm("Soll diese Fahrtkosten-Abrechnung wirklich gelöscht werden?")
    ) {
      return;
    }

    const result = await deleteTravelReport(id);
    if (result.success) {
      setReports(reports.filter((r) => r.id !== id));
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleRowClick = (reportId) => {
    setSelectedReportId(reportId);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedReportId(null);
  };

  const handleStatusUpdated = (updatedReport) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === updatedReport.id ? updatedReport : report,
      ),
    );
  };

  const selectedReport =
    reports.find((report) => report.id === selectedReportId) || null;

  const filteredReports = reports.filter((report) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      report.destination.toLowerCase().includes(searchLower) ||
      report.team.name.toLowerCase().includes(searchLower) ||
      report.user.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <div className="w-full flex flex-row gap-6 justify-between">
        <InputGroup className="max-w-sm">
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
        <Button variant="success" asChild>
          <Link href="/fahrtkosten/neu">
            <PlusIcon /> Neue Fahrtkosten
          </Link>
        </Button>
      </div>
      <TooltipProvider>
        <Table>
          <TableCaption>
            {isAdminOrKassenwart
              ? "Alle Fahrtkosten-Abrechnungen"
              : `Alle Fahrtkosten-Abrechnungen von ${session?.user?.name || "dir"}`}{" "}
            - {new Date().toLocaleDateString("de-DE")}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Ziel</TableHead>
              <TableHead>Mannschaft</TableHead>
              <TableHead>Benutzer</TableHead>
              <TableHead>Fahrtdatum</TableHead>
              <TableHead>Erstellt am</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Distanz (km)</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead className="text-center">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center text-muted-foreground"
                >
                  {searchTerm
                    ? "Keine Ergebnisse gefunden"
                    : "Keine Fahrtkosten vorhanden"}
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow
                  key={report.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(report.id)}
                >
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>{report.destination}</TableCell>
                  <TableCell>{report.team.name}</TableCell>
                  <TableCell>{report.user.name}</TableCell>
                  <TableCell>
                    {new Date(report.travelDate).toLocaleDateString("de-DE")}
                  </TableCell>
                  <TableCell>
                    {new Date(report.createdAt).toLocaleDateString("de-DE")}
                  </TableCell>
                  <TableCell>
                    {report.status === "paid" ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CheckCircle2
                            className="text-green-700"
                            size={"22px"}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Bezahlt</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CircleAlert
                            className="text-yellow-600"
                            size={"22px"}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ausstehend</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {report.distance}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(report.totalCost)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(report.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Löschen</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TooltipProvider>

      <TravelReportDetailsDialog
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        travelReport={selectedReport}
        session={session}
        onStatusUpdated={handleStatusUpdated}
      />
    </>
  );
}

export default TravelReportTable;
