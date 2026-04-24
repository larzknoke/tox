"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useLocale } from "@/lib/locale-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getOrderPricingSummary } from "@/lib/shipping";
import { Trash2, FileText, Euro, CalendarIcon, ListFilter } from "lucide-react";
import { updateOrderStatusAction } from "../actions/update-order-status";
import { deleteOrderAction } from "../actions/delete-order";
import { generateInvoicePDFAction } from "../actions/generate-invoice-pdf";

const statuses = ["PENDING", "VALIDATED", "PROCESSING", "SHIPPED"];

const statusVariant = {
  PENDING: "secondary",
  VALIDATED: "default",
  PROCESSING: "default",
  SHIPPED: "outline",
};

export default function OrderTable({ orders: initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState();
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [isPending, startTransition] = useTransition();
  const { locale, t } = useLocale();

  const getItemName = (item) => item.name ?? item.designation ?? item.reference;
  const getItemReference = (item) => item.reference ?? "";
  const getItemKey = (item) =>
    `${getItemName(item)}|||${getItemReference(item)}`;

  const itemOptionMap = new Map();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const name = getItemName(item);
      if (!name) return;
      const reference = getItemReference(item);
      const key = getItemKey(item);

      if (!itemOptionMap.has(key)) {
        itemOptionMap.set(key, { key, name, reference });
      }
    });
  });

  const itemOptions = Array.from(itemOptionMap.values()).sort(
    (a, b) =>
      a.name.localeCompare(b.name) || a.reference.localeCompare(b.reference),
  );

  const filtered = orders.filter((o) => {
    const searchTerm = search.toLowerCase();
    const orderDate = format(new Date(o.createdAt), "yyyy-MM-dd");
    const fromDate = dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : null;
    const toDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : null;
    const matchesSearch =
      o.name.toLowerCase().includes(searchTerm) ||
      String(o.id).includes(searchTerm) ||
      o.user?.name?.toLowerCase().includes(searchTerm) ||
      o.user?.email?.toLowerCase().includes(searchTerm);
    const matchesFromDate = !fromDate || orderDate >= fromDate;
    const matchesToDate = !toDate || orderDate <= toDate;
    const matchesItems =
      selectedItemKeys.length === 0 ||
      o.items.some((item) => selectedItemKeys.includes(getItemKey(item)));

    return matchesSearch && matchesFromDate && matchesToDate && matchesItems;
  });

  function handleStatusChange(orderId, newStatus) {
    startTransition(async () => {
      try {
        await updateOrderStatusAction(orderId, newStatus);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        );
        toast.success(t("orders.statusUpdated"));
      } catch {
        toast.error(t("orders.statusUpdateFailed"));
      }
    });
  }

  function handleDelete() {
    if (!deleteOrder) return;
    startTransition(async () => {
      try {
        await deleteOrderAction(deleteOrder.id);
        setOrders((prev) => prev.filter((o) => o.id !== deleteOrder.id));
        toast.success(t("orders.orderDeleted"));
      } catch {
        toast.error(t("orders.orderDeleteFailed"));
      } finally {
        setDeleteOrder(null);
      }
    });
  }

  const [generatingPDFId, setGeneratingPDFId] = useState(null);

  const getPricing = (order) => getOrderPricingSummary(order.items);

  async function handleDownloadInvoicePDF(order) {
    setGeneratingPDFId(order.id);
    try {
      const result = await generateInvoicePDFAction(order.id);
      if (!result.success) {
        throw new Error(result.error);
      }
      const blob = new Blob([new Uint8Array(result.pdfBuffer)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(t("orders.pdfDownloaded"));
    } catch (error) {
      toast.error(t("orders.pdfFailed") + ": " + error.message);
    } finally {
      setGeneratingPDFId(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder={t("orders.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start px-3 font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>{t("orders.dateFilter")}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="justify-start px-3 font-normal"
            >
              <ListFilter className="mr-2 h-4 w-4" />
              {selectedItemKeys.length > 0
                ? t("orders.itemsSelected", { count: selectedItemKeys.length })
                : t("orders.filterItems")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-72 max-h-80 overflow-y-auto"
            align="start"
          >
            <DropdownMenuLabel>{t("orders.orderItems")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {itemOptions.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {t("orders.noItemsAvailable")}
              </div>
            ) : (
              itemOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.key}
                  checked={selectedItemKeys.includes(option.key)}
                  onCheckedChange={(checked) => {
                    setSelectedItemKeys((prev) =>
                      checked
                        ? [...prev, option.key]
                        : prev.filter((itemKey) => itemKey !== option.key),
                    );
                  }}
                  onSelect={(e) => e.preventDefault()}
                >
                  <span>{option.name}</span>
                  {option.reference ? (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({option.reference})
                    </span>
                  ) : null}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {(search ||
          dateRange?.from ||
          dateRange?.to ||
          selectedItemKeys.length > 0) && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearch("");
              setDateRange(undefined);
              setSelectedItemKeys([]);
            }}
          >
            {t("orders.clear")}
          </Button>
        )}
        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length !== 1
            ? t("orders.orderCount_other", { count: filtered.length })
            : t("orders.orderCount_one", { count: filtered.length })}
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("orders.tableOrder")}</TableHead>
              <TableHead>{t("orders.tableCustomer")}</TableHead>
              <TableHead className="text-right">
                {t("orders.tableItems")}
              </TableHead>
              <TableHead className="text-right">
                {t("orders.tableTotal")}
              </TableHead>
              <TableHead>{t("orders.tableStatus")}</TableHead>
              <TableHead className="text-right">
                {t("orders.tableDate")}
              </TableHead>
              <TableHead className="text-right">
                {t("orders.tableActions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  {t("orders.noOrdersFound")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => (
                <TableRow key={order.id}>
                  {(() => {
                    const pricing = getPricing(order);
                    return (
                      <>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              #{order.id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{order.user?.name ?? "—"}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.user?.email ?? "—"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {pricing.totalPacks} {t("orders.packs")}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {pricing.totalTickets.toLocaleString(locale)}{" "}
                            {t("orders.tickets")}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {pricing.shipping.isQuoteRequired
                            ? t("orders.uponRequest")
                            : `€${pricing.grandTotal.toFixed(2)}`}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(v) =>
                              handleStatusChange(order.id, v)
                            }
                            disabled={isPending}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          {new Date(order.createdAt).toLocaleDateString(locale)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDetailOrder(order)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("orders.viewDetails")}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleDownloadInvoicePDF(order)
                                  }
                                  disabled={generatingPDFId === order.id}
                                >
                                  <Euro className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("orders.downloadInvoice")}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setDeleteOrder(order)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("orders.deleteOrder")}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </>
                    );
                  })()}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteOrder}
        onOpenChange={(open) => !open && setDeleteOrder(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("orders.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("orders.deleteDescription", {
                id: deleteOrder?.id ?? "",
                name: deleteOrder?.name ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {t("orders.cancelButton")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending
                ? t("orders.deletingButton")
                : t("orders.deleteButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order detail dialog */}
      <Dialog
        open={!!detailOrder}
        onOpenChange={(open) => !open && setDetailOrder(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailOrder?.name}{" "}
              <Badge
                variant={statusVariant[detailOrder?.status] ?? "secondary"}
                className="ml-2"
              >
                {detailOrder?.status}
              </Badge>
            </DialogTitle>
            <p className="text-xs text-muted-foreground font-mono">
              #{detailOrder?.id}
            </p>
          </DialogHeader>

          {detailOrder && (
            <div className="flex flex-col gap-4">
              {(() => {
                const pricing = getPricing(detailOrder);
                return (
                  <>
                    {/* Customer */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {t("orders.detailCustomer")}
                      </p>
                      <p className="text-sm">
                        {detailOrder.user?.name ?? "—"} (
                        {detailOrder.user?.email ?? "—"})
                      </p>
                    </div>

                    <Separator />

                    {/* Items */}
                    <div className="rounded-md border">
                      <div className="grid grid-cols-[1fr_3rem_6rem_6rem] gap-x-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b bg-muted/40">
                        <span>{t("orders.detailProduct")}</span>
                        <span className="text-right">
                          {t("orders.detailQty")}
                        </span>
                        <span className="text-right">
                          {t("orders.detailUnitPrice")}
                        </span>
                        <span className="text-right">
                          {t("orders.detailTotal")}
                        </span>
                      </div>
                      {detailOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-[1fr_3rem_6rem_6rem] gap-x-4 px-4 py-2.5 text-sm border-b last:border-b-0"
                        >
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {item.designation}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {item.reference} &middot; {item.quantityPerPack}{" "}
                              {t("orders.ticketsPerPack")} &middot;{" "}
                              {(
                                item.quantityPerPack * item.numberOfPacks
                              ).toLocaleString(locale)}{" "}
                              {t("orders.ticketsTotal")}
                            </p>
                          </div>
                          <span className="text-right tabular-nums">
                            {item.numberOfPacks}
                          </span>
                          <span className="text-right tabular-nums">
                            €{item.pricePerPack.toFixed(2)}
                          </span>
                          <span className="text-right font-semibold tabular-nums">
                            €{item.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="grid grid-cols-[1fr_3rem_6rem_6rem] gap-x-4 px-4 py-2.5 text-sm font-semibold bg-muted/40">
                        <span>{t("orders.detailSubtotal")}</span>
                        <span />
                        <span />
                        <span className="text-right tabular-nums">
                          €{pricing.subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-md border p-3 text-sm space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>
                          {pricing.shipping.parcels === 1
                            ? t("orders.detailShipping", {
                                parcels: pricing.shipping.parcels,
                              })
                            : t("orders.detailShippingPlural", {
                                parcels: pricing.shipping.parcels,
                              })}
                        </span>
                        <span>
                          {pricing.shipping.isQuoteRequired
                            ? t("orders.uponRequest")
                            : `€${pricing.shippingCost.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-semibold">
                        <span>{t("orders.detailGrandTotal")}</span>
                        <span>
                          {pricing.shipping.isQuoteRequired
                            ? t("orders.uponRequest")
                            : `€${pricing.grandTotal.toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {t("orders.detailBillingAddress")}
                        </p>
                        {detailOrder.billingAddress ? (
                          <div className="text-sm space-y-0.5 text-muted-foreground">
                            <p className="text-foreground font-medium">
                              {detailOrder.billingAddress.firstName}{" "}
                              {detailOrder.billingAddress.lastName}
                            </p>
                            {detailOrder.billingAddress.company && (
                              <p>{detailOrder.billingAddress.company}</p>
                            )}
                            {detailOrder.billingAddress.vat && (
                              <p>
                                Tax identification number:{" "}
                                {detailOrder.billingAddress.vat}
                              </p>
                            )}
                            <p>{detailOrder.billingAddress.address1}</p>
                            {detailOrder.billingAddress.address2 && (
                              <p>{detailOrder.billingAddress.address2}</p>
                            )}
                            <p>
                              {detailOrder.billingAddress.postalCode}{" "}
                              {detailOrder.billingAddress.city}
                            </p>
                            <p>{detailOrder.billingAddress.country}</p>
                            <p>{detailOrder.billingAddress.phone}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">—</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {t("orders.detailShippingAddress")}
                        </p>
                        {detailOrder.deliveryAddress ? (
                          <div className="text-sm space-y-0.5 text-muted-foreground">
                            <p className="text-foreground font-medium">
                              {detailOrder.deliveryAddress.firstName}{" "}
                              {detailOrder.deliveryAddress.lastName}
                            </p>
                            {detailOrder.deliveryAddress.company && (
                              <p>{detailOrder.deliveryAddress.company}</p>
                            )}
                            <p>{detailOrder.deliveryAddress.address1}</p>
                            {detailOrder.deliveryAddress.address2 && (
                              <p>{detailOrder.deliveryAddress.address2}</p>
                            )}
                            <p>
                              {detailOrder.deliveryAddress.postalCode}{" "}
                              {detailOrder.deliveryAddress.city}
                            </p>
                            <p>{detailOrder.deliveryAddress.country}</p>
                            <p>{detailOrder.deliveryAddress.phone}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">—</p>
                        )}
                      </div>
                    </div>

                    {/* Invoice */}
                    {detailOrder.invoice && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Invoice
                          </p>
                          <p className="text-sm">
                            #{detailOrder.invoice.invoiceNumber} &middot;{" "}
                            {new Date(
                              detailOrder.invoice.invoiceDate,
                            ).toLocaleDateString("de-DE")}{" "}
                            &middot; €{pricing.grandTotal.toFixed(2)}{" "}
                            {detailOrder.invoice.currency}
                          </p>
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
