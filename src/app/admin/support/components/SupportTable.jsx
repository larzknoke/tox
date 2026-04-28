"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useLocale } from "@/lib/locale-context";
import { SUPPORT_TICKET_STATUSES } from "@/lib/support-ticket";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateTicketStatusAction } from "../actions/update-ticket-status";

const statusVariant = {
  open: "destructive",
  in_progress: "default",
  resolved: "secondary",
  closed: "outline",
};

export default function SupportTable({ tickets: initialTickets }) {
  const { locale, t } = useLocale();
  const [tickets, setTickets] = useState(initialTickets);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailTicket, setDetailTicket] = useState(null);
  const [isPending, startTransition] = useTransition();

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const term = search.toLowerCase();
      const matchesSearch =
        ticket.subject.toLowerCase().includes(term) ||
        ticket.description.toLowerCase().includes(term) ||
        ticket.name.toLowerCase().includes(term) ||
        ticket.email.toLowerCase().includes(term) ||
        String(ticket.id).includes(term);
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  function handleStatusChange(ticketId, status) {
    startTransition(async () => {
      try {
        await updateTicketStatusAction(ticketId, status);
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, status } : ticket,
          ),
        );
        toast.success(t("support.admin.statusUpdated"));
      } catch {
        toast.error(t("support.admin.statusUpdateFailed"));
      }
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-md"
          placeholder={t("support.admin.searchPlaceholder")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-55">
            <SelectValue placeholder={t("support.admin.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("support.admin.allStatuses")}
            </SelectItem>
            {SUPPORT_TICKET_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {t(`support.statuses.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>{t("support.fields.subject")}</TableHead>
              <TableHead>{t("support.fields.type")}</TableHead>
              <TableHead>{t("support.fields.name")}</TableHead>
              <TableHead>{t("support.fields.email")}</TableHead>
              <TableHead>{t("support.fields.status")}</TableHead>
              <TableHead>{t("support.admin.createdAt")}</TableHead>
              <TableHead>{t("support.admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length ? (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>#{ticket.id}</TableCell>
                  <TableCell className="font-medium">
                    {ticket.subject}
                  </TableCell>
                  <TableCell>{t(`support.types.${ticket.type}`)}</TableCell>
                  <TableCell>{ticket.name}</TableCell>
                  <TableCell>{ticket.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={statusVariant[ticket.status] ?? "secondary"}
                    >
                      {t(`support.statuses.${ticket.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(ticket.createdAt),
                      locale === "fr" ? "dd/MM/yyyy HH:mm" : "yyyy-MM-dd HH:mm",
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailTicket(ticket)}
                      >
                        {t("support.admin.details")}
                      </Button>
                      <Select
                        value={ticket.status}
                        onValueChange={(status) =>
                          handleStatusChange(ticket.id, status)
                        }
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-42.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORT_TICKET_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {t(`support.statuses.${status}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  {t("support.admin.noTickets")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={Boolean(detailTicket)}
        onOpenChange={() => setDetailTicket(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("support.admin.ticket")} #{detailTicket?.id}
            </DialogTitle>
          </DialogHeader>

          {detailTicket ? (
            <div className="space-y-3 text-sm">
              <div>
                <strong>{t("support.fields.subject")}:</strong>{" "}
                {detailTicket.subject}
              </div>
              <div>
                <strong>{t("support.fields.type")}:</strong>{" "}
                {t(`support.types.${detailTicket.type}`)}
              </div>
              <div>
                <strong>{t("support.fields.status")}:</strong>{" "}
                {t(`support.statuses.${detailTicket.status}`)}
              </div>
              <div>
                <strong>{t("support.fields.name")}:</strong> {detailTicket.name}
              </div>
              <div>
                <strong>{t("support.fields.email")}:</strong>{" "}
                {detailTicket.email}
              </div>
              <div>
                <strong>{t("support.fields.phone")}:</strong>{" "}
                {detailTicket.phone}
              </div>
              <div>
                <strong>{t("support.admin.userId")}:</strong>{" "}
                {detailTicket.userId || "-"}
              </div>
              <div>
                <strong>{t("support.admin.createdAt")}:</strong>{" "}
                {format(
                  new Date(detailTicket.createdAt),
                  locale === "fr" ? "dd/MM/yyyy HH:mm" : "yyyy-MM-dd HH:mm",
                )}
              </div>
              <div>
                <strong>{t("support.fields.description")}:</strong>
                <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-3">
                  {detailTicket.description}
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
